const fs = require('fs');
const path = require('path');
const { DatabaseSync } = require('node:sqlite');

const PLACEHOLDER_JPG = 'public/images/placeholder-replace.jpg';
if (!fs.existsSync(PLACEHOLDER_JPG)) {
  console.error('Placeholder image not found at', PLACEHOLDER_JPG);
  process.exit(1);
}

const seedPath = 'seed/seed.json';
const seed = JSON.parse(fs.readFileSync(seedPath, 'utf8'));

// 1. 欠損しているローカル画像パスの収集とプレースホルダーファイルのコピー配備
function isMissingLocalPath(src) {
  if (!src || typeof src !== 'string') return false;
  const s = src.trim();
  if (!s || s === 'undefined' || s.startsWith('http://') || s.startsWith('https://')) return false;
  const local = path.join('public', s.startsWith('/') ? s.slice(1) : s);
  return !fs.existsSync(local);
}

const deployedPaths = new Set();

function deployPlaceholderToLocalPath(src) {
  if (!src || typeof src !== 'string') return;
  const s = src.trim();
  if (!s || s === 'undefined' || s.startsWith('http://') || s.startsWith('https://')) return;
  if (!s.startsWith('/uploads/') && !s.startsWith('/_emdash/')) return;

  const destPath = path.join('public', s.startsWith('/') ? s.slice(1) : s);
  if (!fs.existsSync(destPath)) {
    fs.mkdirSync(path.dirname(destPath), { recursive: true });
    fs.copyFileSync(PLACEHOLDER_JPG, destPath);
    deployedPaths.add(destPath);
  }
}

const DEFAULT_IMAGE_OBJ = {
  id: '01M6PLACEHOLDERREPLACEIMAGE01',
  provider: 'external',
  src: '/images/placeholder-replace.jpg',
  alt: '【写真未設定】管理画面から実写真を差し替えてください'
};

let featImagesFixed = 0;
let contentImagesFixed = 0;

// 全コレクションの検査と修正
for (const [colName, items] of Object.entries(seed.content)) {
  if (!Array.isArray(items)) continue;

  for (const item of items) {
    const slug = item.slug || item.id;
    const title = item.data?.title || item.title || '';

    // A. featured_image の検査・配備・正規化
    let feat = item.data?.featured_image || item.featured_image;
    let featSrc = typeof feat === 'string' ? feat : (feat?.src || '');

    if (featSrc && isMissingLocalPath(featSrc)) {
      deployPlaceholderToLocalPath(featSrc);
    }

    // もし空文字または未設定の場合、正式なプレースホルダーオブジェクトを付与
    if (!featSrc || featSrc === 'undefined' || featSrc === '/images/no-image.svg') {
      const fixedFeat = { ...DEFAULT_IMAGE_OBJ, alt: `${title}（アイキャッチ写真未設定）` };
      if (item.data) item.data.featured_image = fixedFeat;
      else item.featured_image = fixedFeat;
      featImagesFixed++;
    } else if (typeof feat === 'object' && feat !== null) {
      // 既存オブジェクトの保持
      if (!feat.id) feat.id = '01M6PLACEHOLDERREPLACEIMAGE01';
      if (!feat.provider) feat.provider = 'external';
    }

    // B. 本文画像（content）の検査・配備・正規化
    const content = item.data?.content || item.content;
    if (Array.isArray(content)) {
      for (const block of content) {
        if (!block || typeof block !== 'object') continue;

        if (block._type === 'image') {
          let s = block.src || block.asset?._ref || block.asset?.url;
          if (s && isMissingLocalPath(s)) {
            deployPlaceholderToLocalPath(s);
          }
          // IDのみ（数値ID等）や未定義の場合
          if (!s || s === 'undefined' || /^\d+$/.test(s) || s.startsWith('/images/no-image.svg')) {
            block.src = '/images/placeholder-replace.jpg';
            block.asset = {
              _type: 'reference',
              _ref: '/images/placeholder-replace.jpg',
              url: '/images/placeholder-replace.jpg'
            };
            block.alt = block.alt || '【写真未設定】管理画面から実写真を差し替えてください';
            contentImagesFixed++;
          }
        }

        if (block._type === 'split_media') {
          let s = block.image || block.media || block.src;
          if (s && isMissingLocalPath(s)) {
            deployPlaceholderToLocalPath(s);
          }
          if (!s || s === 'undefined' || s.startsWith('/images/no-image.svg')) {
            block.image = '/images/placeholder-replace.jpg';
            block.src = '/images/placeholder-replace.jpg';
            contentImagesFixed++;
          }
        }
      }
    }
  }
}

console.log(`\n=== File Deployment Summary ===`);
console.log(`Deployed placeholder to ${deployedPaths.size} missing local image paths.`);
console.log(`Fixed empty featured_images in seed: ${featImagesFixed}`);
console.log(`Fixed missing content images in seed: ${contentImagesFixed}`);

// seed.json 保存
fs.writeFileSync(seedPath, JSON.stringify(seed, null, 2), 'utf8');
console.log(`Updated ${seedPath}`);

