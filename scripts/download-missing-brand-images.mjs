import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

async function fetchFromRemote(relPath) {
  const clean = relPath.replace(/^\/(wp\/)?(wp-content\/)?uploads\//, '');
  const candidateUrls = [
    `https://www.nicole.co.jp/wp/wp-content/uploads/${clean}`,
    `https://www.nicole.co.jp/wp-content/uploads/${clean}`,
    `https://www.nicole.co.jp/uploads/${clean}`
  ];

  for (const url of candidateUrls) {
    try {
      const res = await fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
      });
      if (res.ok) {
        return { buffer: await res.buffer(), url };
      }
    } catch (e) {}
  }
  return null;
}

async function downloadMissing(pageUrl) {
  const res = await fetch(pageUrl);
  const html = await res.text();

  const srcs = new Set();
  const imgRegex = /<img[^>]+src=["']([^"']+)["']/g;
  let m;
  while ((m = imgRegex.exec(html)) !== null) srcs.add(m[1]);

  const srcsetRegex = /srcset=["']([^"']+)["']/g;
  while ((m = srcsetRegex.exec(html)) !== null) {
    const parts = m[1].split(',').map(s => s.trim().split(' ')[0]);
    parts.forEach(p => srcs.add(p));
  }

  const bgRegex = /url\(['"]?([^'")\s]+)['"]?\)/g;
  while ((m = bgRegex.exec(html)) !== null) {
    if (m[1].match(/\.(png|jpe?g|webp|svg|gif)/i)) {
      srcs.add(m[1]);
    }
  }

  console.log(`Checking ${srcs.size} images from ${pageUrl}...`);
  let downloaded = 0;
  let failed = 0;

  for (const src of srcs) {
    if (!src.startsWith('/') && !src.startsWith('http')) continue;
    const cleanSrc = src.startsWith('http') ? new URL(src).pathname : src;
    
    // Check if file already exists in public
    const target1 = path.join('public', cleanSrc.replace(/^\//, ''));
    const target2 = path.join('public/uploads', cleanSrc.replace(/^\/(wp-content\/)?uploads\//, ''));
    const target3 = path.join('public/wp-content/uploads', cleanSrc.replace(/^\/(wp-content\/)?uploads\//, ''));

    if (fs.existsSync(target1) || fs.existsSync(target2) || fs.existsSync(target3)) {
      continue;
    }

    console.log(`Downloading missing asset for: ${cleanSrc}`);
    const result = await fetchFromRemote(cleanSrc);
    if (result) {
      fs.mkdirSync(path.dirname(target1), { recursive: true });
      fs.writeFileSync(target1, result.buffer);
      if (cleanSrc.includes('/uploads/')) {
        fs.mkdirSync(path.dirname(target2), { recursive: true });
        fs.writeFileSync(target2, result.buffer);
        fs.mkdirSync(path.dirname(target3), { recursive: true });
        fs.writeFileSync(target3, result.buffer);
      }
      console.log(`  -> Successfully downloaded from ${result.url}`);
      downloaded++;
    } else {
      console.warn(`  -> Could not find on remote: ${cleanSrc}`);
      failed++;
    }
  }
  console.log(`Finished ${pageUrl}: downloaded ${downloaded}, failed ${failed}`);
}

async function run() {
  await downloadMissing('http://localhost:4321/bmw');
  await downloadMissing('http://localhost:4321/mini');
}

run();
