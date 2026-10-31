// scripts/generate-remote-locations-sql.mjs
import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';

const DB_PATH = '.wrangler/state/v3/d1/miniflare-D1DatabaseObject/c5f74f54de1b54dfe248af0cae042e755774e9e90fc1e7dc6e84e3d6d7130474.sqlite';
const db = new DatabaseSync(DB_PATH);

let sql = '-- Sync locations schema and data to remote D1\n';

// 1. _emdash_collections の locations レコード
const coll = db.prepare("SELECT * FROM _emdash_collections WHERE slug = 'locations'").get();
if (coll) {
  const keys = Object.keys(coll).map(k => `"${k}"`).join(', ');
  const vals = Object.values(coll).map(v => v === null ? 'NULL' : `'${String(v).replace(/'/g, "''")}'`).join(', ');
  sql += `INSERT OR REPLACE INTO _emdash_collections (${keys}) VALUES (${vals});\n\n`;
}

// 2. ec_locations テーブルの CREATE TABLE 文
const cols = db.prepare("PRAGMA table_info(ec_locations)").all();
if (cols.length > 0) {
  sql += `CREATE TABLE IF NOT EXISTS ec_locations (\n`;
  const colDefs = cols.map(c => `  "${c.name}" ${c.type || 'TEXT'} ${c.pk ? 'PRIMARY KEY' : ''}`.trim());
  sql += colDefs.join(',\n');
  sql += `\n);\n\n`;
}

// 3. _emdash_fields の locations フィールド定義
const fields = db.prepare("SELECT * FROM _emdash_fields WHERE collection_id = '01M5WLOCAT000000000000001'").all();
sql += `DELETE FROM _emdash_fields WHERE collection_id = '01M5WLOCAT000000000000001';\n`;
for (const f of fields) {
  const keys = Object.keys(f).map(k => `"${k}"`).join(', ');
  const vals = Object.values(f).map(v => v === null ? 'NULL' : `'${String(v).replace(/'/g, "''")}'`).join(', ');
  sql += `INSERT INTO _emdash_fields (${keys}) VALUES (${vals});\n`;
}
sql += '\n';

// 4. ec_locations のデータレコード
const locRows = db.prepare("SELECT * FROM ec_locations").all();
for (const row of locRows) {
  const keys = Object.keys(row).map(k => `"${k}"`).join(', ');
  const vals = Object.values(row).map(v => v === null ? 'NULL' : `'${String(v).replace(/'/g, "''")}'`).join(', ');
  sql += `INSERT OR REPLACE INTO ec_locations (${keys}) VALUES (${vals});\n`;
}

fs.writeFileSync('seed/sync_remote_locations.sql', sql);
console.log('Successfully generated seed/sync_remote_locations.sql, size:', sql.length);
