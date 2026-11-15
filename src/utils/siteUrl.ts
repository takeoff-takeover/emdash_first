// src/utils/siteUrl.ts
// サイトURLを環境変数（SITE_URL, PUBLIC_SITE_URL）およびAstro.siteから動的に解決する共通ユーティリティ

export function getSiteUrl(astroSite?: URL): string {
	if (astroSite) {
		return astroSite.toString().replace(/\/$/, "");
	}
	const envUrl = (typeof process !== "undefined" && (process.env.SITE_URL || process.env.PUBLIC_SITE_URL)) ||
		(import.meta.env && (import.meta.env.SITE_URL || import.meta.env.PUBLIC_SITE_URL)) ||
		"https://my-emdash-site.kaz130.workers.dev";
	return envUrl.replace(/\/$/, "");
}
