import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';

const DB_PATH = '.wrangler/state/v3/d1/miniflare-D1DatabaseObject/c5f74f54de1b54dfe248af0cae042e755774e9e90fc1e7dc6e84e3d6d7130474.sqlite';

if (!fs.existsSync(DB_PATH)) {
	console.error('Database file not found at:', DB_PATH);
	process.exit(1);
}

const db = new DatabaseSync(DB_PATH);

console.log('[Setup Locations] Starting database migration for locations collection...');

const sqlStatements = [
	// 1. Create ec_locations table
	`CREATE TABLE IF NOT EXISTS "ec_locations" (
		"id" text primary key,
		"slug" text,
		"status" text default 'published',
		"author_id" text,
		"primary_byline_id" text,
		"created_at" text default (datetime('now')),
		"updated_at" text default (datetime('now')),
		"published_at" text default (datetime('now')),
		"scheduled_at" text,
		"deleted_at" text,
		"version" integer default 1,
		"live_revision_id" text references "revisions" ("id"),
		"draft_revision_id" text references "revisions" ("id"),
		"locale" text default 'en' not null,
		"translation_group" text,
		"title" text default '' not null,
		"brand" text default 'BMW',
		"facility_type" text default 'ショールーム',
		"postal" text,
		"address" text,
		"tel" text,
		"fax" text,
		"google_maps_url" text,
		"featured_image" text,
		"gallery" json,
		"badges" json,
		"concept_title" text,
		"concept_text" text,
		"departments" json,
		"related_hub_title" text,
		"related_hub_url" text,
		"related_hub_desc" text,
		"access_car_tokyo" text,
		"access_car_yokohama" text,
		"access_train" text,
		"access_taxi" text,
		constraint "ec_locations_slug_locale_unique" unique ("slug", "locale")
	);`,

	// 2. Insert into _emdash_collections
	`INSERT OR REPLACE INTO "_emdash_collections" (
		"id", "slug", "label", "label_singular", "description", "icon", "supports",
		"source", "created_at", "updated_at", "search_config", "has_seo", "url_pattern",
		"comments_enabled", "comments_moderation", "comments_closed_after_days",
		"comments_auto_approve_users", "hidden", "sort_order", "admin_config",
		"title_field", "date_field", "routable", "edit_locking", "nav_group"
	) VALUES (
		'01M5WLOCAT000000000000001', 'locations', '拠点一覧', '拠点情報',
		'ショールーム・サービス工場・認定中古車等の拠点管理コレクション', 'map-pin',
		'["drafts","revisions","preview","scheduling","search","seo"]',
		'custom', datetime('now'), datetime('now'), '{"enabled":true}', 1,
		'/location/{slug}', 0, 'first_time', 90, 1, 0, 2, null, 'title', null, 1, 1, null
	);`,

	// 3. Insert fields into _emdash_fields
	`INSERT OR REPLACE INTO "_emdash_fields" ("id", "collection_id", "slug", "label", "type", "column_type", "required", "unique", "default_value", "validation", "widget", "options", "sort_order", "created_at", "searchable", "translatable", "indexed")
	VALUES
	('01M5WLOCFLD00000000000001', '01M5WLOCAT000000000000001', 'title', '拠点名称', 'string', 'TEXT', 1, 0, null, null, null, null, 0, datetime('now'), 1, 1, 0),
	('01M5WLOCFLD00000000000002', '01M5WLOCAT000000000000001', 'brand', '主要ブランド', 'select', 'TEXT', 1, 0, '"BMW"', null, null, '[{"label":"BMW","value":"BMW"},{"label":"MINI","value":"MINI"},{"label":"Rolls-Royce","value":"Rolls-Royce"},{"label":"Ferrari","value":"Ferrari"},{"label":"ALPINA","value":"ALPINA"},{"label":"Nicole (グループ本社)","value":"Nicole"}]', 1, datetime('now'), 0, 1, 0),
	('01M5WLOCFLD00000000000003', '01M5WLOCAT000000000000001', 'facility_type', '拠点区分', 'string', 'TEXT', 0, 0, '"ショールーム"', null, null, null, 2, datetime('now'), 0, 1, 0),
	('01M5WLOCFLD00000000000004', '01M5WLOCAT000000000000001', 'postal', '郵便番号', 'string', 'TEXT', 0, 0, null, null, null, null, 3, datetime('now'), 0, 1, 0),
	('01M5WLOCFLD00000000000005', '01M5WLOCAT000000000000001', 'address', '所在地住所', 'string', 'TEXT', 0, 0, null, null, null, null, 4, datetime('now'), 1, 1, 0),
	('01M5WLOCFLD00000000000006', '01M5WLOCAT000000000000001', 'tel', '代表TEL', 'string', 'TEXT', 0, 0, null, null, null, null, 5, datetime('now'), 0, 1, 0),
	('01M5WLOCFLD00000000000007', '01M5WLOCAT000000000000001', 'fax', '代表FAX', 'string', 'TEXT', 0, 0, null, null, null, null, 6, datetime('now'), 0, 1, 0),
	('01M5WLOCFLD00000000000008', '01M5WLOCAT000000000000001', 'google_maps_url', 'GoogleマップURL', 'string', 'TEXT', 0, 0, null, null, null, null, 7, datetime('now'), 0, 1, 0),
	('01M5WLOCFLD00000000000009', '01M5WLOCAT000000000000001', 'featured_image', 'メイン外観写真', 'image', 'TEXT', 0, 0, null, null, null, null, 8, datetime('now'), 0, 1, 0),
	('01M5WLOCFLD00000000000010', '01M5WLOCAT000000000000001', 'badges', '上部ナビバッジ (JSON)', 'text', 'JSON', 0, 0, null, null, null, null, 9, datetime('now'), 0, 1, 0),
	('01M5WLOCFLD00000000000011', '01M5WLOCAT000000000000001', 'concept_title', 'コンセプト見出し', 'string', 'TEXT', 0, 0, null, null, null, null, 10, datetime('now'), 0, 1, 0),
	('01M5WLOCFLD00000000000012', '01M5WLOCAT000000000000001', 'concept_text', 'コンセプト説明文', 'text', 'TEXT', 0, 0, null, null, null, null, 11, datetime('now'), 1, 1, 0),
	('01M5WLOCFLD00000000000013', '01M5WLOCAT000000000000001', 'departments', '窓口アコーディオン情報 (JSON)', 'text', 'JSON', 0, 0, null, null, null, null, 12, datetime('now'), 0, 1, 0),
	('01M5WLOCFLD00000000000014', '01M5WLOCAT000000000000001', 'related_hub_title', '同一敷地・姉妹拠点 リンク見出し', 'string', 'TEXT', 0, 0, null, null, null, null, 13, datetime('now'), 0, 1, 0),
	('01M5WLOCFLD00000000000015', '01M5WLOCAT000000000000001', 'related_hub_url', '同一敷地・姉妹拠点 リンクURL', 'string', 'TEXT', 0, 0, null, null, null, null, 14, datetime('now'), 0, 1, 0),
	('01M5WLOCFLD00000000000016', '01M5WLOCAT000000000000001', 'related_hub_desc', '同一敷地・姉妹拠点 案内文', 'text', 'TEXT', 0, 0, null, null, null, null, 15, datetime('now'), 0, 1, 0),
	('01M5WLOCFLD00000000000017', '01M5WLOCAT000000000000001', 'access_car_tokyo', '車アクセス（東京方面より）', 'text', 'TEXT', 0, 0, null, null, null, null, 16, datetime('now'), 0, 1, 0),
	('01M5WLOCFLD00000000000018', '01M5WLOCAT000000000000001', 'access_car_yokohama', '車アクセス（横浜方面より）', 'text', 'TEXT', 0, 0, null, null, null, null, 17, datetime('now'), 0, 1, 0),
	('01M5WLOCFLD00000000000019', '01M5WLOCAT000000000000001', 'access_train', '電車・バスでお越しの方', 'text', 'TEXT', 0, 0, null, null, null, null, 18, datetime('now'), 0, 1, 0),
	('01M5WLOCFLD00000000000020', '01M5WLOCAT000000000000001', 'access_taxi', 'タクシーをご利用の場合', 'text', 'TEXT', 0, 0, null, null, null, null, 19, datetime('now'), 0, 1, 0);`
];

