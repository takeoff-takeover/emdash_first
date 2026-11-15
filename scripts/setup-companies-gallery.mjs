import fs from "node:fs";
import { DatabaseSync } from "node:sqlite";

const dbPath = ".wrangler/state/v3/d1/miniflare-D1DatabaseObject/c5f74f54de1b54dfe248af0cae042e755774e9e90fc1e7dc6e84e3d6d7130474.sqlite";
const db = new DatabaseSync(dbPath);

console.log("=== Setting up Companies Gallery & Sections ===");

// 1. seed/seed.json の更新
const seedPath = "seed/seed.json";
const seed = JSON.parse(fs.readFileSync(seedPath, "utf8"));
const compCollection = seed.collections.find(c => c.slug === "companies");

if (!compCollection) {
	console.error("companies collection not found in seed.json");
	process.exit(1);
}

// 既存フィールドのラベルをセクション接頭辞付きに整理
const fieldUpdates = {
	title: { label: "【基本情報】会社名（正式日本語表記）" },
	name_en: { label: "【基本情報】会社名（英語表記）" },
	role_badge: { label: "【基本情報】役割・取扱ブランド（例: フェラーリ正規販売代理店）" },
	hero_image: { label: "【ヒーローカバー】メインカバー写真（ヒーロー画像）" },
	hero_phrase: { label: "【ヒーローカバー】導入メッセージ・キャッチコピー" },
	highlight_1_num: { label: "【実績ハイライト】数値 1（例: 2年連続）" },
	highlight_1_label: { label: "【実績ハイライト】ラベル 1（例: 最優秀ディーラー賞）" },
	highlight_2_num: { label: "【実績ハイライト】数値 2（例: 2014年）" },
	highlight_2_label: { label: "【実績ハイライト】ラベル 2（例: 設立・正規指名）" },
	highlight_3_num: { label: "【実績ハイライト】数値 3（例: 3拠点）" },
	highlight_3_label: { label: "【実績ハイライト】ラベル 3（例: 新車・認定中古車・サービス）" }
};

compCollection.fields.forEach(f => {
	if (fieldUpdates[f.slug]) {
		f.label = fieldUpdates[f.slug].label;
	}
});

// 新規ギャラリーフィールドの定義
const galleryFields = [];
for (let i = 1; i <= 6; i++) {
	const numStr = String(i).padStart(2, "0");
	galleryFields.push(
		{ slug: `gallery_image_${i}`, label: `【写真ギャラリー】写真 ${numStr}`, type: "image" },
		{ slug: `gallery_title_${i}`, label: `【写真ギャラリー】写真 ${numStr} タイトル`, type: "string" },
		{ slug: `gallery_caption_${i}`, label: `【写真ギャラリー】写真 ${numStr} 説明文`, type: "string" }
	);
}

// 既存の fields にギャラリーフィールドを追加（重複防止）
galleryFields.forEach(gf => {
	if (!compCollection.fields.some(f => f.slug === gf.slug)) {
		compCollection.fields.push(gf);
	}
});

fs.writeFileSync(seedPath, JSON.stringify(seed, null, 2), "utf8");
console.log("Updated seed/seed.json successfully.");

// 2. データベースのテーブル（ec_companies）へのカラム追加
const existingCols = db.prepare("PRAGMA table_info('ec_companies');").all().map(c => c.name);

for (let i = 1; i <= 6; i++) {
	const cols = [
		{ name: `gallery_image_${i}`, type: "TEXT" },
		{ name: `gallery_title_${i}`, type: "TEXT" },
		{ name: `gallery_caption_${i}`, type: "TEXT" }
	];

	for (const col of cols) {
		if (!existingCols.includes(col.name)) {
			console.log(`Adding column: ${col.name} (${col.type})`);
			db.prepare(`ALTER TABLE ec_companies ADD COLUMN ${col.name} ${col.type};`).run();
		}
	}
}

// 3. _emdash_fields テーブルの更新
// コレクションIDの取得
const compColRow = db.prepare("SELECT id FROM _emdash_collections WHERE slug = 'companies';").get();
const collectionId = compColRow?.id || "01M5WCOMPANIESCOLLECTION01";

// ラベルの更新と新規フィールド登録
compCollection.fields.forEach((f, idx) => {
	const fieldId = `01FLD_COMP_${f.slug.toUpperCase()}_01`.slice(0, 32);
	const columnType = f.type === "image" || f.type === "portableText" ? "JSON" : "TEXT";

	const existing = db.prepare("SELECT id FROM _emdash_fields WHERE collection_id = ? AND slug = ?;").get(collectionId, f.slug);
	if (existing) {
		db.prepare("UPDATE _emdash_fields SET label = ?, sort_order = ? WHERE id = ?;").run(f.label, idx, existing.id);
	} else {
		db.prepare(`
			INSERT INTO _emdash_fields (id, collection_id, slug, label, type, column_type, required, sort_order)
			VALUES (?, ?, ?, ?, ?, ?, 0, ?);
		`).run(fieldId, collectionId, f.slug, f.label, f.type, columnType, idx);
	}
});
console.log("Updated _emdash_fields metadata.");

// 4. Nicole Competizione の現在の実在ギャラリー写真（5枚）を初期シード登録
const initialPhotos = [
	{
		image: { src: "/uploads/2026/02/トーンカーブ-1-e1773743622630-1-1024x683.jpg", alt: "Nicole Competizione メインショールーム展示エリア" },
		title: "メインショールーム",
		caption: "横浜みなとみらいに位置する最新CI基準の跳ね馬展示フロア"
	},
	{
		image: { src: "/uploads/wp/2026/02/Z7A8366_re_web-1024x683.avif", alt: "Nicole Competizione アトリエ・パーソナライゼーション空間" },
		title: "アトリエ（Atelier）",
		caption: "内外装マテリアルを選び世界に一台を仕立てるパーソナライゼーション空間"
	},
	{
		image: { src: "/uploads/2026/02/24_0206_nicol_kohoku_34664_re_re-e1773743709911-2-1024x683.jpg", alt: "Nicole Competizione プレオウンドショールーム 展示スペース" },
		title: "プレオウンドショールーム",
		caption: "厳格な品質基準をクリアしたFerrari Approved認定中古車展示フロア"
	},
	{
		image: { src: "/uploads/wp/2026/08/24_0206_nicol_kohoku_33477_re_web-1024x683.jpg", alt: "Nicole Competizione サービスセンター ワークショップ" },
		title: "サービスセンター・テクニカルベイ",
		caption: "マラネッロ基準の専用診断テスターと設備を備えるテクニカルベイ"
	},
	{
		image: { src: "/uploads/wp/2026/02/24_0206_nicol_kohoku_35084_re_web-1024x683.avif", alt: "Nicole Competizione オーナーズラウンジ" },
		title: "オーナーズラウンジ",
		caption: "フェラーリのヘリテージを感じながら寛げるプライベートラウンジ"
	}
];

const updateSets = [];
const params = [];

initialPhotos.forEach((p, idx) => {
	const i = idx + 1;
	updateSets.push(`gallery_image_${i} = ?`, `gallery_title_${i} = ?`, `gallery_caption_${i} = ?`);
	params.push(JSON.stringify(p.image), p.title, p.caption);
});

params.push("nicole-competizione");

db.prepare(`UPDATE ec_companies SET ${updateSets.join(", ")} WHERE slug = ?;`).run(...params);
console.log("Seeded initial 5 gallery photos to Nicole Competizione record.");

console.log("=== Setup Complete ===");
