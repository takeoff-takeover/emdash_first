import type { APIRoute } from "astro";
import { env } from "cloudflare:workers";

export const GET: APIRoute = async ({ url }) => {
	try {
		const slug = url.searchParams.get("slug");
		if (!slug) {
			return new Response(JSON.stringify({ ok: false, error: "スラグが指定されていません" }), {
				status: 400,
				headers: { "Content-Type": "application/json" }
			});
		}

		const db = (env as any).DB;
		const row = await db.prepare("SELECT content, title, featured_image FROM ec_posts WHERE slug = ?").bind(slug).first();
		if (!row) {
			return new Response(JSON.stringify({ ok: false, error: "記事が見つかりません" }), {
				status: 404,
				headers: { "Content-Type": "application/json" }
			});
		}

		let content = [];
		try {
			content = typeof row.content === "string" ? JSON.parse(row.content) : row.content;
			if (!Array.isArray(content)) content = [];
		} catch (e) {
			content = [];
		}

		const sliderBlock = content.find((b: any) => b && b._type === "slider");
		const photos: Array<{ image: string; caption: string }> = [];

		if (sliderBlock) {
			if (sliderBlock.id) {
				photos.push({ image: sliderBlock.id, caption: sliderBlock.title || "" });
			}
			if (sliderBlock.images) {
				const extras = sliderBlock.images.split(/[\n,]/).map((s: string) => s.trim()).filter(Boolean);
				extras.forEach((u: string, idx: number) => {
					photos.push({ image: u, caption: `${sliderBlock.title || "写真"} (${idx + 2})` });
				});
			}
		} else {
			// スライダーがない場合、アイキャッチ画像を初期写真としてセット
			let feat = row.featured_image;
			if (typeof feat === "string") {
				try { feat = JSON.parse(feat); } catch (e) {}
			}
			if (feat && typeof feat === "object") {
				const src = feat.src || (feat.meta?.storageKey ? `/_emdash/api/media/file/${feat.meta.storageKey}` : (feat.id ? `/_emdash/api/media/file/${feat.id}` : ""));
				if (src) {
					photos.push({ image: src, caption: row.title || "メイン写真" });
				}
			}
		}

		return new Response(JSON.stringify({ ok: true, photos, title: sliderBlock?.title || "フォトギャラリー" }), {
			headers: { "Content-Type": "application/json" }
		});
	} catch (e: any) {
		return new Response(JSON.stringify({ ok: false, error: e.message }), {
			status: 500,
			headers: { "Content-Type": "application/json" }
		});
	}
};
