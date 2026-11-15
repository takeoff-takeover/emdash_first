import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';

const db = new DatabaseSync('seed/backup.sqlite');

function convertUrl(url) {
  if (typeof url !== 'string') return url;
  let u = url.trim();

  // 1. WP preview link
  if (u.includes('?p=11420&post_type=magazine') || u.includes('_ppp=')) {
    return '/magazine/202605_nicole_ev-subsidy-guide';
  }

  // 2. Magazine URLs
  if (u.includes('nicole.co.jp/magazine/')) {
    u = u.replace(/^https?:\/\/(?:www\.)?nicole\.co\.jp\/magazine\//, '/magazine/');
    // trim trailing slash
    if (u.endsWith('/') && u.length > '/magazine/'.length) {
      u = u.slice(0, -1);
    }
    return u;
  }

  // 3. Corporate & brand URLs
  if (u.includes('nicole.co.jp/corporate/nicole-competizione')) {
    return '/corporate/nicole-competizione';
  }
  if (u.includes('nicole.co.jp/mini/')) {
    return '/mini';
  }
  if (u.includes('nicole.co.jp/bmw/x1')) {
    return '/bmw';
  }

  // 4. Contact form URLs
  if (u.includes('nicole.co.jp/contact/')) {
    u = u.replace(/^https?:\/\/(?:www\.)?nicole\.co\.jp\/contact\/?/, '/contact');
    if (!u.includes('?')) {
      u += '?form_type=inquiry';
    }
    return u;
  }

  return url;
}

function processObject(obj) {
  if (!obj || typeof obj !== 'object') return false;
  let changed = false;

  for (const k of Object.keys(obj)) {
    const v = obj[k];
    if (typeof v === 'string') {
      const newV = convertUrl(v);
      if (newV !== v) {
        obj[k] = newV;
        changed = true;
      }
    } else if (typeof v === 'object') {
      if (processObject(v)) changed = true;
    }
  }

  return changed;
}

console.log('=== Step 1: Update ec_magazine and revisions in SQLite ===');
let magUpdated = 0;
let revUpdated = 0;

db.exec('BEGIN TRANSACTION');

const magRows = db.prepare('SELECT id, slug, content FROM ec_magazine').all();
magRows.forEach(r => {
  if (!r.content) return;
  const blocks = JSON.parse(r.content);
  if (processObject(blocks)) {
    magUpdated++;
    db.prepare('UPDATE ec_magazine SET content = ? WHERE id = ?').run(JSON.stringify(blocks), r.id);
  }
});

const revRows = db.prepare("SELECT id, data FROM revisions WHERE collection IN ('magazine', 'pages')").all();
revRows.forEach(r => {
  if (!r.data) return;
  try {
    const data = JSON.parse(r.data);
    if (processObject(data)) {
      revUpdated++;
      db.prepare('UPDATE revisions SET data = ? WHERE id = ?').run(JSON.stringify(data), r.id);
    }
  } catch(e) {}
});

db.exec('COMMIT');
console.log(`Updated ${magUpdated} magazine articles and ${revUpdated} revisions in backup.sqlite.`);

console.log('\n=== Step 2: Update seed/seed.json ===');
const seed = JSON.parse(fs.readFileSync('seed/seed.json', 'utf8'));
let seedMagUpdated = 0;
let seedPagesUpdated = 0;

if (seed.content) {
  if (seed.content.magazine) {
    seed.content.magazine.forEach(entry => {
      if (entry.data && processObject(entry.data)) {
        seedMagUpdated++;
      }
    });
  }
  if (seed.content.pages) {
    seed.content.pages.forEach(entry => {
      if (entry.data && processObject(entry.data)) {
        seedPagesUpdated++;
      }
    });
  }
}

if (seedMagUpdated > 0 || seedPagesUpdated > 0) {
  fs.writeFileSync('seed/seed.json', JSON.stringify(seed, null, 2), 'utf8');
  console.log(`Updated seed.json: ${seedMagUpdated} magazine entries, ${seedPagesUpdated} page entries.`);
}

console.log('\nURL conversion complete!');
