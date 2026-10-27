import type { APIRoute } from "astro";
import { env } from "cloudflare:workers";

export const POST: APIRoute = async ({ request }) => {
	try {
		const body = (await request.json()) as any;
		const { slug, title, images } = body;

		if (!slug || !Array.isArray(images) || images.length === 0) {
			return new Response(JSON.stringify({ ok: false, error: "記事スラグまたは画像が指定されていません" }), {
				status: 400,
				headers: { "Content-Type": "application/json" }
			});
		}

		const db = (env as any).DB;

		// 記事データを取得
		const row = await db.prepare("SELECT content FROM ec_posts WHERE slug = ?").bind(slug).first();
		if (!row) {
			return new Response(JSON.stringify({ ok: false, error: "指定された記事が見つかりません" }), {
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

		const mainImage = images[0]?.image || "";
		const extraImages = images.slice(1).map((item: any) => item.image).filter(Boolean).join("\n");

		// スライダーブロックを構築
		const sliderBlock = {
			_type: "slider",
			_key: `slider_${Date.now()}`,
			id: mainImage,
			title: title || "フォトギャラリー",
			images: extraImages
		};

		// 既存のスライダーブロックがあれば差し替え、なければ先頭付近（H2見出しの後）に挿入
		const existingSliderIdx = content.findIndex((b: any) => b && b._type === "slider");
		if (existingSliderIdx >= 0) {
			content[existingSliderIdx] = sliderBlock;
		} else {
			// 3番目の要素（導入段落の後）または先頭に挿入
			const insertIdx = Math.min(content.length, 3);
			content.splice(insertIdx, 0, sliderBlock);
		}

		// データベースに更新
		const updatedJson = JSON.stringify(content);
		await db.prepare("UPDATE ec_posts SET content = ? WHERE slug = ?").bind(updatedJson, slug).run();

		return new Response(
			JSON.stringify({
				ok: true,
				message: "スライダーを記事に保存・反映しました",
				count: images.length
			}),
			{
				headers: { "Content-Type": "application/json" }
			}
		);
	} catch (e: any) {
		return new Response(JSON.stringify({ ok: false, error: e.message }), {
			status: 500,
			headers: { "Content-Type": "application/json" }
		});
	}
};
