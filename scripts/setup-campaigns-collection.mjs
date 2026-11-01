// scripts/setup-campaigns-collection.mjs
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

console.log('--- Setting up Campaigns Collection in EmDash ---');

// 1. D1データベース（ローカル）にテーブル・コレクション・フィールドを定義
const createTableSql = `
CREATE TABLE IF NOT EXISTS ec_campaigns (
  id TEXT PRIMARY KEY,
  slug TEXT,
  status TEXT DEFAULT 'published',
  author_id TEXT,
  primary_byline_id TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  published_at TEXT DEFAULT (datetime('now')),
  scheduled_at TEXT,
  deleted_at TEXT,
  version INTEGER DEFAULT 1,
  live_revision_id TEXT,
  draft_revision_id TEXT,
  locale TEXT NOT NULL DEFAULT 'ja',
  translation_group TEXT,
  title TEXT NOT NULL DEFAULT '',
  brand TEXT DEFAULT 'BMW',
  category TEXT DEFAULT '新車',
  period_start TEXT,
  period_end TEXT,
  period_text TEXT,
  featured_image TEXT,
  featured_image_sp TEXT,
  excerpt TEXT,
  content JSON,
  target_locations TEXT,
  cta_label TEXT DEFAULT '詳しく見る',
  cta_url TEXT DEFAULT '/contact'
);

CREATE INDEX IF NOT EXISTS idx_ec_campaigns_slug ON ec_campaigns(slug);
CREATE INDEX IF NOT EXISTS idx_ec_campaigns_brand ON ec_campaigns(brand);
CREATE INDEX IF NOT EXISTS idx_ec_campaigns_status ON ec_campaigns(status);

INSERT OR REPLACE INTO _emdash_collections (
  id, slug, label, label_singular, description, icon, supports, url_pattern, sort_order, title_field
) VALUES (
  '01M5WCAMPAIGN000000000001',
  'campaigns',
  'キャンペーン',
  'キャンペーン記事',
  'BMW・MINI・Ferrari等の正規ディーラー限定キャンペーン・フェア管理コレクション',
  'sparkles',
  '["drafts","revisions","preview","scheduling","search","seo"]',
  '/campaigns/{slug}',
  3,
  'title'
);
`;

fs.writeFileSync('/tmp/create_campaigns.sql', createTableSql);
execSync('npx wrangler d1 execute my-emdash-site --local --file=/tmp/create_campaigns.sql', { stdio: 'inherit' });
console.log('✓ ec_campaigns table and _emdash_collections updated.');

// 2. フィールド定義の挿入（_emdash_fields）
const fields = [
  { slug: 'title', label: 'キャンペーンタイトル', type: 'string', required: 1, sort_order: 1 },
  { slug: 'brand', label: '対象ブランド', type: 'select', required: 1, sort_order: 2, options: JSON.stringify([
    { label: 'BMW', value: 'BMW' },
    { label: 'MINI', value: 'MINI' },
    { label: 'Rolls-Royce', value: 'Rolls-Royce' },
    { label: 'Ferrari', value: 'Ferrari' },
    { label: 'ALPINA', value: 'ALPINA' },
    { label: 'Nicole Group 全体', value: 'Nicole Group' }
  ])},
  { slug: 'category', label: 'キャンペーン種別', type: 'select', required: 1, sort_order: 3, options: JSON.stringify([
    { label: '新車フェア・試乗会', value: '新車' },
    { label: '認定中古車特選フェア', value: '認定中古車' },
    { label: 'サービス・点検・車検キャンペーン', value: 'サービス' },
    { label: 'イベント・オーナーズ企画', value: 'イベント' }
  ])},
  { slug: 'period_text', label: '開催期間表記 (例: 2026年11月1日(日) 〜 11月30日(月))', type: 'string', sort_order: 4 },
  { slug: 'period_start', label: '開催開始日 (ソート・自動制御用)', type: 'date', sort_order: 5 },
  { slug: 'period_end', label: '開催終了日 (ソート・自動制御用)', type: 'date', sort_order: 6 },
  { slug: 'featured_image', label: 'アイキャッチ写真 (PC用)', type: 'image', sort_order: 7 },
  { slug: 'featured_image_sp', label: 'アイキャッチ写真 (スマホ用)', type: 'image', sort_order: 8 },
  { slug: 'excerpt', label: '概要・リード文', type: 'text', sort_order: 9 },
  { slug: 'target_locations', label: '対象拠点 (例: Nicole BMW 全支店 / 新百合ヶ丘支店限定)', type: 'string', sort_order: 10 },
  { slug: 'cta_label', label: 'ボタン表記 (例: 試乗予約はこちら / お問い合わせ)', type: 'string', sort_order: 11 },
  { slug: 'cta_url', label: 'ボタン遷移先URL', type: 'string', sort_order: 12 },
  { slug: 'content', label: 'キャンペーン詳細・特典内容', type: 'portableText', sort_order: 13 }
];