// 2. ローカル SQLite DB（ec_magazine, ec_posts）も完全同期
const d1Dir = '.wrangler/state/v3/d1/miniflare-D1DatabaseObject';
const files = fs.existsSync(d1Dir) ? fs.readdirSync(d1Dir) : [];
const candidates = files
  .filter(f => f.endsWith('.sqlite') && !f.includes('metadata') && !f.includes('bak'))
  .map(f => ({ name: f, mtime: fs.statSync(path.join(d1Dir, f)).mtimeMs }))
  .sort((a, b) => b.mtime - a.mtime);

const dbs = [
  'seed/backup.sqlite',
  ...candidates.map(c => path.join(d1Dir, c.name))
];

for (const dbPath of dbs) {
  if (!fs.existsSync(dbPath)) continue;
  const db = new DatabaseSync(dbPath);

  // ec_magazine
  const magRows = db.prepare('SELECT id, slug, title, content, featured_image FROM ec_magazine').all();
  for (const row of magRows) {
    let changed = false;
    let feat = row.featured_image;
    let content = [];
    try { content = JSON.parse(row.content); } catch {}

    // featured_image 検査
    let featSrc = '';
    if (feat) {
      if (feat.startsWith('{')) {
        try { featSrc = JSON.parse(feat).src || ''; } catch {}
      } else {
        featSrc = feat;
      }
    }

    if (featSrc && isMissingLocalPath(featSrc)) {
      deployPlaceholderToLocalPath(featSrc);
    }

    if (!featSrc || featSrc === 'undefined' || featSrc === '/images/no-image.svg') {
      feat = JSON.stringify({
        id: '01M6PLACEHOLDERREPLACEIMAGE01',
        provider: 'external',
        src: '/images/placeholder-replace.jpg',
        alt: `${row.title}（アイキャッチ写真未設定）`
      });
      changed = true;
    }

    // content 検査
    if (Array.isArray(content)) {
      for (const b of content) {
        if (!b || typeof b !== 'object') continue;
        if (b._type === 'image') {
          let s = b.src || b.asset?._ref || b.asset?.url;
          if (s && isMissingLocalPath(s)) deployPlaceholderToLocalPath(s);
          if (!s || s === 'undefined' || /^\d+$/.test(s) || s.startsWith('/images/no-image.svg')) {
            b.src = '/images/placeholder-replace.jpg';
            b.asset = {
              _type: 'reference',
              _ref: '/images/placeholder-replace.jpg',
              url: '/images/placeholder-replace.jpg'
            };
            b.alt = b.alt || '【写真未設定】管理画面から実写真を差し替えてください';
            changed = true;
          }
        }
        if (b._type === 'split_media') {
          let s = b.image || b.media || b.src;
          if (s && isMissingLocalPath(s)) deployPlaceholderToLocalPath(s);
          if (!s || s === 'undefined' || s.startsWith('/images/no-image.svg')) {
            b.image = '/images/placeholder-replace.jpg';
            b.src = '/images/placeholder-replace.jpg';
            changed = true;
          }
        }
      }
    }

    if (changed) {
      db.prepare(`
        UPDATE ec_magazine 
        SET content = ?, featured_image = ?, updated_at = datetime('now')
        WHERE id = ?
      `).run(JSON.stringify(content), feat, row.id);
    }
  }

  // ec_posts
  try {
    const postRows = db.prepare('SELECT id, slug, title, content, featured_image FROM ec_posts').all();
    for (const row of postRows) {
      let changed = false;
      let feat = row.featured_image;
      let content = [];
      try { content = JSON.parse(row.content); } catch {}

      let featSrc = '';
      if (feat) {
        if (feat.startsWith('{')) {
          try { featSrc = JSON.parse(feat).src || ''; } catch {}
        } else {
          featSrc = feat;
        }
      }

      if (featSrc && isMissingLocalPath(featSrc)) {
        deployPlaceholderToLocalPath(featSrc);
      }

      if (!featSrc || featSrc === 'undefined' || featSrc === '/images/no-image.svg') {
        feat = JSON.stringify({
          id: '01M6PLACEHOLDERREPLACEIMAGE01',
          provider: 'external',
          src: '/images/placeholder-replace.jpg',
          alt: `${row.title}（アイキャッチ写真未設定）`
        });
        changed = true;
      }

      if (Array.isArray(content)) {
        for (const b of content) {
          if (!b || typeof b !== 'object') continue;
          if (b._type === 'image') {
            let s = b.src || b.asset?._ref || b.asset?.url;
            if (s && isMissingLocalPath(s)) deployPlaceholderToLocalPath(s);
            if (!s || s === 'undefined' || /^\d+$/.test(s) || s.startsWith('/images/no-image.svg')) {
              b.src = '/images/placeholder-replace.jpg';
              b.asset = {
                _type: 'reference',
                _ref: '/images/placeholder-replace.jpg',
                url: '/images/placeholder-replace.jpg'
              };
              b.alt = b.alt || '【写真未設定】管理画面から実写真を差し替えてください';
              changed = true;
            }
          }
        }
      }

      if (changed) {
        db.prepare(`
          UPDATE ec_posts 
          SET content = ?, featured_image = ?, updated_at = datetime('now')
          WHERE id = ?
        `).run(JSON.stringify(content), feat, row.id);
      }
    }
  } catch (e) {}

  console.log(`Synchronized all missing images to placeholders in ${dbPath}`);
}
