import fs from 'fs';
import path from 'path';

const d1Dir = '.wrangler/state/v3/d1/miniflare-D1DatabaseObject';
if (!fs.existsSync(d1Dir)) {
  console.error('D1 directory not found:', d1Dir);
  process.exit(1);
}

const files = fs.readdirSync(d1Dir);
// Get all candidate sqlite files sorted by mtime descending (most recently modified first)
const candidates = files
  .filter(f => f.endsWith('.sqlite') && !f.includes('metadata') && !f.includes('bak'))
  .map(f => ({ name: f, mtime: fs.statSync(path.join(d1Dir, f)).mtimeMs }))
  .sort((a, b) => b.mtime - a.mtime);

const dbFile = candidates[0]?.name;

if (!dbFile) {
  console.error('No D1 SQLite database file found in', d1Dir);
  process.exit(1);
}

const srcDb = path.join(d1Dir, dbFile);
const destDb = path.join('seed', 'backup.sqlite');

fs.mkdirSync('seed', { recursive: true });
fs.copyFileSync(srcDb, destDb);
console.log(`Successfully backed up D1 database from ${srcDb} to ${destDb} (${fs.statSync(destDb).size} bytes)`);

// Also save DB file id so restore knows exact filename
fs.writeFileSync(path.join('seed', 'db-filename.txt'), dbFile, 'utf8');
console.log(`Saved D1 filename ${dbFile} to seed/db-filename.txt`);
