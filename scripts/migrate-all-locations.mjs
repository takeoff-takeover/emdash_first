// scripts/migrate-all-locations.mjs
// locations.json の全21拠点を ec_locations テーブルに完全移行・同期するスクリプト
import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';

const DB_PATH = '.wrangler/state/v3/d1/miniflare-D1DatabaseObject/c5f74f54de1b54dfe248af0cae042e755774e9e90fc1e7dc6e84e3d6d7130474.sqlite';
const db = new DatabaseSync(DB_PATH);

console.log('[Migrate Locations] Starting full database migration...');

// 1. lat, lng カラムの追加
try {
	db.exec('ALTER TABLE ec_locations ADD COLUMN lat REAL;');
	console.log('Added column: lat');
} catch (e) {
	if (!e.message.includes('duplicate column')) console.warn('lat:', e.message);
}
try {
	db.exec('ALTER TABLE ec_locations ADD COLUMN lng REAL;');
	console.log('Added column: lng');
} catch (e) {
	if (!e.message.includes('duplicate column')) console.warn('lng:', e.message);
}

// 2. locations.json 読み込み
const locationsRaw = JSON.parse(fs.readFileSync('src/data/locations.json', 'utf8'));

// スラッグと取扱バッジの厳密な定義
const LOCATION_METAS = {
	'loc-1': {
		slug: 'nicole-bmw-kawasaki',
		badges: 'BMW 新車, BMW（ALPINA）サービス, MINI サービス'
	},
	'loc-2': {
		slug: 'nicole-bmw-kohoku',
		badges: 'BMW 新車, BMW（ALPINA）サービス, MINI サービス'
	},
	'loc-3': {
		slug: 'nicole-bmw-aoba-miyamae',
		badges: 'BMW 新車, BMW（ALPINA）サービス'
	},
	'loc-4': {
		slug: 'nicole-bmw-shinyurigaoka',
		badges: 'BMW 新車, BMW 認定中古車, BMW（ALPINA）サービス, MINI サービス'
	},
	'loc-5': {
		slug: 'nicole-bmw-ota',
		badges: 'BMW 新車'
	},
	'loc-13': {
		slug: 'bps-kohoku',
		badges: 'BMW 認定中古車'
	},
	'loc-14': {
		slug: 'bps-shinyurigaoka',
		badges: 'BMW 認定中古車'
	},
	'loc-22': {
		slug: 'nicole-bmw-service-centre',
		badges: 'BMW（ALPINA）サービス, MINI サービス, Rolls-Royce サービス'
	},
	'loc-6': {
		slug: 'mini-kohoku',
		badges: 'MINI 新車'
	},
	'loc-7': {
		slug: 'mini-tsuzuki',
		badges: 'MINI 新車'
	},
	'loc-8': {
		slug: 'mini-shinyurigaoka',
		badges: 'MINI 新車, MINI サービス'
	},
	'loc-15': {
		slug: 'mini-next-kohoku',
		badges: 'MINI 認定中古車'
	},
	'loc-16': {
		slug: 'mini-next-shinyurigaoka',
		badges: 'MINI 認定中古車, MINI サービス'
	},
	'loc-9': {
		slug: 'rolls-royce-motor-cars-yokohama',
		badges: 'Rolls-Royce 新車, Rolls-Royce 認定中古車'
	},
	'loc-10': {
		slug: 'nicole-competizione-showroom',
		badges: 'Ferrari 新車'
	},
	'loc-17': {
		slug: 'nicole-competizione-pre-owned',
		badges: 'Ferrari 認定中古車'
	},
	'loc-23': {
		slug: 'nicole-competizione-service-centre',
		badges: 'Ferrari サービス'
	},
	'loc-11': {
		slug: 'nicole-aoyama',
		badges: 'ALPINA 車両'
	},
	'loc-12': {
		slug: 'nicole-setagaya',
		badges: 'ALPINA 車両'
	},
	'loc-25': {
		slug: 'office-kawasaki',
		badges: '本社・オフィス'
	},
	'loc-24': {
		slug: 'office-yokohama',
		badges: '本社・オフィス'
	}
};

const insertStmt = db.prepare(`
	INSERT INTO ec_locations (
		id, slug, status, locale, title, brand, postal, address, tel,
		featured_image, badges, lat, lng, created_at, updated_at, published_at, version
	) VALUES (
		?, ?, 'published', 'en', ?, ?, ?, ?, ?,
		?, ?, ?, ?, datetime('now'), datetime('now'), datetime('now'), 1
	)
`);

const updateStmt = db.prepare(`
	UPDATE ec_locations SET
		title = ?,
		brand = ?,
		postal = ?,
		address = ?,
		tel = ?,
		featured_image = ?,
		badges = ?,
		lat = ?,
		lng = ?,
		updated_at = datetime('now')
	WHERE slug = ?
`);

for (const loc of locationsRaw) {
	const meta = LOCATION_METAS[loc.id] || { slug: loc.id, badges: '' };
	const slug = meta.slug;
	const badges = meta.badges;
	const image = loc.image || loc.featuredImage || '';

	const existing = db.prepare('SELECT id, slug FROM ec_locations WHERE slug = ?;').get(slug);

	if (existing) {
		updateStmt.run(
			loc.name,
			loc.brand,
			loc.postal || '',
			loc.address || '',
			loc.tel || '',
			image,
			badges,
			loc.lat || null,
			loc.lng || null,
			slug
		);
		console.log(`Updated [${slug}] ${loc.name}`);
	} else {
		const id = `01LOC_${loc.id.replace(/-/g, '_').toUpperCase()}_${Date.now().toString(36)}`;
		insertStmt.run(
			id,
			slug,
			loc.name,
			loc.brand,
			loc.postal || '',
			loc.address || '',
			loc.tel || '',
			image,
			badges,
			loc.lat || null,
			loc.lng || null
		);
		console.log(`Inserted [${slug}] ${loc.name} (id: ${id})`);
	}
}

console.log('[Migrate Locations] Migration completed successfully.');
