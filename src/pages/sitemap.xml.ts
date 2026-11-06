import type { APIRoute } from "astro";
import { getEmDashCollection } from "emdash";

export const GET: APIRoute = async () => {
	const siteUrl = "https://my-emdash-site.kaz130.workers.dev";
	const now = new Date().toISOString();

	type SitemapPage = { url: string; priority: string; changefreq: string; lastmod?: string };
	const staticPages: SitemapPage[] = [
		{ url: `${siteUrl}/`, priority: "1.0", changefreq: "daily" },
		{ url: `${siteUrl}/magazine/`, priority: "0.9", changefreq: "daily" },
		{ url: `${siteUrl}/locations`, priority: "0.8", changefreq: "weekly" },
		{ url: `${siteUrl}/corporate`, priority: "0.7", changefreq: "monthly" },
		{ url: `${siteUrl}/contact`, priority: "0.8", changefreq: "monthly" },
		{ url: `${siteUrl}/bmw`, priority: "0.8", changefreq: "weekly" },
		{ url: `${siteUrl}/mini`, priority: "0.8", changefreq: "weekly" },
		{ url: `${siteUrl}/campaigns`, priority: "0.8", changefreq: "daily" },
	];

	const articleUrls: SitemapPage[] = [];

	try {
		const magResult = await getEmDashCollection("magazine" as any, { limit: 100 });
		if (magResult?.entries) {
			for (const entry of magResult.entries) {
				const slug = entry.id;
				const lastmod = entry.data?.updated_at || entry.data?.published_at;
				articleUrls.push({
					url: `${siteUrl}/magazine/${slug}`,
					priority: "0.8",
					changefreq: "weekly",
					lastmod: lastmod ? new Date(lastmod).toISOString() : now,
				});
			}
		}
	} catch (e) {}

	const allUrls = [...staticPages, ...articleUrls];

	const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls
	.map(
		(p) => `  <url>
    <loc>${p.url}</loc>
    <lastmod>${p.lastmod || now}</lastmod>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`
	)
	.join("\n")}
</urlset>`;

	return new Response(xml, {
		status: 200,
		headers: {
			"Content-Type": "application/xml; charset=utf-8",
			"Cache-Control": "public, max-age=3600",
		},
	});
};
