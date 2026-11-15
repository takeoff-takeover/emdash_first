// scripts/setup-companies-collection.mjs
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

console.log('--- Setting up Companies Collection in EmDash ---');

const collectionId = '01M5WCOMPANY0000000000001';

// 1. D1データベース（ローカル）にテーブル・コレクションを定義
const createTableSql = `
CREATE TABLE IF NOT EXISTS ec_companies (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE,
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
  name_en TEXT DEFAULT '',
  role_badge TEXT DEFAULT '',
  hero_image TEXT,
  hero_phrase TEXT DEFAULT '',
  about_title TEXT DEFAULT '',
  about_lead TEXT DEFAULT '',
  about_image TEXT,
  about_image_caption TEXT DEFAULT '',
  about_text TEXT DEFAULT '',
  highlight_1_num TEXT DEFAULT '',
  highlight_1_label TEXT DEFAULT '',
  highlight_2_num TEXT DEFAULT '',
  highlight_2_label TEXT DEFAULT '',
  highlight_3_num TEXT DEFAULT '',
  highlight_3_label TEXT DEFAULT '',
  award_title TEXT DEFAULT '',
  award_badge TEXT DEFAULT '',
  award_desc TEXT DEFAULT '',
  established TEXT DEFAULT '',
  representative TEXT DEFAULT '',
  postal TEXT DEFAULT '',
  address TEXT DEFAULT '',
  tel TEXT DEFAULT '',
  business_desc TEXT DEFAULT '',
  content JSON
);

CREATE INDEX IF NOT EXISTS idx_ec_companies_slug ON ec_companies(slug);
CREATE INDEX IF NOT EXISTS idx_ec_companies_status ON ec_companies(status);

INSERT OR REPLACE INTO _emdash_collections (
  id, slug, label, label_singular, description, icon, supports, url_pattern, sort_order, title_field
) VALUES (
  '${collectionId}',
  'companies',
  '会社案内',
  '会社情報',
  'ニコル・グループ各社の企業情報・代表メッセージ・拠点・受賞歴等の管理コレクション',
  'building',
  '["drafts","revisions","preview","search","seo"]',
  '/corporate/{slug}',
  3,
  'title'
);
`;

fs.writeFileSync('/tmp/create_companies.sql', createTableSql);
execSync('npx wrangler d1 execute my-emdash-site --local --file=/tmp/create_companies.sql', { stdio: 'inherit' });
console.log('✓ ec_companies table and _emdash_collections updated.');

