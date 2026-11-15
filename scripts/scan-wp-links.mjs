import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';

const db = new DatabaseSync('seed/backup.sqlite');
const rows = db.prepare('SELECT id, slug, title, content FROM ec_magazine').all();

const wpLinks = [];
const nicoleLinks = [];

function scanObj(obj, slug, title, pathStr = '') {
  if (!obj || typeof obj !== 'object') return;
  for (const k of Object.keys(obj)) {
    const v = obj[k];
    if (typeof v === 'string') {
      if (v.includes('/wp/') || v.includes('/wp-content/') || v.includes('/wp-admin/')) {
        wpLinks.push({ slug, title, path: pathStr + '.' + k, val: v });
      }
      if (v.includes('nicole.co.jp')) {
        nicoleLinks.push({ slug, title, path: pathStr + '.' + k, val: v });
      }
    } else if (typeof v === 'object') {
      scanObj(v, slug, title, pathStr + '.' + k);
    }
  }
}

rows.forEach(r => {
  if (!r.content) return;
  try {
    scanObj(JSON.parse(r.content), r.slug, r.title);
  } catch(e) {}
});

console.log('=== 1. WP Links in ec_magazine content ===');
console.log('Total WP links:', wpLinks.length);
wpLinks.slice(0, 20).forEach(x => console.log(`[${x.slug}] ${x.path}: ${x.val.slice(0, 100)}`));

console.log('\n=== 2. All nicole.co.jp links in ec_magazine content ===');
console.log('Total nicole.co.jp occurrences:', nicoleLinks.length);

const patternCounts = {};
nicoleLinks.forEach(x => {
  const urls = x.val.match(/https?:\/\/[^\s"'<>\n\r]+/g) || [x.val];
  urls.forEach(u => {
    if (u.includes('nicole.co.jp')) {
      patternCounts[u] = (patternCounts[u] || 0) + 1;
    }
  });
});

console.log('\nUnique nicole.co.jp URLs in content:');
Object.entries(patternCounts)
  .sort((a,b) => b[1] - a[1])
  .forEach(([u, count]) => {
    console.log(`  (${count} times) ${u}`);
  });
