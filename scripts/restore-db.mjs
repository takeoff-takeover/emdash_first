import fs from 'fs';
import path from 'path';

const seedDb = path.join('seed', 'backup.sqlite');
if (!fs.existsSync(seedDb)) {
  console.log('No seed/backup.sqlite found, skipping restore.');
  process.exit(0);
}

const dbFilenameFile = path.join('seed', 'db-filename.txt');
const dbFilename = fs.existsSync(dbFilenameFile)
  ? fs.readFileSync(dbFilenameFile, 'utf8').trim()
  : 'c5f74f54de1b54dfe248af0cae042e755774e9e90fc1e7dc6e84e3d6d7130474.sqlite';

const targetDir = path.join('.wrangler', 'state', 'v3', 'd1', 'miniflare-D1DatabaseObject');
const targetDb = path.join(targetDir, dbFilename);

fs.mkdirSync(targetDir, { recursive: true });

// Always restore or keep in sync if not exists
if (!fs.existsSync(targetDb)) {
  fs.copyFileSync(seedDb, targetDb);
  console.log(`[Restore] Copied D1 database to ${targetDb} (${fs.statSync(targetDb).size} bytes)`);
} else {
  console.log(`[Restore] Existing D1 database found at ${targetDb}, skipping overwrite.`);
}
