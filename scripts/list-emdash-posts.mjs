import { DatabaseSync } from 'node:sqlite';
import fs from 'fs';
import path from 'path';

const d1Dir = '.wrangler/state/v3/d1/miniflare-D1DatabaseObject';
if (fs.existsSync(d1Dir)) {
  const files = fs.readdirSync(d1Dir);
  const dbFile = files.find(f => f.endsWith('.sqlite') && !f.includes('metadata') && !f.includes('bak'));
  if (dbFile) {
    const db = new DatabaseSync(path.join(d1Dir, dbFile));
    const posts = db.prepare('SELECT id, slug, title, status FROM ec_posts').all();
    console.log('Total posts in ec_posts:', posts.length);
    posts.forEach(p => console.log(`  [${p.id}] slug: "${p.slug}" | title: "${p.title}" (${p.status})`));
  } else {
    console.log('No sqlite db file found');
  }
} else {
  console.log('No D1 dir found');
}
