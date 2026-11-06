import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import path from 'node:path';

// Local databases only. Back up affected records before removing template samples.
const apply = process.argv.includes('--apply');
const filename = fs.readFileSync('seed/db-filename.txt', 'utf8').trim();
if (path.basename(filename) !== filename || !filename.endsWith('.sqlite')) throw new Error('Invalid database filename');
const files = [path.join('.wrangler/state/v3/d1/miniflare-D1DatabaseObject', filename), 'seed/backup.sqlite'];
const sampleSlugs = ['the-case-for-static', 'learning-in-public', 'small-tools-big-impact', 'designing-with-constraints', 'a-weekend-with-a-side-project', 'notes-on-simplicity'];
const plans = [];
for (const file of files) {
  if (!fs.existsSync(file)) continue;
  const db = new DatabaseSync(file, { readOnly: true });
  const changes = [];
  for (const table of ['ec_posts', 'ec_magazine']) {
    for (const row of db.prepare(`SELECT * FROM ${table} WHERE deleted_at IS NULL`).all()) {
      if (sampleSlugs.includes(row.slug)) changes.push({ table, row, softDelete: true });
    }
  }
  for (const row of db.prepare('SELECT * FROM ec_pages WHERE slug = ? AND deleted_at IS NULL').all('about')) {
    if (row.content?.includes('A place for writing about software')) changes.push({ table: 'ec_pages', row, softDelete: true });
  }
  for (const row of db.prepare('SELECT * FROM _emdash_sections').all()) {
    if ((row.slug === 'about-author' && row.content?.includes('A software developer who writes')) || (row.slug === 'newsletter-signup' && row.content?.includes('Get notified when new posts are published. No spam'))) changes.push({ table: '_emdash_sections', row });
  }
  for (const row of db.prepare('SELECT * FROM _emdash_widgets').all()) {
    if (row.content?.includes('A blog about software, design, and the occasional stray thought.')) changes.push({ table: '_emdash_widgets', row });
  }
  for (const row of db.prepare('SELECT * FROM _emdash_menu_items WHERE custom_url = ?').all('/pages/about')) changes.push({ table: '_emdash_menu_items', row });
  db.close();
  plans.push({ file, changes });
}
for (const { file, changes } of plans) console.log(`${file}: ${changes.length} sample records ${apply ? 'to remove' : '(preview; use --apply)'}`);
if (apply && plans.some(plan => plan.changes.length)) {
  fs.mkdirSync('scratch', { recursive: true });
  fs.writeFileSync(`scratch/sample-cleanup-${new Date().toISOString().replace(/[:.]/g, '-')}.json`, JSON.stringify(plans, null, 2));
  for (const { file, changes } of plans) {
    const db = new DatabaseSync(file);
    db.exec('BEGIN IMMEDIATE');
    try {
      for (const { table, row, softDelete } of changes) {
        if (softDelete) db.prepare(`UPDATE ${table} SET deleted_at = ? WHERE id = ? AND deleted_at IS NULL`).run(new Date().toISOString(), row.id);
        else db.prepare(`DELETE FROM ${table} WHERE id = ?`).run(row.id);
      }
      db.exec('COMMIT');
    } catch (error) {
      db.exec('ROLLBACK');
      throw error;
    } finally { db.close(); }
  }
}
