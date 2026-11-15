import { DatabaseSync } from 'node:sqlite';

const db = new DatabaseSync('seed/backup.sqlite');

console.log('=== Checking all tables for nicole.co.jp and wp links ===');

const tables = db.prepare(
  "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE '_emdash_fts%' AND name NOT LIKE 'sqlite_%'"
).all().map(r => r.name);

tables.forEach(tableName => {
  try {
    const cols = db.prepare(`PRAGMA table_info(${tableName})`).all().map(c => c.name);
    const rows = db.prepare(`SELECT * FROM ${tableName}`).all();
    
    rows.forEach(r => {
      cols.forEach(col => {
        const val = r[col];
        if (typeof val === 'string') {
          // Check for ?p= or wp-admin or wp preview
          if (val.includes('post_type=') || val.includes('preview=') || val.includes('/wp-admin/')) {
            console.log(`[WP PREVIEW/ADMIN LINK] ${tableName}.${col} (id: ${r.id || r.slug || 'unknown'}): ${val.slice(0, 120)}`);
          }
          // Check for nicole.co.jp/wp/ (external absolute WP path)
          if (val.includes('nicole.co.jp/wp/')) {
            console.log(`[EXT WP PATH] ${tableName}.${col} (id: ${r.id || r.slug || 'unknown'}): ${val.slice(0, 120)}`);
          }
          // Check for nicole.co.jp/magazine/
          if (val.includes('nicole.co.jp/magazine/')) {
            console.log(`[NICOLE MAGAZINE URL] ${tableName}.${col} (id: ${r.id || r.slug || 'unknown'}): ${val.slice(0, 120)}`);
          }
        }
      });
    });
  } catch(e) {}
});
