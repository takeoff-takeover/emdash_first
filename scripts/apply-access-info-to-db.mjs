// scripts/apply-access-info-to-db.mjs
// 公式サイトから取得した「店舗紹介文」「お車での行き方」「電車・バスでの行き方（沿線・駅）」をDBに完全投入
import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';

const DB_PATH = '.wrangler/state/v3/d1/miniflare-D1DatabaseObject/c5f74f54de1b54dfe248af0cae042e755774e9e90fc1e7dc6e84e3d6d7130474.sqlite';
const db = new DatabaseSync(DB_PATH);

console.log('[Apply Access] Syncing access routes & concepts into ec_locations...');

const accessData = JSON.parse(fs.readFileSync('scripts/official-access-data.json', 'utf8'));

const updateStmt = db.prepare(`
	UPDATE ec_locations SET
		concept_text = COALESCE(?, concept_text),
		access_car = COALESCE(?, access_car),
		access_train = COALESCE(?, access_train),
		updated_at = datetime('now')
	WHERE slug = ?
`);

for (const item of accessData) {
	updateStmt.run(
		item.intro || null,
		item.accessCar || null,
		item.accessTrain || null,
		item.slug
	);
	console.log(`[Synced Access] ${item.slug}: car=${!!item.accessCar}, train=${!!item.accessTrain}, intro=${!!item.intro}`);
}

console.log('[Apply Access] All access routes and store intros successfully updated.');
