import fs from 'node:fs';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { execFileSync } from 'node:child_process';
import { parse } from 'parse5';

// On Windows: node --use-system-ca scripts/audit-published-images.mjs

const base = 'https://my-emdash-site.kaz130.workers.dev';
const localBase = 'http://localhost:4321';
const run = args => execFileSync(process.execPath, ['node_modules/wrangler/bin/wrangler.js', ...args], { encoding: 'utf8', maxBuffer: 32 * 1024 * 1024 });
const tables = ['ec_posts', 'ec_pages', 'ec_magazine', 'ec_locations', 'ec_campaigns', 'media'];
fs.mkdirSync('scratch/image-audit', { recursive: true });
const raw = JSON.parse(run(['d1', 'execute', 'my-emdash-site', '--remote', '--command', tables.map(t => `SELECT * FROM ${t};`).join('\n'), '--json']));
const remote = Object.fromEntries(tables.map((t, i) => [t, raw[i].results]));
fs.writeFileSync('scratch/image-audit/remote-before.json', JSON.stringify(remote, null, 2));
const filename = fs.readFileSync('seed/db-filename.txt', 'utf8').trim();
if (path.basename(filename) !== filename) throw Error('Invalid database filename');
const db = new DatabaseSync(path.join('.wrangler/state/v3/d1/miniflare-D1DatabaseObject', filename), { readOnly: true });
const localMedia = db.prepare('SELECT * FROM media').all();
db.close();
fs.writeFileSync('scratch/image-audit/local-media.json', JSON.stringify(localMedia, null, 2));

async function pool(items, concurrency, fn) {
  let cursor = 0;
  await Promise.all(Array.from({ length: concurrency }, async () => { while (cursor < items.length) { const i = cursor++; await fn(items[i], i); } }));
}
async function check(url) {
  try {
    let r = await fetch(url, { method: 'HEAD', signal: AbortSignal.timeout(20000) });
    if (r.status === 405) { r = await fetch(url, { signal: AbortSignal.timeout(20000) }); await r.body?.cancel(); }
    const type = r.headers.get('content-type') || '';
    let validImage = type.startsWith('image/');
    if (r.ok && !validImage && new URL(url).pathname.endsWith('.avif')) {
      const body = await fetch(url, { signal: AbortSignal.timeout(20000) });
      const bytes = Buffer.from(await body.arrayBuffer());
      validImage = bytes.subarray(4, 8).toString() === 'ftyp' && /avif|avis/.test(bytes.subarray(8, 32).toString());
    }
    return { status: r.status, type, ok: r.ok && validImage };
  } catch (e) { return { ok: false, error: e.message }; }
}
const routes = new Set(['/', '/magazine/', '/posts/', '/locations/', '/location/', '/campaigns/', '/bmw/', '/mini/', '/corporate/', '/philosophy/', '/esg_sdgs/', '/contact/', '/customer-policy/', '/privacystatement/']);
for (const [t, prefix] of [['ec_posts', 'posts'], ['ec_pages', 'pages'], ['ec_magazine', 'magazine'], ['ec_locations', 'location'], ['ec_campaigns', 'campaigns']]) {
  for (const row of remote[t]) if (!row.deleted_at && row.status === 'published' && row.slug) routes.add(`/${prefix}/${encodeURIComponent(row.slug)}/`);
}
const images = new Map();
const pages = [];
function add(value, page) {
  if (!value || /^(data:|blob:|#|about:)/i.test(value)) return;
  try {
    const u = new URL(value, base + page);
    if (!['http:', 'https:'].includes(u.protocol)) return;
    u.hash = '';
    if (!images.has(u.href)) images.set(u.href, new Set());
    images.get(u.href).add(page);
  } catch {}
}
await pool([...routes], 4, async (route, i) => {
  try {
    const r = await fetch(base + route, { signal: AbortSignal.timeout(30000) });
    const html = await r.text();
    pages.push({ route, status: r.status, url: r.url });
    if (!r.ok) return;
    const walk = node => {
      const attrs = Object.fromEntries((node.attrs || []).map(a => [a.name, a.value]));
      if (node.tagName === 'img' || node.tagName === 'source' && !attrs.type?.startsWith('video/')) {
        for (const k of ['src', 'data-src', 'data-lazy-src']) add(attrs[k], route);
        for (const k of ['srcset', 'data-srcset', 'data-lazy-srcset']) if (attrs[k]) for (const v of attrs[k].split(',')) add(v.trim().split(/\s+/)[0], route);
      }
      for (const m of (attrs.style || '').matchAll(/url\(["']?([^"')]+)["']?\)/g)) add(m[1], route);
      for (const child of node.childNodes || []) walk(child);
    };
    walk(parse(html));
  } catch (e) { pages.push({ route, error: e.message }); }
  if ((i + 1) % 25 === 0) console.log(`Scanned ${i + 1}/${routes.size} pages`);
});
// Also inspect every locally registered upload, including images selected through the CMS.
for (const row of localMedia) if (row.mime_type?.startsWith('image/') && row.storage_key) add('/_emdash/api/media/file/' + row.storage_key, '(local media library)');
const results = [];
await pool([...images], 6, async ([url, usedOn], i) => {
  let result = await check(url);
  if (!result.ok && (!result.status || result.status >= 500 || result.status === 429)) result = await check(url);
  const item = { url, pages: [...usedOn], ...result };
  if (!result.ok) {
    const u = new URL(url);
    const localPath = u.pathname;
    if (u.origin === base || /\.(jpe?g|png|webp|gif|avif|svg)$/i.test(localPath)) {
      item.localUrl = localBase + localPath;
      item.local = await check(item.localUrl);
      const file = path.resolve('public', '.' + decodeURIComponent(localPath));
      if (file.startsWith(path.resolve('public') + path.sep) && fs.existsSync(file)) item.publicFile = file;
    }
  }
  results.push(item);
  if ((i + 1) % 100 === 0) console.log(`Checked ${i + 1}/${images.size} images`);
});
const report = { createdAt: new Date().toISOString(), pages, images: results, failures: results.filter(r => !r.ok) };
fs.writeFileSync('scratch/image-audit/report.json', JSON.stringify(report, null, 2));
console.log(JSON.stringify({ pages: pages.length, images: results.length, failures: report.failures.length, recoverable: report.failures.filter(r => r.local?.ok || r.publicFile).length, failedPages: pages.filter(p => p.status !== 200) }, null, 2));
