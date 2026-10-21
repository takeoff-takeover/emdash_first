import type { APIRoute } from "astro";
import { env } from "cloudflare:workers";

export const POST: APIRoute = async ({ request }) => {
	try {
		const formData = await request.formData();
		const file = formData.get("file") as File | null;

		if (!file) {
			return new Response(JSON.stringify({ ok: false, error: "ファイルが送信されていません" }), {
				status: 400,
				headers: { "Content-Type": "application/json" }
			});
		}

		const bytes = await file.arrayBuffer();
		const ext = file.name.split(".").pop() || "jpg";
		const key = `slider_${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`;

		const r2 = (env as any).MEDIA;
		await r2.put(key, bytes, {
			httpMetadata: {
				contentType: file.type || "image/jpeg"
			}
		});

		// EmDash の画像配信用URL
		const url = `/_emdash/api/media/file/${key}`;

		return new Response(
			JSON.stringify({
				ok: true,
				url,
				key,
				name: file.name,
				size: file.size
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
