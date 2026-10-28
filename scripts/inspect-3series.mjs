import { DatabaseSync } from 'node:sqlite';
import fs from 'fs';

const d1Dir = '.wrangler/state/v3/d1/miniflare-D1DatabaseObject';
const dbFile = fs.readdirSync(d1Dir).find(f => f.endsWith('.sqlite') && !f.includes('metadata') && !f.includes('bak'));
const db = new DatabaseSync(d1Dir + '/' + dbFile);
const p = db.prepare('SELECT * FROM ec_posts WHERE slug = ?').get('2027_new_bmw_3series_neue_klasse');
console.log('featured_image:', p.featured_image);
const content = JSON.parse(p.content);
console.log('Number of blocks:', content.length);
for (let i = 0; i < content.length; i++) {
  const b = content[i];
  const txt = b.children ? b.children.map(c => c.text).join('') : '';
  console.log(`[${i}] ${b.style || b._type}: ${txt.slice(0, 80)}`);
}
