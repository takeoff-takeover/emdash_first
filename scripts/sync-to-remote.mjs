import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { DatabaseSync } from 'node:sqlite';
import { execSync } from 'node:child_process';

// 1. 環境変数の読み込み (.env)
if (fs.existsSync('.env')) {
  const envContent = fs.readFileSync('.env', 'utf8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
      const idx = trimmed.indexOf('=');
      const key = trimmed.slice(0, idx).trim();
      const val = trimmed.slice(idx + 1).trim();
      if (!process.env[key]) {
        process.env[key] = val;
      }
    }
  }
}

const EMDASH_URL = process.env.EMDASH_URL || 'https://my-emdash-site.kaz130.workers.dev';
const EMDASH_TOKEN = process.env.EMDASH_TOKEN;

if (!EMDASH_TOKEN) {
  console.error('❌ EMDASH_TOKEN is not set in .env! Cannot sync to remote.');
  process.exit(1);
}

const args = process.argv.slice(2);
const mediaOnly = args.includes('--media-only');

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function getMimeType(filename) {
  const ext = path.extname(filename).toLowerCase();
  switch (ext) {
    case '.jpg':
    case '.jpeg':
      return 'image/jpeg';
    case '.png':
      return 'image/png';
    case '.webp':
      return 'image/webp';
    case '.svg':
      return 'image/svg+xml';
    case '.gif':
      return 'image/gif';
    case '.pdf':
      return 'application/pdf';
    default:
      return 'application/octet-stream';
  }
}

function walk(dir) {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else {
      results.push(file);
    }
  });
  return results;
}

function computeSha1(buffer) {
  return 'sha1:' + crypto.createHash('sha1').update(buffer).digest('hex');
}

