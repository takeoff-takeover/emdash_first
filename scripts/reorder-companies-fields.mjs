import fs from 'node:fs';
import { DatabaseSync } from 'node:sqlite';

const desiredOrder = [
  // 1. 【基本情報】
  'title', 'name_en', 'role_badge',
  // 2. 【ヒーローカバー】
  'hero_image', 'hero_phrase',
  // 3. 【会社紹介】
  'about_title', 'about_lead', 'about_image', 'about_image_caption', 'about_text',
  // 4. 【実績ハイライト】
  'highlight_1_num', 'highlight_1_label', 'highlight_2_num', 'highlight_2_label', 'highlight_3_num', 'highlight_3_label',
  // 5. 【基本データ】
  'established', 'representative', 'postal', 'address', 'tel', 'business_desc',
  // 6. 【受賞実績】
  'award_title', 'award_badge', 'award_desc',
  // 7. 【写真ギャラリー】
  'gallery_image_1', 'gallery_title_1', 'gallery_caption_1',
  'gallery_image_2', 'gallery_title_2', 'gallery_caption_2',
  'gallery_image_3', 'gallery_title_3', 'gallery_caption_3',
  'gallery_image_4', 'gallery_title_4', 'gallery_caption_4',
  'gallery_image_5', 'gallery_title_5', 'gallery_caption_5',
  'gallery_image_6', 'gallery_title_6', 'gallery_caption_6',
  // 8. 【自由ブロック】
  'content'
];

// 1. Update seed/seed.json
const seedPath = 'seed/seed.json';
const seed = JSON.parse(fs.readFileSync(seedPath, 'utf8'));
const comp = seed.collections.find(c => (c.name || c.slug || c.id) === 'companies');
if (comp && comp.fields) {
  comp.fields.sort((a, b) => {
    const aSlug = a.slug || a.id;
    const bSlug = b.slug || b.id;
    const aIdx = desiredOrder.indexOf(aSlug);
    const bIdx = desiredOrder.indexOf(bSlug);
    return (aIdx === -1 ? 999 : aIdx) - (bIdx === -1 ? 999 : bIdx);
  });
  fs.writeFileSync(seedPath, JSON.stringify(seed, null, '\t') + '\n');
  console.log('Updated seed/seed.json companies fields order');
}

// 2. Update D1 SQLite _emdash_fields sort_order
const dbPath = '.wrangler/state/v3/d1/miniflare-D1DatabaseObject/c5f74f54de1b54dfe248af0cae042e755774e9e90fc1e7dc6e84e3d6d7130474.sqlite';
if (fs.existsSync(dbPath)) {
  const db = new DatabaseSync(dbPath);
  const collRow = db.prepare("SELECT id FROM _emdash_collections WHERE slug = 'companies'").get();
  if (collRow && collRow.id) {
    const updateStmt = db.prepare("UPDATE _emdash_fields SET sort_order = ? WHERE collection_id = ? AND slug = ?");
    desiredOrder.forEach((slug, idx) => {
      updateStmt.run(idx, collRow.id, slug);
    });
    console.log(`Updated ${desiredOrder.length} fields sort_order in SQLite _emdash_fields`);
  }
}
