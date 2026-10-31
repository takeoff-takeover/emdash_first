// scripts/extend-locations-schema.mjs
// 拠点管理画面（locations）のフィールドスキーマ定義
import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';

const DB_PATH = '.wrangler/state/v3/d1/miniflare-D1DatabaseObject/c5f74f54de1b54dfe248af0cae042e755774e9e90fc1e7dc6e84e3d6d7130474.sqlite';

if (!fs.existsSync(DB_PATH)) {
	console.error('Database file not found at:', DB_PATH);
	process.exit(1);
}

const db = new DatabaseSync(DB_PATH);
console.log('[Extend Schema] Updating _emdash_fields with fax and clean labels...');

// 1. ec_locations テーブルのカラム追加
const newColumns = [
	{ name: 'fax', type: 'text' },
	{ name: 'office_notice', type: 'text' },
	{ name: 'access_car', type: 'text' },

	// ギャラリー写真6点
	{ name: 'gallery_image_1', type: 'text' },
	{ name: 'gallery_caption_1', type: 'text' },
	{ name: 'gallery_image_2', type: 'text' },
	{ name: 'gallery_caption_2', type: 'text' },
	{ name: 'gallery_image_3', type: 'text' },
	{ name: 'gallery_caption_3', type: 'text' },
	{ name: 'gallery_image_4', type: 'text' },
	{ name: 'gallery_caption_4', type: 'text' },
	{ name: 'gallery_image_5', type: 'text' },
	{ name: 'gallery_caption_5', type: 'text' },
	{ name: 'gallery_image_6', type: 'text' },
	{ name: 'gallery_caption_6', type: 'text' },

	// 新車窓口（Sales）
	{ name: 'sales_enabled', type: 'text default "1"' },
	{ name: 'sales_title', type: 'text' },
	{ name: 'sales_subtitle', type: 'text' },
	{ name: 'sales_tel', type: 'text' },
	{ name: 'sales_fax', type: 'text' },
	{ name: 'sales_hours', type: 'text' },
	{ name: 'sales_closed', type: 'text' },
	{ name: 'sales_desc', type: 'text' },
	{ name: 'sales_cta_label', type: 'text' },
	{ name: 'sales_cta_url', type: 'text' },

	// 中古車窓口（Used）
	{ name: 'used_enabled', type: 'text default "0"' },
	{ name: 'used_title', type: 'text' },
	{ name: 'used_subtitle', type: 'text' },
	{ name: 'used_tel', type: 'text' },
	{ name: 'used_fax', type: 'text' },
	{ name: 'used_hours', type: 'text' },
	{ name: 'used_closed', type: 'text' },
	{ name: 'used_desc', type: 'text' },
	{ name: 'used_cta_label', type: 'text' },
	{ name: 'used_cta_url', type: 'text' },

	// サービス窓口（Service）
	{ name: 'service_enabled', type: 'text default "1"' },
	{ name: 'service_title', type: 'text' },
	{ name: 'service_subtitle', type: 'text' },
	{ name: 'service_tel', type: 'text' },
	{ name: 'service_fax', type: 'text' },
	{ name: 'service_hours', type: 'text' },
	{ name: 'service_closed', type: 'text' },
	{ name: 'service_desc', type: 'text' },
	{ name: 'service_cta_label', type: 'text' },
	{ name: 'service_cta_url', type: 'text' },
];

for (const col of newColumns) {
	try {
		db.exec(`ALTER TABLE ec_locations ADD COLUMN ${col.name} ${col.type};`);
	} catch (e) {
		if (!e.message.includes('duplicate column name')) {
			console.warn(`Column ${col.name} warning:`, e.message);
		}
	}
}

// 2. _emdash_fields に管理画面用フィールド定義を登録
const COLLECTION_ID = '01M5WLOCAT000000000000001';

