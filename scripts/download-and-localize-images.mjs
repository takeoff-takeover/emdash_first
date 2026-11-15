import https from 'node:https';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';

const agent = new https.Agent({ rejectUnauthorized: false });

function downloadFile(url, dest, maxRedirects = 5) {
  return new Promise((resolve) => {
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    if (fs.existsSync(dest) && fs.statSync(dest).size > 0) {
      return resolve({ cached: true, size: fs.statSync(dest).size });
    }

    function get(currentUrl, redirectsLeft) {
      if (redirectsLeft <= 0) {
        return resolve({ error: 'Too many redirects' });
      }

      const client = currentUrl.startsWith('https:') ? https : http;
      const req = client.get(
        currentUrl,
        {
          agent: currentUrl.startsWith('https:') ? agent : undefined,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
          }
        },
        res => {
          if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
            let nextUrl = res.headers.location;
            if (nextUrl.startsWith('/')) {
              const u = new URL(currentUrl);
              nextUrl = `${u.protocol}//${u.host}${nextUrl}`;
            }
            return get(nextUrl, redirectsLeft - 1);
          }

          if (res.statusCode !== 200) {
            return resolve({ failed: true, status: res.statusCode });
          }

          const file = fs.createWriteStream(dest);
          res.pipe(file);
          file.on('finish', () => {
            file.close(() => resolve({ success: true, size: fs.statSync(dest).size }));
          });
        }
      );

      req.on('error', err => {
        if (fs.existsSync(dest)) fs.unlinkSync(dest);
        resolve({ error: err.message });
      });
    }

    get(url, maxRedirects);
  });
}

async function run() {
  console.log('=== Step 1: Scan strictly valid external URLs ===');
  const db = new DatabaseSync('seed/backup.sqlite');
  const rows = db.prepare('SELECT id, slug, title, content FROM ec_magazine').all();

  const urlMap = new Map();

  function scan(val) {
    if (!val || typeof val !== 'object') return;
    for (const k of Object.keys(val)) {
      const v = val[k];
      if (typeof v === 'string') {
        const matches = v.match(/https?:\/\/[^\s"'<>\n\r]+nicole\.co\.jp\/wp\/wp-content\/uploads\/[^\s"'<>\n\r]+/g);
        if (matches) {
          matches.forEach(m => {
            const relPath = m.replace(/^https?:\/\/[^\/]+\/wp\/wp-content\/uploads\//, '');
            const localPath = '/uploads/wp/' + relPath;
            const localFsPath = path.join('public', 'uploads', 'wp', relPath);
            urlMap.set(m, { localPath, localFsPath });
          });
        }
      } else if (typeof v === 'object') {
        scan(v);
      }
    }
  }

  rows.forEach(r => {
    if (!r.content) return;
    try {
      scan(JSON.parse(r.content));
    } catch(e) {}
  });

  console.log(`Found ${urlMap.size} valid individual external image URLs.`);

  if (urlMap.size === 0) {
    console.log('All images are already localized!');
    return;
  }

  console.log('\n=== Step 2: Download remaining external images ===');
  const entries = Array.from(urlMap.entries());
  let completed = 0;
  let successCount = 0;
  let failCount = 0;
  const concurrency = 8;

  async function worker(queue) {
    for (const [url, info] of queue) {
      const res = await downloadFile(url, info.localFsPath);
      completed++;
      if (res.success || res.cached) {
        successCount++;
      } else {
        failCount++;
        console.warn(`[Failed ${completed}/${entries.length}] ${url} (status: ${res.status || res.error})`);
      }
      if (completed % 25 === 0 || completed === entries.length) {
        console.log(`Progress: ${completed}/${entries.length} (${successCount} OK, ${failCount} failed)`);
      }
    }
  }

  const queues = Array.from({ length: concurrency }, () => []);
  entries.forEach((item, idx) => queues[idx % concurrency].push(item));

  await Promise.all(queues.map(q => worker(q)));

  console.log(`\nDownload completed: ${successCount} successful, ${failCount} failed.`);

  console.log('\n=== Step 3: Replace URLs in SQLite ===');
  function replaceStrict(obj) {
    if (!obj || typeof obj !== 'object') return false;
    let changed = false;
    for (const k of Object.keys(obj)) {
      const v = obj[k];
      if (typeof v === 'string') {
        let newV = v;
        for (const [extUrl, info] of urlMap) {
          if (newV.includes(extUrl) && fs.existsSync(info.localFsPath)) {
            newV = newV.replaceAll(extUrl, info.localPath);
            changed = true;
          }
        }
        if (newV !== v) {
          obj[k] = newV;
        }
      } else if (typeof v === 'object') {
        if (replaceStrict(v)) changed = true;
      }
    }
    return changed;
  }

  let dbUpdated = 0;
  db.exec('BEGIN TRANSACTION');

  rows.forEach(r => {
    if (!r.content) return;
    const blocks = JSON.parse(r.content);
    if (replaceStrict(blocks)) {
      dbUpdated++;
      const jsonStr = JSON.stringify(blocks);
      db.prepare('UPDATE ec_magazine SET content = ? WHERE id = ?').run(jsonStr, r.id);

      const revs = db.prepare('SELECT id, data FROM revisions WHERE collection = ? AND entry_id = ?').all('magazine', r.id);
      revs.forEach(rev => {
        try {
          const revData = JSON.parse(rev.data);
          if (replaceStrict(revData.content)) {
            db.prepare('UPDATE revisions SET data = ? WHERE id = ?').run(JSON.stringify(revData), rev.id);
          }
        } catch(e) {}
      });
    }
  });

  db.exec('COMMIT');
  console.log(`Updated ${dbUpdated} articles in backup.sqlite.`);

  console.log('\n=== Step 4: Replace URLs in seed/seed.json ===');
  const seed = JSON.parse(fs.readFileSync('seed/seed.json', 'utf8'));
  let seedUpdated = 0;

  if (seed.content && seed.content.magazine) {
    seed.content.magazine.forEach(entry => {
      if (entry.data && entry.data.content) {
        if (replaceStrict(entry.data.content)) {
          seedUpdated++;
        }
      }
    });
  }

  if (seedUpdated > 0) {
    fs.writeFileSync('seed/seed.json', JSON.stringify(seed, null, 2), 'utf8');
    console.log(`Updated ${seedUpdated} articles in seed/seed.json.`);
  }

  console.log('\nAll done!');
}

run().catch(console.error);
