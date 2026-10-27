import { DatabaseSync } from 'node:sqlite';
import fs from 'fs';
import path from 'path';

const d1Dir = '.wrangler/state/v3/d1/miniflare-D1DatabaseObject';
if (fs.existsSync(d1Dir)) {
  const files = fs.readdirSync(d1Dir);
  const dbFile = files.find(f => f.endsWith('.sqlite') && !f.includes('metadata') && !f.includes('bak'));
  if (dbFile) {
    const db = new DatabaseSync(path.join(d1Dir, dbFile));
    const options = db.prepare("SELECT * FROM options").all();
    console.log('Options count:', options.length);
    options.forEach(o => console.log(`  ${o.name} = ${o.value}`));
  }
}