// 2. フィールド定義の挿入（_emdash_fields）
const fields = [
  { slug: 'title', label: '会社名（正式日本語表記）', type: 'string', required: 1, sort_order: 1 },
  { slug: 'name_en', label: '会社名（英語表記）', type: 'string', required: 0, sort_order: 2 },
  { slug: 'role_badge', label: '役割・取扱ブランド（例: フェラーリ正規販売代理店）', type: 'string', required: 0, sort_order: 3 },
  { slug: 'hero_image', label: 'メインカバー写真（ヒーロー画像）', type: 'image', required: 0, sort_order: 4 },
  { slug: 'hero_phrase', label: 'ヒーロー導入メッセージ・キャッチコピー', type: 'text', required: 0, sort_order: 5 },
  { slug: 'about_title', label: '【会社紹介】見出し（大）', type: 'string', required: 0, sort_order: 6 },
  { slug: 'about_lead', label: '【会社紹介】サブリード', type: 'string', required: 0, sort_order: 7 },
  { slug: 'about_image', label: '【会社紹介】メディア写真（例: アトリエ・ショールーム）', type: 'image', required: 0, sort_order: 8 },
  { slug: 'about_image_caption', label: '【会社紹介】写真キャプション', type: 'string', required: 0, sort_order: 9 },
  { slug: 'about_text', label: '【会社紹介】ストーリー紹介本文', type: 'text', required: 0, sort_order: 10 },
  { slug: 'highlight_1_num', label: '【実績ハイライト1】数値（例: 2年連続）', type: 'string', required: 0, sort_order: 11 },
  { slug: 'highlight_1_label', label: '【実績ハイライト1】ラベル（例: 最優秀ディーラー賞）', type: 'string', required: 0, sort_order: 12 },
  { slug: 'highlight_2_num', label: '【実績ハイライト2】数値（例: 2014年）', type: 'string', required: 0, sort_order: 13 },
  { slug: 'highlight_2_label', label: '【実績ハイライト2】ラベル（例: 設立・正規指名）', type: 'string', required: 0, sort_order: 14 },
  { slug: 'highlight_3_num', label: '【実績ハイライト3】数値（例: 3拠点）', type: 'string', required: 0, sort_order: 15 },
  { slug: 'highlight_3_label', label: '【実績ハイライト3】ラベル（例: 新車・認定中古車・サービス）', type: 'string', required: 0, sort_order: 16 },
  { slug: 'award_title', label: '【受賞実績】賞名（例: 全国フェラーリ最優秀ディーラー賞）', type: 'string', required: 0, sort_order: 17 },
  { slug: 'award_badge', label: '【受賞実績】バッジ（例: 2年連続受賞（2024・2025））', type: 'string', required: 0, sort_order: 18 },
  { slug: 'award_desc', label: '【受賞実績】説明文', type: 'text', required: 0, sort_order: 19 },
  { slug: 'established', label: '【基本データ】設立年月', type: 'string', required: 0, sort_order: 20 },
  { slug: 'representative', label: '【基本データ】代表者名・役職', type: 'string', required: 0, sort_order: 21 },
  { slug: 'postal', label: '【基本データ】郵便番号', type: 'string', required: 0, sort_order: 22 },
  { slug: 'address', label: '【基本データ】所在地住所', type: 'string', required: 0, sort_order: 23 },
  { slug: 'tel', label: '【基本データ】代表電話番号 / FAX', type: 'string', required: 0, sort_order: 24 },
  { slug: 'business_desc', label: '【基本データ】事業内容（改行区切り）', type: 'text', required: 0, sort_order: 25 },
  { slug: 'content', label: '【自由ブロック】追加コンテンツ・詳細ブロック', type: 'portableText', required: 0, sort_order: 26 }
];

let fieldSql = '';
fields.forEach((f, idx) => {
  const fieldId = `01M5WCOMPFLD000000000000${(idx + 1).toString().padStart(2, '0')}`;
  const columnType = f.type === 'portableText' ? 'JSON' : 'TEXT';
  fieldSql += `INSERT OR REPLACE INTO _emdash_fields (
    id, collection_id, slug, label, type, column_type, required, sort_order, options
  ) VALUES (
    '${fieldId}', '${collectionId}', '${f.slug}', '${f.label}', '${f.type}', '${columnType}', ${f.required}, ${f.sort_order}, NULL
  );\n`;
});

fs.writeFileSync('/tmp/create_company_fields.sql', fieldSql);
execSync('npx wrangler d1 execute my-emdash-site --local --file=/tmp/create_company_fields.sql', { stdio: 'inherit' });
console.log('✓ _emdash_fields registered.');