const fieldDefs = [
	// ─── 【基本情報】 ───
	{ slug: 'title', label: '【基本情報】拠点名称', type: 'string', col: 'TEXT', order: 10 },
	{ slug: 'brand', label: '【基本情報】主要ブランド', type: 'select', col: 'TEXT', order: 11, options: '[{"label":"BMW","value":"BMW"},{"label":"MINI","value":"MINI"},{"label":"Rolls-Royce","value":"Rolls-Royce"},{"label":"Ferrari","value":"Ferrari"},{"label":"ALPINA","value":"ALPINA"},{"label":"Nicole (グループ本社)","value":"Nicole"}]' },
	{ slug: 'facility_type', label: '【基本情報】拠点区分（例: ショールーム・認定中古車）', type: 'string', col: 'TEXT', order: 12 },
	{ slug: 'postal', label: '【基本情報】郵便番号', type: 'string', col: 'TEXT', order: 13 },
	{ slug: 'address', label: '【基本情報】所在地住所', type: 'string', col: 'TEXT', order: 14 },
	{ slug: 'office_notice', label: '【基本情報】管理オフィス注記（※空欄時は非表示）', type: 'text', col: 'TEXT', order: 15 },

	// ─── 【写真ギャラリー】 ───
	{ slug: 'featured_image', label: '【写真ギャラリー】メイン外観写真（アイキャッチ）', type: 'image', col: 'TEXT', order: 20 },
	{ slug: 'gallery_image_1', label: '【写真ギャラリー】写真 1', type: 'image', col: 'TEXT', order: 21 },
	{ slug: 'gallery_caption_1', label: '【写真ギャラリー】写真 1 説明文', type: 'string', col: 'TEXT', order: 22 },
	{ slug: 'gallery_image_2', label: '【写真ギャラリー】写真 2', type: 'image', col: 'TEXT', order: 23 },
	{ slug: 'gallery_caption_2', label: '【写真ギャラリー】写真 2 説明文', type: 'string', col: 'TEXT', order: 24 },
	{ slug: 'gallery_image_3', label: '【写真ギャラリー】写真 3', type: 'image', col: 'TEXT', order: 25 },
	{ slug: 'gallery_caption_3', label: '【写真ギャラリー】写真 3 説明文', type: 'string', col: 'TEXT', order: 26 },
	{ slug: 'gallery_image_4', label: '【写真ギャラリー】写真 4', type: 'image', col: 'TEXT', order: 27 },
	{ slug: 'gallery_caption_4', label: '【写真ギャラリー】写真 4 説明文', type: 'string', col: 'TEXT', order: 28 },
	{ slug: 'gallery_image_5', label: '【写真ギャラリー】写真 5', type: 'image', col: 'TEXT', order: 29 },
	{ slug: 'gallery_caption_5', label: '【写真ギャラリー】写真 5 説明文', type: 'string', col: 'TEXT', order: 30 },
	{ slug: 'gallery_image_6', label: '【写真ギャラリー】写真 6', type: 'image', col: 'TEXT', order: 31 },
	{ slug: 'gallery_caption_6', label: '【写真ギャラリー】写真 6 説明文', type: 'string', col: 'TEXT', order: 32 },

	// ─── 【新車窓口】 ───
	{ slug: 'sales_title', label: '【新車窓口】窓口見出し（例: MINI 新車ショールーム）', type: 'string', col: 'TEXT', order: 40 },
	{ slug: 'sales_subtitle', label: '【新車窓口】名称（例: MINI 新百合ヶ丘）', type: 'string', col: 'TEXT', order: 41 },
	{ slug: 'sales_tel', label: '【新車窓口】電話番号', type: 'string', col: 'TEXT', order: 42 },
	{ slug: 'sales_fax', label: '【新車窓口】FAX番号', type: 'string', col: 'TEXT', order: 43 },
	{ slug: 'sales_hours', label: '【新車窓口】営業時間', type: 'string', col: 'TEXT', order: 44 },
	{ slug: 'sales_closed', label: '【新車窓口】定休日', type: 'string', col: 'TEXT', order: 45 },
	{ slug: 'sales_desc', label: '【新車窓口】ご案内文・展示モデル', type: 'text', col: 'TEXT', order: 46 },
	{ slug: 'sales_cta_label', label: '【新車窓口】ボタン表示名（例: 新車試乗・来場予約）', type: 'string', col: 'TEXT', order: 47 },
	{ slug: 'sales_cta_url', label: '【新車窓口】ボタンリンクURL', type: 'string', col: 'TEXT', order: 48 },

	// ─── 【中古車窓口】 ───
	{ slug: 'used_title', label: '【中古車窓口】窓口見出し（例: MINI 認定中古車）', type: 'string', col: 'TEXT', order: 50 },
	{ slug: 'used_subtitle', label: '【中古車窓口】名称（例: MINI NEXT 新百合ヶ丘）', type: 'string', col: 'TEXT', order: 51 },
	{ slug: 'used_tel', label: '【中古車窓口】電話番号', type: 'string', col: 'TEXT', order: 52 },
	{ slug: 'used_fax', label: '【中古車窓口】FAX番号', type: 'string', col: 'TEXT', order: 53 },
	{ slug: 'used_hours', label: '【中古車窓口】営業時間', type: 'string', col: 'TEXT', order: 54 },
	{ slug: 'used_closed', label: '【中古車窓口】定休日', type: 'string', col: 'TEXT', order: 55 },
	{ slug: 'used_desc', label: '【中古車窓口】ご案内文・在庫情報', type: 'text', col: 'TEXT', order: 56 },
	{ slug: 'used_cta_label', label: '【中古車窓口】ボタン表示名（例: 認定中古車を見る）', type: 'string', col: 'TEXT', order: 57 },
	{ slug: 'used_cta_url', label: '【中古車窓口】ボタンリンクURL', type: 'string', col: 'TEXT', order: 58 },

	// ─── 【サービス窓口】 ───
	{ slug: 'service_title', label: '【サービス窓口】窓口見出し（例: 本社サービス工場）', type: 'string', col: 'TEXT', order: 60 },
	{ slug: 'service_subtitle', label: '【サービス窓口】名称（例: Nicole BMW 新百合ヶ丘支店）', type: 'string', col: 'TEXT', order: 61 },
	{ slug: 'service_tel', label: '【サービス窓口】電話番号', type: 'string', col: 'TEXT', order: 62 },
	{ slug: 'service_fax', label: '【サービス窓口】FAX番号', type: 'string', col: 'TEXT', order: 63 },
	{ slug: 'service_hours', label: '【サービス窓口】営業時間', type: 'string', col: 'TEXT', order: 64 },
	{ slug: 'service_closed', label: '【サービス窓口】定休日', type: 'string', col: 'TEXT', order: 65 },
	{ slug: 'service_desc', label: '【サービス窓口】ご案内文・取扱サービス', type: 'text', col: 'TEXT', order: 66 },
	{ slug: 'service_cta_label', label: '【サービス窓口】ボタン表示名（例: サービス入庫予約）', type: 'string', col: 'TEXT', order: 67 },
	{ slug: 'service_cta_url', label: '【サービス窓口】ボタンリンクURL', type: 'string', col: 'TEXT', order: 68 },

	// ─── 【併設・アクセス】 ───
	{ slug: 'related_hub_title', label: '【併設・アクセス】同一敷地併設拠点 リンク見出し', type: 'string', col: 'TEXT', order: 70 },
	{ slug: 'related_hub_url', label: '【併設・アクセス】同一敷地併設拠点 リンクURL', type: 'string', col: 'TEXT', order: 71 },
	{ slug: 'related_hub_desc', label: '【併設・アクセス】同一敷地併設拠点 案内文', type: 'text', col: 'TEXT', order: 72 },
	{ slug: 'access_car', label: '【併設・アクセス】お車でのアクセス', type: 'text', col: 'TEXT', order: 73 },
	{ slug: 'access_train', label: '【併設・アクセス】電車・バスでのアクセス', type: 'text', col: 'TEXT', order: 74 },
	{ slug: 'google_maps_url', label: '【併設・アクセス】Googleマップ案内URL', type: 'string', col: 'TEXT', order: 75 },
];

// 既存の fields をクリアして再登録
db.prepare('DELETE FROM _emdash_fields WHERE collection_id = ?').run(COLLECTION_ID);

const insertFieldStmt = db.prepare(`
	INSERT INTO _emdash_fields (
		"id", "collection_id", "slug", "label", "type", "column_type", "required", "unique", "default_value", "validation", "widget", "options", "sort_order", "created_at", "searchable", "translatable", "indexed"
	) VALUES (
		?, ?, ?, ?, ?, ?, 0, 0, null, null, null, ?, ?, datetime('now'), 1, 1, 0
	)
`);

fieldDefs.forEach((f, idx) => {
	const fieldId = `01FLDLOC${String(idx + 1).padStart(8, '0')}`;
	insertFieldStmt.run(
		fieldId,
		COLLECTION_ID,
		f.slug,
		f.label,
		f.type,
		f.col,
		f.options || null,
		f.order
	);
});

console.log(`[Extend Schema] Registered ${fieldDefs.length} clean fields in _emdash_fields.`);
