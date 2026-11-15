import { DatabaseSync } from 'node:sqlite';

const db = new DatabaseSync('seed/backup.sqlite');
const rows = db.prepare('SELECT slug, title, content FROM ec_magazine').all();

console.log('=== All nicole.co.jp links in ec_magazine ===');

rows.forEach(r => {
  if (!r.content) return;
  const blocks = JSON.parse(r.content);
  
  function scan(val, blockIdx) {
    if (!val || typeof val !== 'object') return;
    if (typeof val.href === 'string' && val.href.includes('nicole.co.jp')) {
      console.log(`[${r.slug}] Block #${blockIdx} (markDef link): ${val.href}`);
    }
    if (typeof val.url === 'string' && val.url.includes('nicole.co.jp')) {
      console.log(`[${r.slug}] Block #${blockIdx} (${val._type || 'cta'} url): ${val.url}`);
    }
    Object.values(val).forEach(v => scan(v, blockIdx));
  }

  blocks.forEach((b, i) => scan(b, i));
});
