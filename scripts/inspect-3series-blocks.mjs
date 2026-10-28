import { DatabaseSync } from 'node:sqlite';
import fs from 'fs';

const d1Dir = '.wrangler/state/v3/d1/miniflare-D1DatabaseObject';
const dbFile = fs.readdirSync(d1Dir).find(f => f.endsWith('.sqlite') && !f.includes('metadata') && !f.includes('bak'));
const db = new DatabaseSync(d1Dir + '/' + dbFile);
const p = db.prepare('SELECT * FROM ec_posts WHERE slug = ?').get('2027_new_bmw_3series_neue_klasse');
const content = JSON.parse(p.content);
console.log('Slider 3:', JSON.stringify(content[3], null, 2));
console.log('Table 4:', JSON.stringify(content[4], null, 2));
console.log('Accordion 18:', JSON.stringify(content[18], null, 2));