// 3. Nicole Competizione の初期レコードを投入
const competizioneData = {
  id: '01M5WCOMPFERRARI000000001',
  slug: 'nicole-competizione',
  title: 'Nicole Competizione合同会社',
  name_en: 'Nicole Competizione LLC',
  role_badge: 'フェラーリ正規販売代理店',
  hero_image: JSON.stringify({ src: '/uploads/2026/02/トーンカーブ-1-e1773743622630-1.jpg', alt: 'Nicole Competizione メインショールーム' }),
  hero_phrase: 'イタリアが誇る至高の跳ね馬「フェラーリ」正規販売代理店。全国最優秀ディーラー賞 2年連続受賞（2024・2025）。横浜みなとみらいの新車ショールーム、都筑区川向町のプレオウンドショールームとサービスセンターの3拠点体制で、フェラーリが織りなす特別な世界観とライフスタイルをお届けします。',
  about_title: '情熱と卓越の跳ね馬。お客様と紡ぐ揺るぎない信頼。',
  about_lead: 'フェラーリ正規販売代理店として、包括的なサービスと比類なき体験をお届けします',
  about_image: JSON.stringify({ src: '/uploads/wp/2026/02/Z7A8366_re_web-1024x683.avif', alt: 'Nicole Competizione アトリエ・パーソナライゼーション空間' }),
  about_image_caption: 'フェラーリ アトリエ（Nicole Competizione Atelier）',
  about_text: 'Nicole Competizione合同会社は、イタリアが誇る至高のラグジュアリースポーツカーブランド「フェラーリ」の正規販売代理店として、2014年8月に設立されました。\n\n横浜みなとみらいに位置する新車ショールーム、都筑区川向町に展開する認定中古車（プレオウンド）ショールーム、ならびに最新鋭の設備を備えたサービスセンターの3拠点体制を敷き、新車のご購入からパーソナライゼーション、認定中古車のご提案、点検・車検・レストアに至るまで、一貫した最高峰のサービスを提供しています。\n\n設立10年目となる2024年に初の「全国フェラーリ最優秀ディーラー賞」を獲得、さらに2025年にも2年連続となる最優秀ディーラー賞を受賞。世界水準の情熱と高度な専門技術をもって、オーナーの皆様の情熱的なフェラーリライフを誠心誠意サポートいたします。',
  highlight_1_num: '2年連続',
  highlight_1_label: '最優秀ディーラー賞（2024・2025）',
  highlight_2_num: '2014年',
  highlight_2_label: '設立・正規指名',
  highlight_3_num: '3拠点',
  highlight_3_label: '新車・認定中古車・サービス拠点',
  award_title: '全国フェラーリ最優秀ディーラー賞',
  award_badge: '2年連続受賞（2024・2025）',
  award_desc: '日本国内の正規フェラーリディーラーネットワークにおいて、販売実績、顧客満足度、アフターセールス品質、ブランド基準遵守のすべてにおいて最高峰の評価を獲得。設立10年目の2024年に続き、2025年にも栄冠を手にしました。',
  established: '2014年8月',
  representative: '代表職務執行者 社長 ミヒャエル・ヴィット（Michael Witt）',
  postal: '〒220-0012',
  address: '神奈川県横浜市西区みなとみらい3-3-3',
  tel: '045-680-4465（代表） / FAX：045-680-4466',
  business_desc: 'フェラーリ新車販売およびアフターセールス\nフェラーリ認定中古車「Ferrari Approved」の販売・査定・買取\nフェラーリ純正部品・アクセサリーの販売\nアトリエによるパーソナライゼーション（オーダーメイド）の相談・受注\n正規指定サービス工場における車検・法定点検・メンテナンス・クラシケレストア',
  content: JSON.stringify([])
};

const insertRecordSql = `
INSERT OR REPLACE INTO ec_companies (
  id, slug, status, title, name_en, role_badge, hero_image, hero_phrase,
  about_title, about_lead, about_image, about_image_caption, about_text,
  highlight_1_num, highlight_1_label, highlight_2_num, highlight_2_label, highlight_3_num, highlight_3_label,
  award_title, award_badge, award_desc, established, representative, postal, address, tel, business_desc, content
) VALUES (
  '${competizioneData.id}',
  '${competizioneData.slug}',
  'published',
  '${competizioneData.title}',
  '${competizioneData.name_en}',
  '${competizioneData.role_badge}',
  '${competizioneData.hero_image.replace(/'/g, "''")}',
  '${competizioneData.hero_phrase.replace(/'/g, "''")}',
  '${competizioneData.about_title.replace(/'/g, "''")}',
  '${competizioneData.about_lead.replace(/'/g, "''")}',
  '${competizioneData.about_image.replace(/'/g, "''")}',
  '${competizioneData.about_image_caption.replace(/'/g, "''")}',
  '${competizioneData.about_text.replace(/'/g, "''")}',
  '${competizioneData.highlight_1_num}',
  '${competizioneData.highlight_1_label}',
  '${competizioneData.highlight_2_num}',
  '${competizioneData.highlight_2_label}',
  '${competizioneData.highlight_3_num}',
  '${competizioneData.highlight_3_label}',
  '${competizioneData.award_title.replace(/'/g, "''")}',
  '${competizioneData.award_badge.replace(/'/g, "''")}',
  '${competizioneData.award_desc.replace(/'/g, "''")}',
  '${competizioneData.established}',
  '${competizioneData.representative.replace(/'/g, "''")}',
  '${competizioneData.postal}',
  '${competizioneData.address.replace(/'/g, "''")}',
  '${competizioneData.tel.replace(/'/g, "''")}',
  '${competizioneData.business_desc.replace(/'/g, "''")}',
  '${competizioneData.content}'
);
`;