// ==============================================================
// STEP 1: メディア画像の同期（Elementor / WordPress + X4 等）
// ==============================================================
async function syncMedia() {
  console.log('\n========================================');
  console.log('📦 [1/2] メディアライブラリの同期を開始...');
  console.log(`🌐 接続先: ${EMDASH_URL}`);
  console.log('========================================');

  // リモートの既存メディアファイル一覧とハッシュを取得
  console.log('🔍 リモートの登録済みメディアを取得中...');
  let existingRemoteFilenames = new Set();
  let existingRemoteHashes = new Set();
  try {
    const out = execSync(
      'npx wrangler d1 execute my-emdash-site --remote --command "SELECT filename, content_hash FROM media;" --json',
      { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] }
    );
    const parsed = JSON.parse(out);
    if (parsed && parsed[0] && parsed[0].results) {
      parsed[0].results.forEach(r => {
        if (r.filename) existingRemoteFilenames.add(r.filename);
        if (r.content_hash) existingRemoteHashes.add(r.content_hash);
      });
    }
  } catch (err) {
    console.warn('⚠️ D1からの既存一覧取得に失敗しました。API経由で続行します。');
  }

  console.log(`ℹ️ リモート登録済みメディア数: ${existingRemoteFilenames.size} 件`);

  // public/uploads 内の全ファイルをスキャン
  const allFiles = walk('public/uploads').filter(f => !f.endsWith('.DS_Store'));
  // WordPressの自動生成リサイズサムネイル (-300x200等) を除外してオリジナル原本のみ抽出
  const isResized = f => /-\d+x\d+\.(jpe?g|png|webp)$/i.test(f);
  const isRasterImage = f => /\.(jpe?g|png|webp|gif)$/i.test(f);
  const mainImages = allFiles.filter(f => !isResized(f) && isRasterImage(f));

  console.log(`📁 uploads 内のオリジナル画像: ${mainImages.length} 件`);

  // ファイル名またはハッシュですでに登録されているかチェック
  const toUpload = mainImages.filter(filePath => {
    const filename = path.basename(filePath);
    if (existingRemoteFilenames.has(filename)) return false;
    try {
      const buffer = fs.readFileSync(filePath);
      const hash = computeSha1(buffer);
      if (existingRemoteHashes.has(hash)) return false;
    } catch {}
    return true;
  });

  console.log(`🚀 新規アップロード対象: ${toUpload.length} 件`);

  if (toUpload.length === 0) {
    console.log('✅ すべての画像がリモートのメディアライブラリに同期済みです。');
    return;
  }

  const uploadEndpoint = `${EMDASH_URL}/_emdash/api/media`;
  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < toUpload.length; i++) {
    const filePath = toUpload[i];
    const filename = path.basename(filePath);
    const mimeType = getMimeType(filename);
    const progress = `[${i + 1}/${toUpload.length}]`;

    let uploaded = false;
    for (let attempt = 1; attempt <= 4; attempt++) {
      try {
        const buffer = fs.readFileSync(filePath);
        const formData = new FormData();
        formData.append('file', new Blob([buffer], { type: mimeType }), filename);
        formData.append('alt', filename.replace(/[-_]/g, ' ').replace(/\.[^.]+$/, ''));

        const res = await fetch(uploadEndpoint, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${EMDASH_TOKEN}`
          },
          body: formData
        });

        if (res.ok) {
          successCount++;
          uploaded = true;
          process.stdout.write(`\r  ${progress} ✔ 登録完了: ${filename.slice(0, 42).padEnd(42)}`);
          break;
        } else if (res.status === 503 || res.status === 429) {
          // レート制限やCPUリミット時は少し長めに待機
          await sleep(2000 * attempt);
        } else {
          console.error(`\n  ${progress} ❌ エラー (${res.status}): ${filename}`);
          break;
        }
      } catch (e) {
        await sleep(1500 * attempt);
      }
    }

    if (!uploaded) {
      failCount++;
    }

    // WorkersのCPUレート制限を回避するためウェイト（500ms）
    await sleep(500);
  }

  console.log(`\n\n🎉 メディア同期完了: 今回登録 ${successCount} 件, スキップ/エラー ${failCount} 件`);
}

// ==============================================================
// STEP 2: 記事（ec_posts）の同期
// ==============================================================
async function syncArticles() {
  if (mediaOnly) return;

  console.log('\n========================================');
  console.log('📝 [2/2] 記事データの同期を開始...');
  console.log('========================================');

  const localDbPath = '.wrangler/state/v3/d1/miniflare-D1DatabaseObject/c5f74f54de1b54dfe248af0cae042e755774e9e90fc1e7dc6e84e3d6d7130474.sqlite';
  if (!fs.existsSync(localDbPath)) {
    console.log('ℹ️ ローカルSQLiteが見つかりません。記事同期をスキップします。');
    return;
  }

  const db = new DatabaseSync(localDbPath);
  const localPosts = db.prepare('SELECT id, slug, status, title, excerpt, content, related_location, featured_image, featured_image_sp, published_at, locale FROM ec_posts').all();

  console.log(`ℹ️ ローカルの記事数: ${localPosts.length} 件`);

  // リモートの既存slug一覧
  let remoteSlugs = new Set();
  try {
    const out = execSync(
      'npx wrangler d1 execute my-emdash-site --remote --command "SELECT slug FROM ec_posts;" --json',
      { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] }
    );
    const parsed = JSON.parse(out);
    if (parsed && parsed[0] && parsed[0].results) {
      parsed[0].results.forEach(r => remoteSlugs.add(r.slug));
    }
  } catch (err) {
    console.warn('⚠️ リモート記事一覧の取得に失敗しました。');
  }

  const missingInRemote = localPosts.filter(p => !remoteSlugs.has(p.slug));
  console.log(`🚀 リモートへ未反映の記事: ${missingInRemote.length} 件`);

  if (missingInRemote.length === 0) {
    console.log('✅ すべての記事がリモートと同期済みです。');
    return;
  }

  // 一括インサート用SQLを生成してリモートD1に実行
  const statements = missingInRemote.map(p => {
    const escape = (str) => str != null ? `'${String(str).replace(/'/g, "''")}'` : 'NULL';
    return `INSERT INTO ec_posts (id, slug, status, title, excerpt, content, related_location, featured_image, featured_image_sp, published_at, locale, created_at, updated_at) VALUES (${escape(p.id)}, ${escape(p.slug)}, ${escape(p.status || 'published')}, ${escape(p.title)}, ${escape(p.excerpt)}, ${escape(p.content)}, ${escape(p.related_location)}, ${escape(p.featured_image)}, ${escape(p.featured_image_sp)}, ${escape(p.published_at)}, ${escape(p.locale || 'en')}, datetime('now'), datetime('now'));`;
  });

  const sqlFile = '/tmp/sync_posts.sql';
  fs.writeFileSync(sqlFile, statements.join('\n'), 'utf8');

  try {
    console.log(`📤 ${missingInRemote.length} 件の記事をリモートD1に反映中...`);
    execSync(`npx wrangler d1 execute my-emdash-site --remote --file ${sqlFile} -y`, { stdio: 'inherit' });
    console.log('✅ 記事の同期が完了しました。');
  } catch (err) {
    console.error('❌ 記事の同期中にエラーが発生しました:', err.message);
  } finally {
    if (fs.existsSync(sqlFile)) fs.unlinkSync(sqlFile);
  }
}

// 実行
(async () => {
  try {
    await syncMedia();
    await syncArticles();
    console.log('\n🌟 すべての同期処理が完了しました！');
  } catch (err) {
    console.error('❌ 同期処理失敗:', err);
    process.exit(1);
  }
})();
