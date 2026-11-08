import { defineMiddleware } from "astro:middleware";

export const onRequest = defineMiddleware(async (_context, next) => {
	const response = await next();
	// 本番公開フラグ（PUBLIC_ALLOW_INDEXING === 'true'）が未設定の場合は検索除外ヘッダーを付与
	const allowIndexing = import.meta.env.PUBLIC_ALLOW_INDEXING === "true";
	if (!allowIndexing) {
		response.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
	}
	return response;
});
