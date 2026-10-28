import fs from 'fs';
import { DatabaseSync } from 'node:sqlite';

const d1Dir = '.wrangler/state/v3/d1/miniflare-D1DatabaseObject';
const files = fs.readdirSync(d1Dir);
const dbFile = files.find(f => f.endsWith('.sqlite') && !f.includes('metadata') && !f.includes('bak'));
const db = new DatabaseSync(d1Dir + '/' + dbFile);

const row = db.prepare('SELECT * FROM ec_posts WHERE slug = ?').get('2027_new_bmw_ix4_neue_klasse');

function escapeSql(str) {
  if (str === null || str === undefined) return 'NULL';
  return `'` + String(str).replace(/'/g, "''") + `'`;
}

const cols = Object.keys(row);
const vals = cols.map(c => escapeSql(row[c]));

const sql = `INSERT OR REPLACE INTO ec_posts (${cols.join(', ')}) VALUES (${vals.join(', ')});\n`;

fs.writeFileSync('scratch/sync-remote-posts-only.sql', sql, 'utf8');
