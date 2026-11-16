const { DatabaseSync } = require('node:sqlite');
const fs = require('fs');
const path = require('path');

// 1. seed/seed.json の読み込み
const seedPath = 'seed/seed.json';
const seed = JSON.parse(fs.readFileSync(seedPath, 'utf8'));

let totalConvertedCtas = 0;
let totalRemovedJsonLd = 0;
let modifiedArticles = 0;

function cleanAndConvertContent(content, articleSlug, articleTitle) {
  if (!Array.isArray(content)) return { newContent: content, changed: false };

  const newContent = [];
  let changed = false;

  for (let i = 0; i < content.length; i++) {
    const block = content[i];
    if (!block || typeof block !== 'object') {
      newContent.push(block);
      continue;
    }

    // A. 誤って本文に混入した生の JSON-LD ブロックを検知・除去
    if (block._type === 'block') {
      const fullText = (block.children || []).map(c => c.text || '').join('');
      if (fullText.includes('@context') && (fullText.includes('schema.org') || fullText.includes('@graph'))) {
        console.log(`  [Removed JSON-LD block] in ${articleSlug}`);
        totalRemovedJsonLd++;
        changed = true;
        continue; // 除去
      }
    }

    // B. 裸のリンクブロックを CTA ブロックに変換
    if (block._type === 'block') {
      const children = block.children || [];
      const markDefs = block.markDefs || [];
      const fullText = children.map(c => c.text || '').join('').trim();
      const linkMarks = markDefs.filter(m => m._type === 'link');

      // リンクが1つあり、ブロック全体のテキストがそのリンクのテキストとほぼ一致する場合
      if (linkMarks.length === 1) {
        const linkHref = linkMarks[0].href || '';
        const linkKey = linkMarks[0]._key;
        const linkSpans = children.filter(c => Array.isArray(c.marks) && c.marks.includes(linkKey));
        const linkText = linkSpans.map(c => c.text || '').join('').trim();

        // CTA判定条件
        const isCtaText = /予約|案内|問い合わせ|詳しく|詳細|探す|ラインナップ|公式サイト|オフィシャル|相談|購入可能|新車|試乗|エントリー/i.test(fullText);
        const isCtaUrl = /contact|inquiry|lineup|reserve|dealer|pre-owned|preorder/i.test(linkHref) || (linkHref.startsWith('http') && fullText.length < 50);

        if (fullText === linkText || fullText.replace(/\s+/g, '') === linkText.replace(/\s+/g, '') || (isCtaText && fullText.length < 60)) {
          if (isCtaText || isCtaUrl) {
            console.log(`  [Converted to CTA] in ${articleSlug}: "${linkText}" -> ${linkHref}`);
            newContent.push({
              _type: 'cta',
              _key: block._key || `cta_${Date.now().toString(36)}_${i}`,
              label: linkText || fullText,
              url: linkHref,
              style: 'secondary',
              shape: 'pill',
              align: 'center',
              target_blank: linkHref.startsWith('http') && !linkHref.includes('localhost') ? 'blank' : 'auto'
            });
            totalConvertedCtas++;
            changed = true;
            continue;
          }
        }
      }
    }

    // 通常ブロックはそのまま保持
    newContent.push(block);
  }

  // C. 「ブッフローエが日本に託した、最後の傑作」のアイキャッチ画像の差し替え
  return { newContent, changed };
}

// 全コレクション（magazine, posts 等）の点検
for (const [colName, items] of Object.entries(seed.content)) {
  if (!Array.isArray(items)) continue;
  for (const item of items) {
    const slug = item.slug || item.id;
    const title = item.data?.title || item.title;
    const rawContent = item.data?.content || item.content;
    const { newContent, changed } = cleanAndConvertContent(rawContent, slug, title);

    if (item.slug === '202603_bornandmadeinbuchloe') {
      // アイキャッチを有効な差し替えプレースホルダーJPGに更新
      if (item.data) {
        item.data.featured_image = {
          id: '01M6PLACEHOLDERREPLACEIMAGE01',
          provider: 'external',
          src: '/images/placeholder-replace.jpg',
          alt: 'ブッフローエが日本に託した、最後の傑作'
        };
      }
    }

    if (changed) {
      if (item.data && item.data.content) {
        item.data.content = newContent;
      } else {
        item.content = newContent;
      }
      modifiedArticles++;
    }
  }
}

console.log(`\n=== Summary ===`);
console.log(`Modified articles in seed: ${modifiedArticles}`);
console.log(`Converted CTAs: ${totalConvertedCtas}`);
console.log(`Removed JSON-LD text: ${totalRemovedJsonLd}`);

// seed.json の書き込み
fs.writeFileSync(seedPath, JSON.stringify(seed, null, 2), 'utf8');
console.log(`Updated ${seedPath}`);

// 2. ローカル SQLite DB（ec_magazine, ec_posts）も同期更新
const d1Dir = '.wrangler/state/v3/d1/miniflare-D1DatabaseObject';
const files = fs.readdirSync(d1Dir);
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

  // ec_magazine の更新
  const magRows = db.prepare('SELECT id, slug, content, featured_image FROM ec_magazine').all();
  for (const row of magRows) {
    let content = [];
    try {
      content = JSON.parse(row.content);
    } catch {
      continue;
    }
    const { newContent, changed } = cleanAndConvertContent(content, row.slug, '');
    let featImg = row.featured_image;

    if (row.slug === '202603_bornandmadeinbuchloe') {
      featImg = JSON.stringify({
        id: '01M6PLACEHOLDERREPLACEIMAGE01',
        provider: 'external',
        src: '/images/placeholder-replace.jpg',
        alt: 'ブッフローエが日本に託した、最後の傑作'
      });
    }

    if (changed || row.slug === '202603_bornandmadeinbuchloe') {
      db.prepare(`
        UPDATE ec_magazine 
        SET content = ?, featured_image = ?, updated_at = datetime('now')
        WHERE id = ?
      `).run(JSON.stringify(newContent), featImg, row.id);
      console.log(`Updated ec_magazine row ${row.slug} in ${dbPath}`);
    }
  }

  // ec_posts の更新
  try {
    const postRows = db.prepare('SELECT id, slug, content FROM ec_posts').all();
    for (const row of postRows) {
      let content = [];
      try {
        content = JSON.parse(row.content);
      } catch {
        continue;
      }
      const { newContent, changed } = cleanAndConvertContent(content, row.slug, '');
      if (changed) {
        db.prepare(`
          UPDATE ec_posts 
          SET content = ?, updated_at = datetime('now')
          WHERE id = ?
        `).run(JSON.stringify(newContent), row.id);
        console.log(`Updated ec_posts row ${row.slug} in ${dbPath}`);
      }
    }
  } catch (e) {
    // ec_posts が存在しない場合はスキップ
  }
}
