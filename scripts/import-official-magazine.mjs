import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { DatabaseSync, backup } from 'node:sqlite';
import { gutenbergToPortableText } from '@emdash-cms/gutenberg-to-portable-text';
import { parseFragment } from 'parse5';

// Fetch the public WordPress magazine endpoint into this file before running.
// Only missing articles are created; existing editorial content is preserved.
const source = JSON.parse(fs.readFileSync('scratch/wp-magazine.txt', 'utf8'));
if (!Array.isArray(source) || source.some(p => p.type !== 'magazine' || p.status !== 'publish')) throw new Error('Expected published official Magazine articles');
const apply = process.argv.includes('--apply');
const filename = fs.readFileSync('seed/db-filename.txt', 'utf8').trim();
if (path.basename(filename) !== filename) throw new Error('Invalid local DB filename');
const dbPath = path.join('.wrangler/state/v3/d1/miniflare-D1DatabaseObject', filename);
const db = new DatabaseSync(dbPath);
const text = html => {
  const visit = n => n.nodeName === '#text' ? n.value : (n.childNodes || []).map(visit).join('');
  return visit(parseFragment(html || '')).replace(/\s+/g, ' ').trim();
};
const existing = db.prepare('SELECT id, slug, title FROM ec_magazine WHERE deleted_at IS NULL').all();
const find = p => existing.find(e => e.slug === p.slug || e.title === text(p.title.rendered));
console.log(`Official: ${source.length}; existing matches: ${source.filter(find).length}; missing: ${source.filter(p => !find(p)).length}`);
if (!apply) { db.close(); process.exit(0); }
fs.mkdirSync('scratch', { recursive: true });
const snapshot = `scratch/before-magazine-import-${Date.now()}.sqlite`;
await backup(db, snapshot);
const brandIds = { 3: 'term_brand_bmw', 4: 'term_brand_mini', 5: 'term_brand_alpina', 6: 'term_brand_ferrari', 7: 'term_brand_rolls-royce' };
const report = [];
for (const p of source) {
  let entry = find(p);
  const title = text(p.title.rendered);
  if (!entry) {
    const content = await gutenbergToPortableText(p.content.rendered);
    if (!content.length) throw new Error(`Empty conversion: ${p.slug}`);
    for (const block of content) {
      if (block._type === 'image') {
        block.alt ||= `${title}の記事内写真`;
        if (block.asset?.url) block.src = block.asset.url;
      }
    }
    const image = p.yoast_head_json?.og_image?.[0]?.url;
    const data = { title, excerpt: p.yoast_head_json?.description || text(p.excerpt.rendered), content,
      ...(image ? { featured_image: { src: image, alt: title, provider: 'external' } } : {}) };
    const inputFile = 'scratch/official-magazine-entry.json';
    fs.writeFileSync(inputFile, JSON.stringify(data));
    const result = spawnSync(process.execPath, ['node_modules/emdash/dist/cli/index.mjs', 'content', 'create', 'magazine', '--file', inputFile, '--slug', p.slug, '--url', 'http://localhost:4321', '--json'], { encoding: 'utf8', maxBuffer: 20 * 1024 * 1024 });
    if (result.status !== 0) throw new Error(`${p.slug}: ${result.stderr || result.stdout}`);
    const created = JSON.parse(result.stdout);
    entry = { id: created.id, slug: created.slug, title };
    existing.push(entry);
    console.log(`Imported ${p.slug}`);
  }
  const publishedAt = `${p.date_gmt}Z`;
  const category = p.magazine_type.includes(102) ? 'term_mag_buyers_guide' : p.magazine_type.includes(127) ? 'term_mag_people' : 'term_mag_cars';
  db.prepare('UPDATE ec_magazine SET published_at = ? WHERE id = ?').run(publishedAt, entry.id);
  db.prepare("DELETE FROM content_taxonomies WHERE collection='magazine' AND entry_id=? AND taxonomy_id IN (SELECT id FROM taxonomies WHERE name IN ('category','magazine_category','brand'))").run(entry.id);
  for (const term of [category, ...p.brand.map(id => brandIds[id]).filter(Boolean)]) {
    db.prepare("INSERT OR REPLACE INTO content_taxonomies (collection,entry_id,taxonomy_id,status,locale,published_at,created_at) VALUES ('magazine',?,?, 'published','en',?,?)").run(entry.id, term, publishedAt, publishedAt);
  }
  report.push({ officialSlug: p.slug, localSlug: entry.slug, id: entry.id });
}
// These corporate/community activities belong exclusively to the ESG section.
const esgSlugs = ['202604_junior_high_shool_experience', '202606_tamagawa_clean', '202605_shinyurigaoka_cleanup', '202605_japanesenight_rollsroyce', '202608_mini_student-work-experience', '202608_international-employee-meetup', '202608_fire-department-award', '202601_mochitsuki'];
for (const slug of esgSlugs) {
  const row = db.prepare('SELECT id,published_at FROM ec_magazine WHERE slug=?').get(slug);
  if (!row) continue;
  db.prepare("DELETE FROM content_taxonomies WHERE collection='magazine' AND entry_id=? AND taxonomy_id IN (SELECT id FROM taxonomies WHERE name IN ('category','magazine_category'))").run(row.id);
  db.prepare("INSERT INTO content_taxonomies (collection,entry_id,taxonomy_id,status,locale,published_at,created_at) VALUES ('magazine',?,'term_mag_esg','published','en',?,?)").run(row.id,row.published_at,row.published_at);
}
const seed = JSON.parse(fs.readFileSync('seed/seed.json', 'utf8'));
for (const row of db.prepare('SELECT * FROM ec_magazine WHERE deleted_at IS NULL').all()) {
  const terms = db.prepare("SELECT t.name,t.slug FROM content_taxonomies c JOIN taxonomies t ON t.id=c.taxonomy_id WHERE c.collection='magazine' AND c.entry_id=?").all(row.id);
  const taxonomies = {};
  for (const term of terms) { const name = term.name === 'category' ? 'magazine_category' : term.name; (taxonomies[name] ||= []).push(term.slug); }
  const item = { id: row.id, slug: row.slug, status: row.status, published_at: row.published_at, taxonomies, data: {} };
  for (const field of ['title','excerpt','content','featured_image','featured_image_sp','related_location','notes','layout']) {
    if (row[field] == null) continue;
    item.data[field] = ['content','featured_image','featured_image_sp'].includes(field) ? JSON.parse(row[field]) : row[field];
  }
  const index = seed.content.magazine.findIndex(e => e.slug === row.slug);
  if (index < 0) seed.content.magazine.push(item); else seed.content.magazine[index] = item;
}
fs.writeFileSync('seed/seed.json', JSON.stringify(seed, null, '\t') + '\n');
fs.writeFileSync('scratch/official-magazine-import-report.json', JSON.stringify(report,null,2));
// Use SQLite's online backup so WAL contents are included in the restart snapshot.
await backup(db, 'seed/backup.sqlite');
db.close();
console.log(`Verified official mappings: ${report.length}; backup and seed updated.`);
