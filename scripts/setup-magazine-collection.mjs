import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';

const sqlStatements = [
	// 1. Create ec_magazine table
	`CREATE TABLE IF NOT EXISTS "ec_magazine" (
		"id" text primary key,
		"slug" text,
		"status" text default 'draft',
		"author_id" text,
		"primary_byline_id" text,
		"created_at" text default (datetime('now')),
		"updated_at" text default (datetime('now')),
		"published_at" text,
		"scheduled_at" text,
		"deleted_at" text,
		"version" integer default 1,
		"live_revision_id" text references "revisions" ("id"),
		"draft_revision_id" text references "revisions" ("id"),
		"locale" text default 'en' not null,
		"translation_group" text,
		"title" text default '' not null,
		"featured_image" text,
		"featured_image_sp" text,
		"content" json,
		"excerpt" text,
		"related_location" text,
		"notes" text,
		constraint "ec_magazine_slug_locale_unique" unique ("slug", "locale")
	);`,

	// 2. Insert into _emdash_collections
	`INSERT OR REPLACE INTO "_emdash_collections" (
		"id", "slug", "label", "label_singular", "description", "icon", "supports",
		"source", "created_at", "updated_at", "search_config", "has_seo", "url_pattern",
		"comments_enabled", "comments_moderation", "comments_closed_after_days",
		"comments_auto_approve_users", "hidden", "sort_order", "admin_config",
		"title_field", "date_field", "routable", "edit_locking", "nav_group"
	) VALUES (
		'01M5WMAGAZINE000000000001', 'magazine', 'マガジン', 'マガジン記事',
		'Nicole Connect Webマガジン専用特集記事コレクション', 'book-open',
		'["drafts","revisions","preview","scheduling","search","seo"]',
		'custom', datetime('now'), datetime('now'), '{"enabled":true}', 1,
		'/magazine/{slug}', 0, 'first_time', 90, 1, 0, 1, null, 'title', null, 1, 1, null
	);`,

	// 3. Insert fields into _emdash_fields
	`INSERT OR REPLACE INTO "_emdash_fields" ("id", "collection_id", "slug", "label", "type", "column_type", "required", "unique", "default_value", "validation", "widget", "options", "sort_order", "created_at", "searchable", "translatable", "indexed")
	VALUES
	('01M5WMAGFLD00000000000001', '01M5WMAGAZINE000000000001', 'title', 'タイトル', 'string', 'TEXT', 1, 0, null, null, null, null, 0, datetime('now'), 1, 1, 0),
	('01M5WMAGFLD00000000000002', '01M5WMAGAZINE000000000001', 'featured_image', 'アイキャッチ写真 (PC用)', 'image', 'TEXT', 0, 0, null, null, null, null, 1, datetime('now'), 0, 1, 0),
	('01M5WMAGFLD00000000000003', '01M5WMAGAZINE000000000001', 'featured_image_sp', 'アイキャッチ写真 (スマホ用)', 'image', 'TEXT', 0, 0, null, null, null, null, 2, datetime('now'), 0, 1, 0),
	('01M5WMAGFLD00000000000004', '01M5WMAGAZINE000000000001', 'content', '本文', 'portableText', 'JSON', 0, 0, null, null, null, null, 3, datetime('now'), 1, 1, 0),
	('01M5WMAGFLD00000000000005', '01M5WMAGAZINE000000000001', 'excerpt', '抜粋 / リード文', 'text', 'TEXT', 0, 0, null, null, null, null, 4, datetime('now'), 0, 1, 0),
	('01M5WMAGFLD00000000000006', '01M5WMAGAZINE000000000001', 'related_location', '関連拠点 (Related Showroom)', 'select', 'TEXT', 0, 0, null, null, null, '[{"label":"なし（設定しない）","value":""},{"label":"Nicole BMW 本社ショールーム（川崎）","value":"nicole-bmw-kawasaki"},{"label":"Nicole BMW 大田支店","value":"nicole-bmw-ota"},{"label":"Nicole BMW 青葉宮前支店","value":"nicole-bmw-aobamiyamae"},{"label":"Nicole BMW 横浜港北支店","value":"nicole-bmw-yokohama-kohoku"},{"label":"Nicole BMW 新百合ヶ丘支店","value":"nicole-bmw-shin-yurigaoka"},{"label":"ロールス・ロイス・モーター・カーズ横浜","value":"rolls-royce-yokohama"},{"label":"Nicole Competizione 青山（Ferrari）","value":"ferrari-aoyama"},{"label":"ニコル世田谷ショールーム（ALPINA）","value":"alpina-setagaya"}]', 5, datetime('now'), 0, 1, 0),
	('01M5WMAGFLD00000000000007', '01M5WMAGAZINE000000000001', 'notes', '注釈・免責事項（文字小・デフォルト空）', 'text', 'TEXT', 0, 0, null, null, null, null, 6, datetime('now'), 0, 1, 0);`,

	// 4. Create magazine_category taxonomy definitions
	`INSERT OR REPLACE INTO "_emdash_taxonomy_defs" ("id", "name", "label", "label_singular", "hierarchical", "collections", "created_at", "locale", "translation_group")
	VALUES ('taxdef_magazine_category', 'magazine_category', 'マガジンカテゴリー', 'マガジンカテゴリー', 1, '["magazine"]', datetime('now'), 'en', 'taxdef_magazine_category');`,

	`INSERT OR REPLACE INTO "_emdash_taxonomy_def_groups" ("id", "name", "hierarchical", "collections", "created_at")
	VALUES ('taxgrp_magazine_category', 'magazine_category', 1, '["magazine"]', datetime('now'));`,

	// 5. Insert terms into taxonomies (Cars, People, ESG, Buyer's Guide)
	`INSERT OR REPLACE INTO "taxonomies" ("id", "name", "slug", "label", "parent_id", "data", "locale", "translation_group", "sort_order")
	VALUES
	('term_mag_cars', 'magazine_category', 'cars', 'Cars', null, '{"description":"新型車・試乗記・テクノロジー・スペック"}', 'en', 'term_mag_cars', 1),
	('term_mag_people', 'magazine_category', 'people', 'People', null, '{"description":"オーナーズストーリー・開発者・職人・社員インタビュー"}', 'en', 'term_mag_people', 2),
	('term_mag_esg', 'magazine_category', 'esg', 'ESG', null, '{"description":"サステナビリティ・環境技術・地域社会貢献"}', 'en', 'term_mag_esg', 3),
	('term_mag_buyers_guide', 'magazine_category', 'buyers-guide', 'Buyer''s Guide', null, '{"description":"購入ガイド・認定中古車・グレード比較・充電維持費"}', 'en', 'term_mag_buyers_guide', 4);`,

	// 6. Migrate iX4 post from ec_posts into ec_magazine
	`INSERT OR REPLACE INTO "ec_magazine" (
		"id", "slug", "status", "author_id", "primary_byline_id", "created_at", "updated_at",
		"published_at", "locale", "translation_group", "title", "featured_image", "featured_image_sp",
		"content", "excerpt", "related_location", "notes"
	)
	SELECT
		"id", "slug", "status", "author_id", "primary_byline_id", "created_at", "updated_at",
		"published_at", "locale", "translation_group", "title", "featured_image", "featured_image_sp",
		"content", "excerpt", "related_location", "notes"
	FROM "ec_posts"
	WHERE "slug" = '2027_new_bmw_ix4_neue_klasse';`,

	// 7. Associate iX4 entry in content_taxonomies with 'cars'
	`INSERT OR REPLACE INTO "content_taxonomies" (
		"collection", "entry_id", "taxonomy_id", "status", "published_at", "created_at"
	)
	SELECT
		'magazine', id, 'term_mag_cars', 'published', published_at, datetime('now')
	FROM "ec_magazine"
	WHERE "slug" = '2027_new_bmw_ix4_neue_klasse';`
];

// Write SQL file for remote D1 execution
const fullSql = sqlStatements.join('\n\n');
fs.writeFileSync('seed/setup_magazine.sql', fullSql, 'utf8');
console.log('Generated seed/setup_magazine.sql');

// Apply to local SQLite
const files = fs.readdirSync('.wrangler/state/v3/d1/miniflare-D1DatabaseObject');
const sqliteFile = files.find(f => f.endsWith('.sqlite'));
const db = new DatabaseSync('.wrangler/state/v3/d1/miniflare-D1DatabaseObject/' + sqliteFile);

for (const sql of sqlStatements) {
	db.exec(sql);
}
console.log('Successfully applied to local SQLite database!');