for (const sql of sqlStatements) {
	db.exec(sql);
}

// 4. Initial Seed Data Insertion
const seedLocations = [
	{
		id: '01LOCAT_KAWASAKI_HQ_00001',
		slug: 'nicole-bmw-kawasaki',
		title: 'Nicole BMW 本社（川崎）',
		brand: 'BMW',
		facility_type: 'ショールーム ＆ 本社サービス工場',
		postal: '〒212-0005',
		address: '神奈川県川崎市幸区戸手2-5-7',
		tel: '044-511-2000',
		fax: '044-543-5410',
		google_maps_url: 'https://maps.google.com/?cid=12111559868726756814',
		featured_image: JSON.stringify({
			src: '/uploads/2026/01/Nicole-BMW-本社-1024x682.jpg',
			alt: 'Nicole BMW 本社（川崎） 外観'
		}),
		gallery: JSON.stringify([
			{ src: '/uploads/2026/01/Nicole-BMW-本社-1024x682.jpg', caption: '国道1号線（第二京浜）沿いに面したNicole BMW 本社ショールーム外観' },
			{ src: '/uploads/2026/02/1000019794.jpg', caption: '最新BMWラインナップが美しく並ぶ開放的なメインショールームフロア' },
			{ src: '/uploads/2026/02/1000019793.jpg', caption: 'お客様一人ひとりに合わせたコンサルティングをご提供する専用商談ラウンジ' },
			{ src: '/uploads/2026/02/1000019790.jpg', caption: 'Nicole Racingの栄光と歴史を体現するアルピナ＆レーシング展示ブース' },
			{ src: '/uploads/2026/02/1000019789.jpg', caption: 'ゆったりとお寛ぎいただけるオーナーズラウンジ＆ウェルカムレセプション' }
		]),
		badges: JSON.stringify([
			{ brand: 'BMW', label: 'BMW 新車', targetId: 'dept-newcar' },
			{ brand: 'BMW', label: 'BMW サービス', targetId: 'dept-service' },
			{ brand: 'MINI', label: 'MINI サービス', targetId: 'dept-service' }
		]),
		concept_title: '長年の信頼と実績を誇るNicole BMWのフラッグシップ拠点',
		concept_text: 'Nicole BMW 本社ショールームは、第二京浜（国道1号線）沿いの利便性に優れたロケーションに位置し、長年にわたり多くのお客様に愛されてきたフラッグシップ拠点です。\n\n最新のBMWラインナップを常時ゆとりある空間に展示し、専門知識豊富なプロダクト・ジーニアスとセールス・コンサルタントが、お客様のライフスタイルに最適な一台をご提案いたします。最新鋭の設備を備えた大型サービス工場を併設しており、BMWおよびMINIの車検・点検から重整備まで、専任マイスターが万全のサポート体制でお応えします。',
		departments: JSON.stringify([
			{
				id: 'dept-newcar',
				brand: 'BMW',
				title: 'BMW 新車ショールーム',
				subtitle: 'Nicole BMW 本社',
				tel: '044-511-2000',
				fax: '044-543-5410',
				hours: '10:00 - 18:00',
				closed: '水曜日（祝日を除く）',
				desc: '最新のBMW正規新車モデルを幅広く展示。知識豊富なスタッフがライフスタイルに最適なモデルをご案内いたします。',
				ctaLabel: '試乗・来場予約',
				ctaUrl: 'https://form.bmw.co.jp/form/showroom/dealer/03110/index.html'
			},
			{
				id: 'dept-service',
				brand: 'BMW',
				title: '車検・点検（BMW / MINI正規サービス）',
				subtitle: '本社サービス工場',
				tel: '044-543-5400',
				fax: '044-543-5410',
				hours: '10:00 - 18:00（サービス受付 17:30まで）',
				closed: '水曜日（祝日を除く）',
				desc: '最新の診断機器と専用リフトを備えた大型ワークショップ。BMWおよびMINIの専門資格を持つ熟練マイスターが確実な点検・車検・整備を行います。',
				ctaLabel: '入庫・車検Web予約',
				ctaUrl: 'https://form.bmw.co.jp/form/service/dealer/03110/index.html'
			}
		]),
		related_hub_title: null,
		related_hub_url: null,
		related_hub_desc: null,
		access_car_tokyo: '国道1号線（第二京浜）を川崎方面へ進み、多摩川を渡って約1.5km先右手。戸手交差点を過ぎてすぐの側道沿いに専用駐車場がございます。',
		access_car_yokohama: '国道1号線を五反田方面へ北上。尻手交差点を通過後約800m左手。ショールーム正面にお車をそのままお乗り入れいただけます。',
		access_train: 'JR東海道線・京浜東北線・南武線「川崎駅」西口より市営バスまたはタクシーで約7分。「戸手小学校前」または「遠藤町」バス停下車徒歩2分。',
		access_taxi: '「川崎駅西口」タクシー乗り場より「第二京浜沿いのNicole BMWショールームまで」とお伝えください（所要時間約7分・1メーター程度）。'
	},
	{
		id: '01LOCAT_SHINYURIGAOKA_BMW_01',
		slug: 'nicole-bmw-shinyurigaoka',
		title: 'Nicole BMW 新百合ヶ丘支店',
		brand: 'BMW',
		facility_type: '新車・BPS認定中古車・サービス工場',
		postal: '〒215-0023',
		address: '神奈川県川崎市麻生区片平1-5-11',
		tel: '044-959-1400',
		fax: null,
		google_maps_url: 'https://maps.google.com/?q=Nicole+BMW+新百合ヶ丘支店+神奈川県川崎市麻生区片平1-5-11',
		featured_image: JSON.stringify({
			src: '/uploads/2026/02/BMW_MINI_BPS_MININEXT新百合ヶ丘2025-1-1024x682.jpg',
			alt: 'Nicole BMW 新百合ヶ丘支店 外観'
		}),
		gallery: JSON.stringify([
			{ src: '/uploads/2026/02/BMW_MINI_BPS_MININEXT新百合ヶ丘2025-1-1024x682.jpg', caption: '新青梅・津久井道沿いに位置するNicole BMW 新百合ヶ丘支店 全景' },
			{ src: '/uploads/2026/02/BMW_MINI_BPS_MININEXT新百合ヶ丘2025-1024x682.jpg', caption: '高品質なBMW認定中古車が揃うBMW Premium Selection展示エリア' },
			{ src: '/uploads/2026/02/NicoleBMW新百合ヶ丘2025-1024x682.jpg', caption: '開放感のある広々としたBMW新車ショールームフロア' }
		]),
		badges: JSON.stringify([
			{ brand: 'BMW', label: 'BMW 新車', targetId: 'dept-newcar' },
			{ brand: 'BMW', label: 'BMW 認定中古車', targetId: 'dept-usedcar' },
			{ brand: 'BMW', label: '車検・点検工場', targetId: 'dept-service' }
		]),
		concept_title: '新車から高品質認定中古車、正規整備までを網羅する総合ハブ拠点',
		concept_text: '川崎市麻生区の緑豊かな住宅エリア・新百合ヶ丘に位置するNicole BMW 新百合ヶ丘支店。\n\n広大な敷地内にはBMW最新新車のショールームに加え、厳格な基準をクリアした高品質なBMW認定中古車を常時展示する「BMW Premium Selection 新百合ヶ丘」、最新の検査機器を完備したサービス工場を併設しています。\n同一敷地内にはMINI新百合ヶ丘（新車・MINI NEXT認定中古車）も一体展開しており、BMW・MINI双方の魅力を一度にご体感いただけます。',
		departments: JSON.stringify([
			{
				id: 'dept-newcar',
				brand: 'BMW',
				title: 'BMW 新車ショールーム',
				subtitle: 'Nicole BMW 新百合ヶ丘支店',
				tel: '044-959-1400',
				fax: null,
				hours: '10:00 - 18:00',
				closed: '火曜日・水曜日（祝日を除く）',
				desc: 'BMW最新モデルの展示とご試乗に対応。落ち着いたラウンジで専任コンサルタントが丁寧にご提案いたします。',
				ctaLabel: '試乗・来場予約',
				ctaUrl: 'https://form.bmw.co.jp/form/showroom/dealer/03110/index.html'
			},
			{
				id: 'dept-usedcar',
				brand: 'BMW',
				title: 'BMW 認定中古車',
				subtitle: 'BMW Premium Selection 新百合ヶ丘',
				tel: '044-396-0180',
				fax: null,
				hours: '10:00 - 18:00',
				closed: '火曜日・水曜日（祝日を除く）',
				desc: '360度点検と充実の長期保証が付帯した高品質な認定中古車を豊富にラインナップ。',
				ctaLabel: '中古車在庫を見る',
				ctaUrl: 'https://www.carsensor.net/shop/kanagawa/204859005/'
			},
			{
				id: 'dept-service',
				brand: 'BMW',
				title: '車検・点検・サービス工場',
				subtitle: '新百合ヶ丘 ワークショップ',
				tel: '044-959-1400',
				fax: null,
				hours: '10:00 - 18:00（サービス受付 17:30まで）',
				closed: '火曜日・水曜日（祝日を除く）',
				desc: '最新鋭テスターを完備し、BMW専任メカニックによる的確なメンテナンスを実施。安心のカーライフをお約束します。',
				ctaLabel: 'サービス入庫予約',
				ctaUrl: 'https://form.bmw.co.jp/form/service/dealer/03110/index.html'
			}
		]),
		related_hub_title: '同一敷地内：MINI 新百合ヶ丘 / MINI NEXT 新百合ヶ丘',
		related_hub_url: '/location/mini-shinyurigaoka/',
		related_hub_desc: '同敷地内にMINI正規新車ショールームおよびMINI NEXT認定中古車センターを併設しております。MINIをご覧のお客様はこちらをご確認ください。',
		access_car_tokyo: '世田谷通り（津久井道）を町田・相模原方面へ直進。「片平2丁目」交差点至近、右手に見えるNicoleグループ複合拠点へお入りください。',
		access_car_yokohama: '国道246号線より尻手黒川道路を経由し新百合ヶ丘方面へ約20分。津久井道合流地点すぐ。駐車場完備。',
		access_train: '小田急小田原線・多摩線「新百合ヶ丘駅」北口より徒歩約15分、または小田急多摩線「五月台駅」より徒歩約8分。',
		access_taxi: '小田急線「新百合ヶ丘駅」北口タクシー乗り場より「片平のBMW・MINIディーラーまで」とお伝えください（約5分）。'
	},
	{
		id: '01LOCAT_SHINYURIGAOKA_MINI_01',
		slug: 'mini-shinyurigaoka',
		title: 'MINI 新百合ヶ丘 / MINI NEXT 新百合ヶ丘',
		brand: 'MINI',
		facility_type: '新車・MINI NEXT認定中古車・サービス連携',
		postal: '〒215-0023',
		address: '神奈川県川崎市麻生区片平1-5-11',
		tel: '044-959-3032',
		fax: null,
		google_maps_url: 'https://maps.google.com/?q=MINI+新百合ヶ丘+神奈川県川崎市麻生区片平1-5-11',
		featured_image: JSON.stringify({
			src: '/uploads/2026/02/NicoleBMW新百合ヶ丘2025-2-1024x682.jpg',
			alt: 'MINI 新百合ヶ丘 / MINI NEXT 新百合ヶ丘 外観'
		}),
		gallery: JSON.stringify([
			{ src: '/uploads/2026/02/NicoleBMW新百合ヶ丘2025-2-1024x682.jpg', caption: 'MINIのスタイリッシュなCIデザインが映える新百合ヶ丘ショールーム外観' },
			{ src: '/uploads/2026/02/NicoleBMW新百合ヶ丘2025-1024x682.jpg', caption: '厳選された高品質なMINI認定中古車が並ぶMINI NEXT展示コーナー' },
			{ src: '/uploads/2026/02/BMW_MINI_BPS_MININEXT新百合ヶ丘2025-1024x682.jpg', caption: '新百合ヶ丘の広大な総合展示パーク全景' }
		]),
		badges: JSON.stringify([
			{ brand: 'MINI', label: 'MINI 新車', targetId: 'dept-newcar' },
			{ brand: 'MINI', label: 'MINI 認定中古車', targetId: 'dept-usedcar' },
			{ brand: 'MINI', label: 'MINI サービス', targetId: 'dept-service' }
		]),
		concept_title: '新百合ヶ丘の洗練された街並みに佇む、個性豊かなMINIの世界',
		concept_text: 'MINI 新百合ヶ丘は、緑豊かな新百合ヶ丘・片平エリアに位置し、MINI最新モデルの展示からMINI正規認定中古車（MINI NEXT）、車検・点検等のアフターサービスまでをトータルにサポートいたします。\n\n同敷地内にはNicole BMW 新百合ヶ丘支店も併設。広い敷地と充実した設備のもと、個性あふれるMINIのドライブフィールを安心してお楽しみいただける体制を整えております。',
		departments: JSON.stringify([
			{
				id: 'dept-newcar',
				brand: 'MINI',
				title: 'MINI 新車ショールーム',
				subtitle: 'MINI 新百合ヶ丘',
				tel: '044-959-3032',
				fax: null,
				hours: '10:00 - 18:00',
				closed: '火曜日・水曜日（祝日を除く）',
				desc: '新型MINIファミリーの各モデルをラインナップ。カラーバリエーションや多彩なオプションを実際にご確認いただけます。',
				ctaLabel: 'MINI試乗予約',
				ctaUrl: 'https://secure-p2.mini.jp/mini/jsf/testdrive/index.jsf'
			},
			{
				id: 'dept-usedcar',
				brand: 'MINI',
				title: 'MINI 認定中古車',
				subtitle: 'MINI NEXT 新百合ヶ丘',
				tel: '044-396-0180',
				fax: null,
				hours: '10:00 - 18:00',
				closed: '火曜日・水曜日（祝日を除く）',
				desc: '厳格な基準をクリアした高品質なMINI認定中古車を豊富にご用意。納車前点検と手厚い保証で安心のMINIライフをお届けします。',
				ctaLabel: 'MINI認定中古車を見る',
				ctaUrl: 'https://www.carsensor.net/shop/kanagawa/204859005/'
			},
			{
				id: 'dept-service',
				brand: 'MINI',
				title: '車検・点検・整備受付',
				subtitle: 'MINI 認定サービス受付',
				tel: '044-959-3032',
				fax: null,
				hours: '10:00 - 18:00（サービス受付 17:30まで）',
				closed: '火曜日・水曜日（祝日を除く）',
				desc: '敷地内併設の認証工場にてMINI専門メカニックが確実に対応。専用テスターによる正確な診断と純正パーツによるメンテナンスを実施します。',
				ctaLabel: 'MINIサービス予約',
				ctaUrl: 'https://secure-p2.mini.jp/mini/jsf/service/index.jsf'
			}
		]),
		related_hub_title: '同一敷地内：Nicole BMW 新百合ヶ丘支店',
		related_hub_url: '/location/nicole-bmw-shinyurigaoka/',
		related_hub_desc: '同敷地内にNicole BMW 新車ショールームおよびBMW Premium Selection認定中古車センターを併設しております。BMWをご覧のお客様はこちらをご確認ください。',
		access_car_tokyo: '世田谷通り（津久井道）を町田・相模原方面へ直進。「片平2丁目」交差点至近、右手に見えるNicoleグループ複合拠点へお入りください。',
		access_car_yokohama: '国道246号線より尻手黒川道路を経由し新百合ヶ丘方面へ約20分。津久井道合流地点すぐ。駐車場完備。',
		access_train: '小田急小田原線・多摩線「新百合ヶ丘駅」北口より徒歩約15分、または小田急多摩線「五月台駅」より徒歩約8分。',
		access_taxi: '小田急線「新百合ヶ丘駅」北口タクシー乗り場より「片平のBMW・MINIディーラーまで」とお伝えください（約5分）。'
	}
];

