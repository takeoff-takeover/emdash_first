import fs from 'node:fs';
import path from 'node:path';

// On Windows: node --use-system-ca scripts/repair-published-images.mjs --apply

// Run the audit first. Restore only the exact photograph named by a broken URL.
const report = JSON.parse(fs.readFileSync('scratch/image-audit/report.json', 'utf8'));
const results = [];
const apply = process.argv.includes('--apply');
let cursor = 0;
await Promise.all(Array.from({ length: 4 }, async () => {
  while (cursor < report.failures.length) {
    const item = report.failures[cursor++];
    const url = new URL(item.url);
    if (url.pathname.includes('/_emdash/')) continue; // handled by sync-cms-media
    const internal = url.origin === 'https://my-emdash-site.kaz130.workers.dev';
    let source = item.url;
    if (internal && url.pathname.startsWith('/uploads/')) source = 'https://www.nicole.co.jp/wp/wp-content' + url.pathname;
    else if (internal && url.pathname.startsWith('/wp-content/uploads/')) source = 'https://www.nicole.co.jp/wp' + url.pathname;
    else if (internal) continue;
    const result = { url: item.url, source, pages: item.pages, restored: false };
    try {
      const response = await fetch(source, { signal: AbortSignal.timeout(30000) });
      result.status = response.status;
      result.type = response.headers.get('content-type');
      let avifBytes;
      if (response.ok && !result.type?.startsWith('image/') && new URL(source).pathname.endsWith('.avif')) avifBytes = Buffer.from(await response.arrayBuffer());
      const validAvif = avifBytes && avifBytes.subarray(4, 8).toString() === 'ftyp' && /avif|avis/.test(avifBytes.subarray(8, 32).toString());
      if (response.ok && (result.type?.startsWith('image/') || validAvif)) {
        if (internal && apply) {
          const file = path.resolve('public', '.' + decodeURIComponent(url.pathname));
          if (!file.startsWith(path.resolve('public') + path.sep)) throw Error('Invalid target path');
          const buffer = avifBytes || Buffer.from(await response.arrayBuffer());
          fs.mkdirSync(path.dirname(file), { recursive: true });
          fs.writeFileSync(file, buffer);
          result.restored = true;
          result.file = file;
        } else if (!avifBytes) await response.body?.cancel();
        result.availableAtSource = true;
      } else await response.body?.cancel();
    } catch (error) { result.error = error.message; }
    results.push(result);
    if (results.length % 100 === 0) console.log(`Rechecked ${results.length} image sources`);
  }
}));
fs.writeFileSync('scratch/image-audit/source-recovery.json', JSON.stringify(results, null, 2));
console.log(JSON.stringify({ checked: results.length, restored: results.filter(r => r.restored).length, availableExternal: results.filter(r => r.availableAtSource && !r.restored).length, unavailableAtSource: results.filter(r => !r.availableAtSource).length }, null, 2));
