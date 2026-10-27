import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';

async function check() {
  const res = await fetch('http://localhost:4321/bmw');
  const html = await res.text();

  // Extract all img src
  const imgRegex = /<img[^>]+src=["']([^"']+)["']/g;
  let m;
  const srcs = new Set();
  while ((m = imgRegex.exec(html)) !== null) {
    srcs.add(m[1]);
  }

  // Also check srcset
  const srcsetRegex = /srcset=["']([^"']+)["']/g;
  while ((m = srcsetRegex.exec(html)) !== null) {
    const parts = m[1].split(',').map(s => s.trim().split(' ')[0]);
    parts.forEach(p => srcs.add(p));
  }

  // Also check background-image: url(...)
  const bgRegex = /url\(['"]?([^'")\s]+)['"]?\)/g;
  while ((m = bgRegex.exec(html)) !== null) {
    if (m[1].match(/\.(png|jpe?g|webp|svg|gif)/i)) {
      srcs.add(m[1]);
    }
  }

  console.log(`Total unique image URLs on /bmw: ${srcs.size}`);

  const results = [];
  for (const src of srcs) {
    // Check if local file exists in public
    const localRel = src.startsWith('/') ? src.slice(1) : src;
    const localPath = path.join('public', localRel);
    const exists = fs.existsSync(localPath);

    // Test HTTP
    const url = src.startsWith('http') ? src : `http://localhost:4321${src.startsWith('/') ? '' : '/'}${src}`;
    let status = 0;
    try {
      const imgRes = await fetch(url);
      status = imgRes.status;
    } catch (e) {
      status = e.message;
    }

    results.push({ src, exists, status, localPath });
  }

  const missing = results.filter(r => !r.exists || r.status !== 200);
  console.log(`Missing or non-200 images: ${missing.length} / ${results.length}`);
  if (missing.length > 0) {
    console.log('Sample missing images (up to 20):');
    missing.slice(0, 20).forEach(m => console.log(`  [HTTP ${m.status}] exists: ${m.exists} -> src: ${m.src} (path: ${m.localPath})`));
  }

  // Also check vehicle model images specifically
  console.log('\n--- Vehicle Model Images Check ---');
  const models = JSON.parse(fs.readFileSync('src/data/models.json', 'utf8'));
  const bmwModels = models.filter(m => m.brand === 'BMW');
  for (const model of bmwModels) {
    const p = path.join('public', model.image.startsWith('/') ? model.image.slice(1) : model.image);
    console.log(`Model: ${model.name} | Image: ${model.image} | File exists: ${fs.existsSync(p)}`);
  }
}

check();