fs.writeFileSync('/tmp/insert_company.sql', insertRecordSql);
execSync('npx wrangler d1 execute my-emdash-site --local --file=/tmp/insert_company.sql', { stdio: 'inherit' });
console.log('✓ Initial record for nicole-competizione inserted.');

// 4. seed/seed.json の更新
const seedPath = 'seed/seed.json';
const seed = JSON.parse(fs.readFileSync(seedPath, 'utf-8'));

const companyCollectionSchema = {
  slug: 'companies',
  label: '会社案内',
  labelSingular: '会社案内',
  description: 'ニコル・グループ各社の企業情報・代表メッセージ・拠点・受賞歴等の管理コレクション',
  icon: 'building',
  supports: ['drafts', 'revisions', 'preview', 'search', 'seo'],
  urlPattern: '/corporate/{slug}',
  sortOrder: 3,
  titleField: 'title',
  fields: fields.map(f => ({
    slug: f.slug,
    label: f.label,
    type: f.type,
    searchable: true
  }))
};

if (!seed.collections.find(c => c.slug === 'companies')) {
  seed.collections.push(companyCollectionSchema);
} else {
  const idx = seed.collections.findIndex(c => c.slug === 'companies');
  seed.collections[idx] = companyCollectionSchema;
}

if (!seed.content) seed.content = {};
if (!seed.content.companies) seed.content.companies = [];

const existingCompIdx = seed.content.companies.findIndex(c => c.slug === 'nicole-competizione');
const seedEntry = {
  id: competizioneData.id,
  slug: competizioneData.slug,
  status: 'published',
  published_at: new Date().toISOString(),
  data: {
    title: competizioneData.title,
    name_en: competizioneData.name_en,
    role_badge: competizioneData.role_badge,
    hero_image: JSON.parse(competizioneData.hero_image),
    hero_phrase: competizioneData.hero_phrase,
    about_title: competizioneData.about_title,
    about_lead: competizioneData.about_lead,
    about_image: JSON.parse(competizioneData.about_image),
    about_image_caption: competizioneData.about_image_caption,
    about_text: competizioneData.about_text,
    highlight_1_num: competizioneData.highlight_1_num,
    highlight_1_label: competizioneData.highlight_1_label,
    highlight_2_num: competizioneData.highlight_2_num,
    highlight_2_label: competizioneData.highlight_2_label,
    highlight_3_num: competizioneData.highlight_3_num,
    highlight_3_label: competizioneData.highlight_3_label,
    award_title: competizioneData.award_title,
    award_badge: competizioneData.award_badge,
    award_desc: competizioneData.award_desc,
    established: competizioneData.established,
    representative: competizioneData.representative,
    postal: competizioneData.postal,
    address: competizioneData.address,
    tel: competizioneData.tel,
    business_desc: competizioneData.business_desc,
    content: []
  }
};

if (existingCompIdx >= 0) {
  seed.content.companies[existingCompIdx] = seedEntry;
} else {
  seed.content.companies.push(seedEntry);
}

fs.writeFileSync(seedPath, JSON.stringify(seed, null, 2));
console.log('✓ seed/seed.json updated.');
