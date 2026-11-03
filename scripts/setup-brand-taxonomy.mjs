// 共通の分類グループ「ブランド (brand)」と「カテゴリー (category)」を整理・統合し、
// マガジン・キャンペーンの既存記事に初期割り当てする。
// 使い方: node scripts/setup-brand-taxonomy.mjs [--remote]
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { execFileSync } from 'node:child_process';

const isRemote = process.argv.includes('--remote');
const LOCAL_DB = path.join('.wrangler', 'state', 'v3', 'd1', 'miniflare-D1DatabaseObject',
  'c5f74f54de1b54dfe248af0cae042e755774e9e90fc1e7dc6e84e3d6d7130474.sqlite');

const BRANDS = [
  { slug: 'bmw', label: 'BMW', sort: 1 },
  { slug: 'mini', label: 'MINI', sort: 2 },
  { slug: 'rolls-royce', label: 'Rolls-Royce', sort: 3 },
  { slug: 'ferrari', label: 'Ferrari', sort: 4 },
  { slug: 'alpina', label: 'ALPINA', sort: 5 },
];
const BRAND_COLLECTIONS = ['magazine', 'campaigns'];
const CATEGORY_COLLECTIONS = ['magazine', 'posts'];
const esc = (v) => (v == null ? 'NULL' : `'${String(v).replace(/'/g, "''")}'`);

function query(sql) {
  if (!isRemote) {
    const out = execFileSync('sqlite3', ['-json', LOCAL_DB, sql], { encoding: 'utf8' }).trim();
    return out ? JSON.parse(out) : [];
  }
  const out = execFileSync('npx', ['wrangler', 'd1', 'execute', 'my-emdash-site', '--remote', '--json', '--command', sql], { encoding: 'utf8' });
  return JSON.parse(out)[0].results;
}

const has = (text, word) => new RegExp(`(?<![a-z])${word}(?![a-z])`).test(text);
function inferBrand(row) {
  const s = (row.slug || '').toLowerCase();
  const t = (row.title || '').toLowerCase();
  const hit = (w) => has(s, w) || has(t, w);
  if (hit('mini')) return 'mini';
  if (hit('bmw') || t.includes('7シリーズ') || t.includes('3シリーズ') || s.includes('neue_klasse')) return 'bmw';
  if (hit('ferrari') || t.includes('フェラーリ')) return 'ferrari';
  if (hit('rolls') || t.includes('ロールス')) return 'rolls-royce';
  if (hit('alpina') || t.includes('アルピナ')) return 'alpina';
  if (row.related_location) return 'bmw';
  return null;
}

function inferCategoryTermId(row) {
  const slug = (row.slug || '').toLowerCase();
  const title = (row.title || '').toLowerCase();
  if (slug.includes('guide') || slug.includes('buyer') || title.includes('ガイド') || title.includes('選び方') || title.includes('購入')) {
    return 'term_mag_buyers_guide';
  }
  const esgKeywords = [
    'tamagawa', 'cleanup', 'japanesenight', 'inspire_hub', 'traffic-safety',
    'food-for-community', 'sustainable', 'emergency', 'kids-mechanic', 'haruhinofes',
    'norimonofes', 'sdgs', 'summerconference', 'esg', '美化活動', 'クリーンアップ', '交通安全', '防災', '寄付'
  ];
  if (esgKeywords.some(kw => slug.includes(kw) || title.includes(kw))) {
    return 'term_mag_esg';
  }
  const peopleKeywords = [
    'people', 'interview', 'staff', 'mechanic', 'craft', '職人', '社員', 'インタビュー',
    'ストーリー', 'story', 'マイスター', 'junior_high', 'work-experience', 'international-employee',
    'fire-department', 'mochitsuki', '餅つき', '交流会', '感謝状', '職場体験', 'alpina-heritage', 'rolls-royce-bespoke'
  ];
  if (peopleKeywords.some(kw => slug.includes(kw) || title.includes(kw))) {
    return 'term_mag_people';
  }
  return 'term_mag_cars';
}

const sql = [];

// 1. 「ブランド (brand)」分類定義とターム作成
sql.push(`INSERT OR REPLACE INTO _emdash_taxonomy_defs (id, name, label, label_singular, hierarchical, collections, locale, translation_group) VALUES ('taxdef_brand', 'brand', 'ブランド', 'ブランド', 0, ${esc(JSON.stringify(BRAND_COLLECTIONS))}, 'en', 'taxdef_brand');`);
sql.push(`INSERT OR REPLACE INTO _emdash_taxonomy_def_groups (id, name, hierarchical, collections) VALUES ('taxgrp_brand', 'brand', 0, ${esc(JSON.stringify(BRAND_COLLECTIONS))});`);
for (const b of BRANDS) {
  sql.push(`INSERT OR REPLACE INTO taxonomies (id, name, slug, label, parent_id, data, locale, translation_group, sort_order) VALUES ('term_brand_${b.slug}', 'brand', '${b.slug}', ${esc(b.label)}, NULL, NULL, 'en', 'term_brand_${b.slug}', ${b.sort});`);
}