const insertStmt = db.prepare(`
	INSERT OR REPLACE INTO "ec_locations" (
		"id", "slug", "status", "title", "brand", "facility_type",
		"postal", "address", "tel", "fax", "google_maps_url",
		"featured_image", "gallery", "badges",
		"concept_title", "concept_text", "departments",
		"related_hub_title", "related_hub_url", "related_hub_desc",
		"access_car_tokyo", "access_car_yokohama", "access_train", "access_taxi",
		"created_at", "updated_at", "published_at", "locale"
	) VALUES (
		?, ?, 'published', ?, ?, ?,
		?, ?, ?, ?, ?,
		?, ?, ?,
		?, ?, ?,
		?, ?, ?,
		?, ?, ?, ?,
		datetime('now'), datetime('now'), datetime('now'), 'en'
	)
`);

for (const loc of seedLocations) {
	insertStmt.run(
		loc.id, loc.slug, loc.title, loc.brand, loc.facility_type,
		loc.postal, loc.address, loc.tel, loc.fax, loc.google_maps_url,
		loc.featured_image, loc.gallery, loc.badges,
		loc.concept_title, loc.concept_text, loc.departments,
		loc.related_hub_title, loc.related_hub_url, loc.related_hub_desc,
		loc.access_car_tokyo, loc.access_car_yokohama, loc.access_train, loc.access_taxi
	);
	console.log(`[Setup Locations] Inserted/Updated location: ${loc.title} (${loc.slug})`);
}

console.log('[Setup Locations] Migration and seed data insertion completed successfully!');