let fieldSql = '';
fields.forEach((f, idx) => {
  const fieldId = `01M5WCAMPFLD000000000000${(idx + 1).toString().padStart(2, '0')}`;
  const opts = f.options ? `'${f.options.replace(/'/g, "''")}'` : 'NULL';
  const columnType = f.type === 'portableText' ? 'JSON' : 'TEXT';
  fieldSql += `INSERT OR REPLACE INTO _emdash_fields (
    id, collection_id, slug, label, type, column_type, required, sort_order, options
  ) VALUES (
    '${fieldId}', '01M5WCAMPAIGN000000000001', '${f.slug}', '${f.label}', '${f.type}', '${columnType}', ${f.required || 0}, ${f.sort_order}, ${opts}
  );\n`;
});

fs.writeFileSync('/tmp/insert_fields.sql', fieldSql);
execSync('npx wrangler d1 execute my-emdash-site --local --file=/tmp/insert_fields.sql', { stdio: 'inherit' });
console.log('✓ _emdash_fields inserted.');

// 3. サンプルキャンペーン記事の投入
const sampleCampaigns = [
  {
    id: '01CAMPBMW000000000000001',
    slug: 'bmw-autumn-test-drive-2026',
    title: 'BMW オータム・テストドライブ・フェア 2026',
    brand: 'BMW',
    category: '新車',
    period_text: '2026年11月1日(日) 〜 11月30日(月)',
    period_start: '2026-11-01',
    period_end: '2026-11-30',
    featured_image: JSON.stringify({ src: '/uploads/2026/02/DSC2293-scaled.avif', alt: 'BMW オータム・テストドライブ・フェア' }),
    excerpt: '最新のBMWモデルを体感できる特別試乗フェアを開催。期間中のご試乗・ご成約でNicole Group限定の特別記念品を進呈いたします。',
    target_locations: 'Nicole BMW 全拠点（本社ショールーム・横浜港北・青葉宮前・新百合ヶ丘・大田）',
    cta_label: '試乗予約はこちら',
    cta_url: '/contact'
  },
  {
    id: '01CAMPMINI00000000000001',
    slug: 'mini-new-generation-debut-fair',
    title: 'MINI THE NEW GENERATION デビュー・フェア',
    brand: 'MINI',
    category: '新車',
    period_text: '2026年11月7日(土) 〜 11月23日(月・祝)',
    period_start: '2026-11-07',
    period_end: '2026-11-23',
    featured_image: JSON.stringify({ src: '/uploads/2026/02/MINI-新百合ヶ丘.jpg', alt: 'MINI デビュー・フェア' }),
    excerpt: '新世代MINIファミリーが一堂に集結。個性あふれるデザインとゴーカート・フィーリングを各ショールームでご体感ください。',
    target_locations: 'MINI 港北 / MINI 都筑 / MINI 新百合ヶ丘',
    cta_label: '来場予約はこちら',
    cta_url: '/contact'
  },
  {
    id: '01CAMPBPS000000000000001',
    slug: 'bmw-alpina-bps-special-selection',
    title: 'BMW & BMW ALPINA 認定中古車 特選オータム・セレクション',
    brand: 'ALPINA',
    category: '認定中古車',
    period_text: '2026年11月1日(日) 〜 11月30日(月)',
    period_start: '2026-11-01',
    period_end: '2026-11-30',
    featured_image: JSON.stringify({ src: '/uploads/2026/02/BMW_MINI_BPS_MININEXT新百合ヶ丘2025.jpg', alt: 'BMW ALPINA 認定中古車フェア' }),
    excerpt: '厳格な基準をクリアしたBMWおよびBMW ALPINA認定中古車を特別プライスでご案内。特別低金利ローンをご利用いただけます。',
    target_locations: 'BPS 横浜港北 / BPS 新百合ヶ丘 / ニコル世田谷',
    cta_label: '認定中古車在庫を見る',
    cta_url: '/locations'
  },
  {
    id: '01CAMPROLLS0000000000001',
    slug: 'rolls-royce-private-preview-yokohama',
    title: 'ロールス・ロイス スペクター プライベート・プレビュー',
    brand: 'Rolls-Royce',
    category: '新車',
    period_text: '事前予約制・随時受付中',
    period_start: '2026-11-01',
    period_end: '2026-12-25',
    featured_image: JSON.stringify({ src: '/uploads/2026/06/cq5dam.web_-e1780380151979.jpg', alt: 'ロールス・ロイス スペクター プレビュー' }),
    excerpt: 'ウルトラ・ラグジュアリー・クーペ「スペクター」を完全プライベート空間でご案内いたします。専任アンバサダーが極上の時間をお届けします。',
    target_locations: 'ロールス・ロイス・モーター・カーズ横浜 ショールーム',
    cta_label: 'プライベート内覧を予約する',
    cta_url: '/contact'
  },
  {
    id: '01CAMPFERRARI00000000001',
    slug: 'ferrari-winter-clinic-service',
    title: 'Nicole Competizione ウィンター・チェックアップ・クリニック',
    brand: 'Ferrari',
    category: 'サービス',
    period_text: '2026年11月15日(日) 〜 12月20日(日)',
    period_start: '2026-11-15',
    period_end: '2026-12-20',
    featured_image: JSON.stringify({ src: '/uploads/2026/02/0H9A1397.jpg', alt: 'フェラーリ サービスクリニック' }),
    excerpt: 'フェラーリ正規ファクトリーによる冬期特別点検プログラム。最新専用テスター診断とエキスパートメカニックによる30項目徹底チェックを実施。',
    target_locations: 'Nicole Competizione サービスセンター（横浜川向）',
    cta_label: '入庫・点検予約',
    cta_url: '/contact'
  }
];

let sampleSql = '';
sampleCampaigns.forEach(c => {
  sampleSql += `INSERT OR REPLACE INTO ec_campaigns (
    id, slug, status, title, brand, category, period_text, period_start, period_end, featured_image, excerpt, target_locations, cta_label, cta_url
  ) VALUES (
    '${c.id}', '${c.slug}', 'published', '${c.title.replace(/'/g, "''")}', '${c.brand}', '${c.category}', '${c.period_text.replace(/'/g, "''")}', '${c.period_start}', '${c.period_end}', '${c.featured_image.replace(/'/g, "''")}', '${c.excerpt.replace(/'/g, "''")}', '${c.target_locations.replace(/'/g, "''")}', '${c.cta_label.replace(/'/g, "''")}', '${c.cta_url.replace(/'/g, "''")}'
  );\n`;
});

fs.writeFileSync('/tmp/insert_samples.sql', sampleSql);
execSync('npx wrangler d1 execute my-emdash-site --local --file=/tmp/insert_samples.sql', { stdio: 'inherit' });
console.log('✓ Sample campaigns inserted.');

console.log('--- Setup Completed Successfully ---');
