import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';

const DB_PATH = '.wrangler/state/v3/d1/miniflare-D1DatabaseObject/c5f74f54de1b54dfe248af0cae042e755774e9e90fc1e7dc6e84e3d6d7130474.sqlite';

if (!fs.existsSync(DB_PATH)) {
	console.error('Database file not found at:', DB_PATH);
	process.exit(1);
}

const db = new DatabaseSync(DB_PATH);

console.log('[Cleanup] Finding sample posts to remove...');

const targetSlugs = [
	'the-case-for-static',
	'learning-in-public',
	'small-tools-big-impact',
	'designing-with-constraints',
	'a-weekend-with-a-side-project',
	'notes-on-simplicity',
	'test2'
];

const targetPosts = db.prepare(`SELECT id, slug, title FROM ec_posts WHERE slug IN (${targetSlugs.map(() => '?').join(',')})`).all(...targetSlugs);

console.log(`Found ${targetPosts.length} sample posts:`);
targetPosts.forEach(p => console.log(` - [${p.slug}] ${p.title} (${p.id})`));

if (targetPosts.length === 0) {
	console.log('No sample posts found. Exiting.');
	process.exit(0);
}

const targetIds = targetPosts.map(p => p.id);
const placeholders = targetIds.map(() => '?').join(',');

// Delete from content_taxonomies
const taxResult = db.prepare(`DELETE FROM content_taxonomies WHERE entry_id IN (${placeholders})`).run(...targetIds);
console.log(`Deleted ${taxResult.changes} records from content_taxonomies.`);

// Delete from revisions if table exists
try {
	const revResult = db.prepare(`DELETE FROM revisions WHERE entry_id IN (${placeholders})`).run(...targetIds);
	console.log(`Deleted ${revResult.changes} records from revisions.`);
} catch (e) {
	console.log('Skipping revisions delete:', e.message);
}

// Delete from ec_posts
const postsResult = db.prepare(`DELETE FROM ec_posts WHERE id IN (${placeholders})`).run(...targetIds);
console.log(`Deleted ${postsResult.changes} sample posts from ec_posts.`);

console.log('[Cleanup] Completed successfully!');
