import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import crypto from 'node:crypto';
import { DatabaseSync } from 'node:sqlite';
import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

// Preserve CMS image IDs and storage keys: copying public/uploads alone misses these files.
export async function syncCmsMedia({ apply = false } = {}) {
  const run = args => execFileSync(process.execPath, ['node_modules/wrangler/bin/wrangler.js', ...args], { encoding: 'utf8', maxBuffer: 32 * 1024 * 1024 });
  const filename = fs.readFileSync('seed/db-filename.txt', 'utf8').trim();
  if (path.basename(filename) !== filename) throw Error('Invalid database filename');
  const db = new DatabaseSync(path.join('.wrangler/state/v3/d1/miniflare-D1DatabaseObject', filename), { readOnly: true });
  let media, content;
  try {
    media = db.prepare("SELECT * FROM media WHERE status = 'ready'").all();
    content = ['ec_posts', 'ec_pages', 'ec_magazine', 'ec_locations', 'ec_campaigns'].map(table => JSON.stringify(db.prepare(`SELECT * FROM ${table} WHERE deleted_at IS NULL AND status = 'published'`).all())).join('\n');
  } finally { db.close(); }
  const needed = media.filter(row => row.mime_type?.startsWith('image/') && row.storage_key && (content.includes(row.id) || content.includes(row.storage_key)));
  // Older imports can retain image objects after losing their media-library rows.
  const files = [];
  const scan = directory => { for (const entry of fs.readdirSync(directory, { withFileTypes: true })) { const file = path.join(directory, entry.name); if (entry.isDirectory()) scan(file); else files.push(file); } };
  scan('public');
  const inspect = value => {
    if (typeof value === 'string' && /^[\[{]/.test(value)) { try { inspect(JSON.parse(value)); } catch {} }
    else if (Array.isArray(value)) value.forEach(inspect);
    else if (value && typeof value === 'object') {
      if (value.provider === 'local' && value.id && value.filename && value.meta?.storageKey && !needed.some(row => row.id === value.id)) {
        const candidates = files.filter(file => path.basename(file) === value.filename);
        const hashes = new Set(candidates.map(file => crypto.createHash('sha1').update(fs.readFileSync(file)).digest('hex')));
        if (candidates.length && hashes.size === 1) {
          const buffer = fs.readFileSync(candidates[0]);
          needed.push({ id: value.id, filename: value.filename, mime_type: value.mimeType, size: buffer.length, width: value.width, height: value.height, alt: value.alt || null, caption: value.meta.caption || null, storage_key: value.meta.storageKey, content_hash: 'sha1:' + [...hashes][0], created_at: new Date().toISOString(), author_id: null, status: 'ready', folder_id: null, _sourceFile: candidates[0] });
        }
      }
      Object.values(value).forEach(inspect);
    }
  };
  content.split('\n').forEach(text => inspect(JSON.parse(text)));
  const remote = JSON.parse(run(['d1', 'execute', 'my-emdash-site', '--remote', '--command', 'SELECT * FROM media; PRAGMA table_info(media);', '--json']));
  const columns = new Set(remote[1].results.map(row => row.name));
  const quote = value => value == null ? 'NULL' : typeof value === 'number' ? String(value) : `'${String(value).replaceAll("'", "''")}'`;
  const report = [];
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'emdash-media-'));
  try {
    for (const row of needed) {
      const current = remote[0].results.find(r => r.id === row.id);
      if (current && current.storage_key !== row.storage_key) throw Error(`Conflicting storage key for ${row.id}`);
      const url = `https://my-emdash-site.kaz130.workers.dev/_emdash/api/media/file/${encodeURIComponent(row.storage_key)}`;
      const response = await fetch(url, { method: 'HEAD', signal: AbortSignal.timeout(20000) });
      const missingFile = !response.ok || !response.headers.get('content-type')?.startsWith('image/');
      if (!missingFile && current) continue;
      const item = { id: row.id, filename: row.filename, storageKey: row.storage_key, missingFile, missingMetadata: !current, applied: false };
      report.push(item);
      console.log(`${apply ? 'Sync' : 'Needs sync'}: ${row.filename}`);
      if (!apply) continue;
      const file = path.join(temp, row.id);
      if (missingFile) {
        let buffer;
        try {
          if (row._sourceFile) buffer = fs.readFileSync(row._sourceFile);
          else {
          const local = await fetch(`http://localhost:4321/_emdash/api/media/file/${encodeURIComponent(row.storage_key)}`, { signal: AbortSignal.timeout(20000) });
          if (!local.ok || !local.headers.get('content-type')?.startsWith('image/')) throw Error('Local image not served');
          buffer = Buffer.from(await local.arrayBuffer());
          }
        } catch {
          // Local R2 can be read without a running dev server.
          run(['r2', 'object', 'get', `my-emdash-media/${row.storage_key}`, '--local', '--file', file]);
          buffer = fs.readFileSync(file);
        }
        if (row.content_hash?.startsWith('sha1:') && 'sha1:' + crypto.createHash('sha1').update(buffer).digest('hex') !== row.content_hash) throw Error(`Image checksum mismatch: ${row.filename}`);
        fs.writeFileSync(file, buffer);
        run(['r2', 'object', 'put', `my-emdash-media/${row.storage_key}`, '--remote', '--file', file, '--content-type', row.mime_type]);
      }
      if (!current) {
        const keys = Object.keys(row).filter(key => columns.has(key));
        const sql = `INSERT INTO media (${keys.map(k => `"${k}"`).join(',')}) VALUES (${keys.map(k => quote(row[k])).join(',')}) ON CONFLICT(id) DO NOTHING;`;
        run(['d1', 'execute', 'my-emdash-site', '--remote', '--command', sql, '--json']);
      }
      const verified = await fetch(url, { signal: AbortSignal.timeout(30000) });
      if (!verified.ok || !verified.headers.get('content-type')?.startsWith('image/')) throw Error(`Published image verification failed: ${row.filename}`);
      const bytes = Buffer.from(await verified.arrayBuffer());
      if (row.content_hash?.startsWith('sha1:') && 'sha1:' + crypto.createHash('sha1').update(bytes).digest('hex') !== row.content_hash) throw Error(`Published checksum mismatch: ${row.filename}`);
      item.applied = true;
      console.log(`Verified: ${row.filename}`);
    }
  } finally {
    // Delete only files created in our unique temporary directory.
    for (const entry of fs.readdirSync(temp)) fs.unlinkSync(path.join(temp, entry));
    fs.rmdirSync(temp);
  }
  console.log(`CMS media: ${needed.length} referenced images checked; ${report.length} needed synchronization.`);
  return report;
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  syncCmsMedia({ apply: process.argv.includes('--apply') }).then(report => {
    fs.mkdirSync('scratch/image-audit', { recursive: true });
    fs.writeFileSync('scratch/image-audit/cms-sync-result.json', JSON.stringify(report, null, 2));
  }).catch(error => { console.error(error.message); process.exitCode = 1; });
}
