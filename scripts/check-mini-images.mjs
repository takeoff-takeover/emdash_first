import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';

async function checkMini() {
  const res = await fetch('http://localhost:4321/mini');
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

  console.log(`Total unique image URLs on /mini: ${srcs.size}`);

  let missing = 0;
  for (const src of srcs) {
    const url = src.startsWith('http') ? src : `http://localhost:4321${src.startsWith('/') ? '' : '/'}${src}`;
    try {
      const imgRes = await fetch(url);
      if (imgRes.status !== 200) {
        console.warn(`[HTTP ${imgRes.status}] Missing: ${src}`);
        missing++;
      }
    } catch (e) {
      console.warn(`Error on ${src}:`, e.message);
      missing++;
    }
  }

  console.log(`Missing or non-200 images on /mini: ${missing} / ${srcs.size}`);
}

checkMini();
