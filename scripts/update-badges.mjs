// scripts/update-badges.mjs
// ec_locations テーブルの badges カラムを統一された表記に更新
import { DatabaseSync } from 'node:sqlite';

const DB_PATH = '.wrangler/state/v3/d1/miniflare-D1DatabaseObject/c5f74f54de1b54dfe248af0cae042e755774e9e90fc1e7dc6e84e3d6d7130474.sqlite';
const db = new DatabaseSync(DB_PATH);

console.log('[Update Badges] Updating location badges...');

const updates = [
	{
		slug: 'nicole-bmw-kawasaki',
		badges: 'BMW 新車, BMW（ALPINA）サービス, MINI サービス'
	},
	{
		slug: 'nicole-bmw-shinyurigaoka',
		badges: 'BMW 新車, BMW 認定中古車, BMW（ALPINA）サービス, MINI サービス'
	},
	{
		slug: 'mini-shinyurigaoka',
		badges: 'MINI 新車, MINI 認定中古車, MINI サービス'
	}
];

for (const u of updates) {
	db.prepare('UPDATE ec_locations SET badges = ? WHERE slug = ?;').run(u.badges, u.slug);
	console.log(`Updated badges for ${u.slug}: ${u.badges}`);
}

console.log('[Update Badges] Completed successfully.');
