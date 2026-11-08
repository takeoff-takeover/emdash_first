import type { APIRoute } from "astro";
import { env } from "cloudflare:workers";
import fs from "node:fs";
import { DatabaseSync } from "node:sqlite";

// ローカル開発用DBパスの検索
function getLocalDb() {
	try {
		const d1Dir = ".wrangler/state/v3/d1/miniflare-D1DatabaseObject";
		if (fs.existsSync(d1Dir)) {
			const files = fs.readdirSync(d1Dir);
			const dbFile = files.find((f: string) => f.endsWith(".sqlite") && !f.includes("metadata") && !f.includes("bak"));
			if (dbFile) {
				return new DatabaseSync(`${d1Dir}/${dbFile}`);
			}
		}
		if (fs.existsSync("seed/backup.sqlite")) {
			return new DatabaseSync("seed/backup.sqlite");
		}
	} catch (e) {
		console.error("Local SQLite init error:", e);
	}
	return null;
}

// 閲覧数の取得 (GET /api/views?slug=xxx または GET /api/views?top=5)
export const GET: APIRoute = async ({ url }) => {
	try {
		const slug = url.searchParams.get("slug");
		const top = url.searchParams.get("top");
		let db: any = null;
		try {
			db = (env as any)?.DB;
		} catch (e) {}

		// ランキング取得（上位 N 件）
		if (top) {
			const limit = Math.min(Math.max(parseInt(top, 10) || 5, 1), 20);
			if (db) {
				const results = await db
					.prepare("SELECT slug, views FROM article_views ORDER BY views DESC LIMIT ?")
					.bind(limit)
					.all();
				return new Response(JSON.stringify({ ok: true, ranking: results.results || [] }), {
					headers: { "Content-Type": "application/json" }
				});
			} else {
				const localDb = getLocalDb();
				if (localDb) {
					const rows = localDb.prepare("SELECT slug, views FROM article_views ORDER BY views DESC LIMIT ?").all(limit);
					return new Response(JSON.stringify({ ok: true, ranking: rows }), {
						headers: { "Content-Type": "application/json" }
					});
				}
			}
			return new Response(JSON.stringify({ ok: true, ranking: [] }), { headers: { "Content-Type": "application/json" } });
		}

		// 単一記事の閲覧数取得
		if (!slug) {
			return new Response(JSON.stringify({ ok: false, error: "slug is required" }), {
				status: 400,
				headers: { "Content-Type": "application/json" }
			});
		}

		let views = 0;
		if (db) {
			const row = await db.prepare("SELECT views FROM article_views WHERE slug = ?").bind(slug).first();
			if (row && typeof (row as any).views === "number") {
				views = (row as any).views;
			}
		} else {
			const localDb = getLocalDb();
			if (localDb) {
				const row: any = localDb.prepare("SELECT views FROM article_views WHERE slug = ?").get(slug);
				if (row && typeof row.views === "number") {
					views = row.views;
				}
			}
		}

		return new Response(JSON.stringify({ ok: true, slug, views }), {
			headers: { "Content-Type": "application/json" }
		});
	} catch (e: any) {
		return new Response(JSON.stringify({ ok: false, error: e.message }), {
			status: 500,
			headers: { "Content-Type": "application/json" }
		});
	}
};

// 閲覧数のインクリメント (POST /api/views, body: { slug: string, collection?: string })
export const POST: APIRoute = async ({ request }) => {
	try {
		const body = (await request.json().catch(() => ({}))) as Record<string, any>;
		const slug = body?.slug;
		const collection = body?.collection || "magazine";

		if (!slug) {
			return new Response(JSON.stringify({ ok: false, error: "slug is required" }), {
				status: 400,
				headers: { "Content-Type": "application/json" }
			});
		}

		const now = new Date().toISOString();
		let currentViews = 1;
		let db: any = null;
		try {
			db = (env as any)?.DB;
		} catch (e) {}

		if (db) {
			await db.prepare(`
				INSERT INTO article_views (slug, collection, views, created_at, updated_at)
				VALUES (?, ?, 1, ?, ?)
				ON CONFLICT(slug) DO UPDATE SET
					views = views + 1,
					updated_at = excluded.updated_at
			`).bind(slug, collection, now, now).run();

			const updated = await db.prepare("SELECT views FROM article_views WHERE slug = ?").bind(slug).first();
			if (updated && typeof (updated as any).views === "number") {
				currentViews = (updated as any).views;
			}
		} else {
			const localDb = getLocalDb();
			if (localDb) {
				localDb.prepare(`
					INSERT INTO article_views (slug, collection, views, created_at, updated_at)
					VALUES (?, ?, 1, ?, ?)
					ON CONFLICT(slug) DO UPDATE SET
						views = views + 1,
						updated_at = excluded.updated_at
				`).run(slug, collection, now, now);

				const updated: any = localDb.prepare("SELECT views FROM article_views WHERE slug = ?").get(slug);
				if (updated && typeof updated.views === "number") {
					currentViews = updated.views;
				}
			}
		}

		return new Response(JSON.stringify({ ok: true, slug, views: currentViews }), {
			headers: { "Content-Type": "application/json" }
		});
	} catch (e: any) {
		return new Response(JSON.stringify({ ok: false, error: e.message }), {
			status: 500,
			headers: { "Content-Type": "application/json" }
		});
	}
};