// 2. 「カテゴリー (category)」に「マガジンカテゴリー (magazine_category)」を統合
// 初期テンプレートの英語ダミーカテゴリーと残骸紐付けを削除
sql.push(`DELETE FROM content_taxonomies WHERE taxonomy_id IN ('01M5WJ3W3HQHEBC68QDM8TA4MQ', '01M5WJ3W3TJNR8VT9WE5NA47TC', '01M5WJ3W42AZ20Q44A5VEKMWE0', '01M619G3J504KC8BX4A8FRQM5S');`);
sql.push(`DELETE FROM taxonomies WHERE id IN ('01M5WJ3W3HQHEBC68QDM8TA4MQ', '01M5WJ3W3TJNR8VT9WE5NA47TC', '01M5WJ3W42AZ20Q44A5VEKMWE0', '01M619G3J504KC8BX4A8FRQM5S');`);
// magazine_category の4項目を category に移行
sql.push(`INSERT OR REPLACE INTO taxonomies (id, name, slug, label, parent_id, data, locale, translation_group, sort_order) VALUES
  ('term_mag_cars', 'category', 'cars', 'Cars', NULL, '{"description":"新型車・試乗記・テクノロジー・スペック"}', 'en', 'term_mag_cars', 1),
  ('term_mag_people', 'category', 'people', 'People', NULL, '{"description":"オーナーズストーリー・開発者・職人・社員インタビュー"}', 'en', 'term_mag_people', 2),
  ('term_mag_esg', 'category', 'esg', 'ESG', NULL, '{"description":"サステナビリティ・環境技術・地域社会貢献"}', 'en', 'term_mag_esg', 3),
  ('term_mag_buyers_guide', 'category', 'buyers-guide', 'Buyer''s Guide', NULL, '{"description":"購入ガイド・認定中古車・グレード比較・充電維持費"}', 'en', 'term_mag_buyers_guide', 4);`);
// category 定義を「カテゴリー」として magazine と posts の両方に対応させ、magazine_category 定義を削除
sql.push(`INSERT OR REPLACE INTO _emdash_taxonomy_defs (id, name, label, label_singular, hierarchical, collections, locale, translation_group) VALUES ('taxdef_category', 'category', 'カテゴリー', 'カテゴリー', 1, ${esc(JSON.stringify(CATEGORY_COLLECTIONS))}, 'en', 'taxdef_category');`);
sql.push(`INSERT OR REPLACE INTO _emdash_taxonomy_def_groups (id, name, hierarchical, collections) VALUES ('taxdef_category', 'category', 1, ${esc(JSON.stringify(CATEGORY_COLLECTIONS))});`);
sql.push(`DELETE FROM _emdash_taxonomy_defs WHERE name = 'magazine_category';`);
sql.push(`DELETE FROM _emdash_taxonomy_def_groups WHERE name = 'magazine_category';`);

// 3. 「タグ (tag)」の日本語ラベル化と英語ダミータグ削除
sql.push(`UPDATE _emdash_taxonomy_defs SET label = 'タグ', label_singular = 'タグ' WHERE name = 'tag';`);
sql.push(`DELETE FROM taxonomies WHERE name = 'tag' AND slug IN ('webdev', 'opinion', 'tools', 'creativity');`);

// 4. マガジン記事へのブランド＆カテゴリー割り当て
for (const row of query(`select id, slug, title, status, related_location, published_at from ec_magazine where deleted_at is null`)) {
  const b = inferBrand(row);
  if (b) {
    sql.push(`INSERT OR REPLACE INTO content_taxonomies (collection, entry_id, taxonomy_id, status, published_at, created_at) VALUES ('magazine', ${esc(row.id)}, 'term_brand_${b}', ${esc(row.status)}, ${esc(row.published_at)}, datetime('now'));`);
  }
  const catTermId = inferCategoryTermId(row);
  if (catTermId) {
    sql.push(`INSERT OR IGNORE INTO content_taxonomies (collection, entry_id, taxonomy_id, status, published_at, created_at) VALUES ('magazine', ${esc(row.id)}, ${esc(catTermId)}, ${esc(row.status)}, ${esc(row.published_at)}, datetime('now'));`);
  }
}

// 5. キャンペーンへのブランド割り当て
const campMap = { 'BMW': 'bmw', 'MINI': 'mini', 'Rolls-Royce': 'rolls-royce', 'Ferrari': 'ferrari', 'ALPINA': 'alpina' };
for (const row of query(`select id, slug, brand, status, published_at from ec_campaigns where deleted_at is null`)) {
  const b = campMap[row.brand];
  if (b) {
    sql.push(`INSERT OR REPLACE INTO content_taxonomies (collection, entry_id, taxonomy_id, status, published_at, created_at) VALUES ('campaigns', ${esc(row.id)}, 'term_brand_${b}', ${esc(row.status)}, ${esc(row.published_at)}, datetime('now'));`);
  }
}

const file = path.join(os.tmpdir(), `setup-brand-taxonomy-${isRemote ? 'remote' : 'local'}.sql`);
fs.writeFileSync(file, sql.join('\n') + '\n');
if (isRemote) {
  execFileSync('npx', ['wrangler', 'd1', 'execute', 'my-emdash-site', '--remote', '--file', file], { stdio: 'inherit' });
} else {
  execFileSync('sqlite3', [LOCAL_DB, `.read ${file}`], { stdio: 'inherit' });
}
console.log(`[taxonomies] ${isRemote ? 'remote' : 'local'}: ${sql.length} statements applied`);
