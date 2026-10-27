import fs from 'fs';
import path from 'path';
import { DatabaseSync } from 'node:sqlite';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

// 1. Collect all nicole.co.jp upload URLs from src, seed, and SQLite
const foundUrls = new Set();

function scanDir(dir) {
  for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, f.name);
    if (f.isDirectory() && !['node_modules', '.git', '.wrangler', 'dist', 'public'].includes(f.name)) {
      scanDir(full);
    } else if (f.isFile() && (f.name.endsWith('.astro') || f.name.endsWith('.ts') || f.name.endsWith('.json') || f.name.endsWith('.css') || f.name.endsWith('.html'))) {
      const code = fs.readFileSync(full, 'utf8');
      const matches = code.matchAll(/https:\/\/www\.nicole\.co\.jp\/wp\/wp-content\/uploads\/[^\s"'()><\\]+/gi);
      for (const m of matches) {
        foundUrls.add(m[0]);
      }
    }
  }
}

scanDir('src');
scanDir('seed');

// Also scan SQLite ec_posts and ec_pages
const d1Dir = '.wrangler/state/v3/d1/miniflare-D1DatabaseObject';
let db = null;
if (fs.existsSync(d1Dir)) {
  const files = fs.readdirSync(d1Dir);
  const dbFile = files.find(f => f.endsWith('.sqlite') && !f.includes('metadata') && !f.includes('bak'));
  if (dbFile) {
    db = new DatabaseSync(path.join(d1Dir, dbFile));
    const posts = db.prepare('SELECT featured_image, content FROM ec_posts').all();
    for (const p of posts) {
      const fullText = (p.featured_image || '') + ' ' + (p.content || '');
      const matches = fullText.matchAll(/https:\/\/www\.nicole\.co\.jp\/wp\/wp-content\/uploads\/[^\s"'()><\\]+/gi);
      for (const m of matches) foundUrls.add(m[0]);
    }
    const pages = db.prepare('SELECT content FROM ec_pages').all();
    for (const p of pages) {
      const matches = (p.content || '').matchAll(/https:\/\/www\.nicole\.co\.jp\/wp\/wp-content\/uploads\/[^\s"'()><\\]+/gi);
      for (const m of matches) foundUrls.add(m[0]);
    }
  }
}

console.log(`Found ${foundUrls.size} unique upload URLs to download.`);

// Clean URLs (remove query params or trailing punctuation if any)
function cleanUrl(rawUrl) {
  let u = rawUrl.replace(/[\),;]+$/, '');
  const qIdx = u.indexOf('?');
  if (qIdx !== -1) u = u.slice(0, qIdx);
  return u;
}

const cleanedUrls = new Set();
for (const raw of foundUrls) {
  cleanedUrls.add(cleanUrl(raw));
}

console.log(`Cleaned up to ${cleanedUrls.size} target URLs.`);

// Ensure public/uploads exists
const baseTargetDir = path.resolve('public/uploads');
if (!fs.existsSync(baseTargetDir)) {
  fs.mkdirSync(baseTargetDir, { recursive: true });
}

// Download helper with concurrency
async function downloadFile(url) {
  // Extract relative path after /wp-content/uploads/
  const prefix = 'https://www.nicole.co.jp/wp/wp-content/uploads/';
  if (!url.startsWith(prefix)) return null;

  let relPath = url.slice(prefix.length);
  try {
    relPath = decodeURIComponent(relPath);
  } catch (e) {}

  const localPath = path.join(baseTargetDir, relPath);
  const localDir = path.dirname(localPath);

  if (fs.existsSync(localPath) && fs.statSync(localPath).size > 0) {
    return { url, localPath, skipped: true };
  }

  if (!fs.existsSync(localDir)) {
    fs.mkdirSync(localDir, { recursive: true });
  }

  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } });
    if (!res.ok) {
      // Try encoded URL if decoded was fetched, or vice versa
      const encodedUrl = encodeURI(url);
      if (encodedUrl !== url) {
        const res2 = await fetch(encodedUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } });
        if (res2.ok) {
          const buf = await res2.arrayBuffer();
          fs.writeFileSync(localPath, Buffer.from(buf));
          return { url, localPath, size: buf.byteLength, success: true };
        }
      }
      return { url, error: `HTTP ${res.status}` };
    }
    const buf = await res.arrayBuffer();
    fs.writeFileSync(localPath, Buffer.from(buf));
    return { url, localPath, size: buf.byteLength, success: true };
  } catch (err) {
    return { url, error: err.message };
  }
}

// Concurrency pool
async function pool(items, concurrency, fn) {
  const results = [];
  const executing = [];
  for (const item of items) {
    const p = Promise.resolve().then(() => fn(item));
    results.push(p);
    if (concurrency <= items.length) {
      const e = p.then(() => executing.splice(executing.indexOf(e), 1));
      executing.push(e);
      if (executing.length >= concurrency) {
        await Promise.race(executing);
      }
    }
  }
  return Promise.all(results);
}

async function main() {
  console.log('Starting parallel downloads (concurrency 6)...');
  const targetList = Array.from(cleanedUrls);
  let doneCount = 0;

  const results = await pool(targetList, 6, async (url) => {
    const res = await downloadFile(url);
    doneCount++;
    if (doneCount % 20 === 0 || doneCount === targetList.length) {
      console.log(`Progress: ${doneCount} / ${targetList.length}...`);
    }
    return res;
  });

  const success = results.filter(r => r && (r.success || r.skipped));
  const failed = results.filter(r => r && r.error);

  console.log(`\nDownload finished!`);
  console.log(`- Success/Skipped: ${success.length}`);
  console.log(`- Failed: ${failed.length}`);

  if (failed.length > 0) {
    console.log('\nFailed downloads:');
    failed.forEach(f => console.log(`  ${f.url} -> ${f.error}`));
  }

  // Calculate total downloaded size in public/uploads
  let totalBytes = 0;
  let fileCount = 0;
  function countFiles(dir) {
    for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, f.name);
      if (f.isDirectory()) countFiles(full);
      else {
        fileCount++;
        totalBytes += fs.statSync(full).size;
      }
    }
  }
  countFiles(baseTargetDir);
  console.log(`Total files in public/uploads: ${fileCount} files (${(totalBytes / 1024 / 1024).toFixed(2)} MB)`);
}

main().catch(console.error);
