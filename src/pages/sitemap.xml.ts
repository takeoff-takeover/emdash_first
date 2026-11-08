import type { APIRoute } from "astro";
import { getEmDashCollection } from "emdash";

export const GET: APIRoute = async () => {
	const siteUrl = (import.meta.env.PUBLIC_SITE_URL || "https://my-emdash-site.kaz130.workers.dev").replace(/\/$/, "");
	const now = new Date().toISOString();

	type SitemapPage = { 
		url: string; 
		priority: string; 
		changefreq: string; 
		lastmod?: string;
		image?: { loc: string; title?: string };
	};

	const staticPages: SitemapPage[] = [
		{ url: `${siteUrl}/`, priority: "1.0", changefreq: "daily" },
		{ url: `${siteUrl}/magazine/`, priority: "0.9", changefreq: "daily" },
		{ url: `${siteUrl}/news`, priority: "0.9", changefreq: "daily" },
		{ url: `${siteUrl}/locations`, priority: "0.8", changefreq: "weekly" },
		{ url: `${siteUrl}/campaigns`, priority: "0.8", changefreq: "daily" },
		{ url: `${siteUrl}/bmw`, priority: "0.8", changefreq: "weekly" },
		{ url: `${siteUrl}/mini`, priority: "0.8", changefreq: "weekly" },
		{ url: `${siteUrl}/corporate`, priority: "0.7", changefreq: "monthly" },
		{ url: `${siteUrl}/corporate/nicole-cars`, priority: "0.7", changefreq: "monthly" },
		{ url: `${siteUrl}/corporate/nicole-competizione`, priority: "0.7", changefreq: "monthly" },
		{ url: `${siteUrl}/corporate/nicole-motorcars`, priority: "0.7", changefreq: "monthly" },
		{ url: `${siteUrl}/corporate/nicole-racing-japan`, priority: "0.7", changefreq: "monthly" },
		{ url: `${siteUrl}/corporate/nicole-automobiles`, priority: "0.7", changefreq: "monthly" },
		{ url: `${siteUrl}/philosophy`, priority: "0.7", changefreq: "monthly" },
		{ url: `${siteUrl}/esg_sdgs`, priority: "0.7", changefreq: "monthly" },
		{ url: `${siteUrl}/customer-policy`, priority: "0.5", changefreq: "yearly" },
		{ url: `${siteUrl}/privacystatement`, priority: "0.5", changefreq: "yearly" },
		{ url: `${siteUrl}/contact`, priority: "0.8", changefreq: "monthly" },
	];

	const dynamicUrls: SitemapPage[] = [];

	const formatImageUrl = (img: any): string | null => {
		if (!img) return null;
		const src = typeof img === "string" ? img : img.src;
		if (!src) return null;
		return src.startsWith("http") ? src : `${siteUrl}${src.startsWith("/") ? "" : "/"}${src}`;
	};

	// 1. マガジン記事
	try {
		const magResult = await getEmDashCollection("magazine" as any, { limit: 100 });
		if (magResult?.entries) {
			for (const entry of magResult.entries) {
				const slug = entry.id;
				const lastmod = entry.data?.updated_at || entry.data?.published_at;
				const imgUrl = formatImageUrl(entry.data?.featured_image);
				dynamicUrls.push({
					url: `${siteUrl}/magazine/${slug}`,
					priority: "0.8",
					changefreq: "weekly",
					lastmod: lastmod ? new Date(lastmod).toISOString() : now,
					image: imgUrl ? { loc: imgUrl, title: entry.data?.title } : undefined,
				});
			}
		}
	} catch (e) {}

	// 2. お知らせ記事 (posts コレクション -> /news/[slug])
	try {
		const newsResult = await getEmDashCollection("posts", { limit: 100 });
		if (newsResult?.entries) {
			for (const entry of newsResult.entries) {
				const slug = entry.id;
				const lastmod = entry.data?.updatedAt || entry.data?.publishedAt;
				const imgUrl = formatImageUrl(entry.data?.featured_image);
				dynamicUrls.push({
					url: `${siteUrl}/news/${slug}`,
					priority: "0.8",
					changefreq: "weekly",
					lastmod: lastmod ? new Date(lastmod).toISOString() : now,
					image: imgUrl ? { loc: imgUrl, title: entry.data?.title } : undefined,
				});
			}
		}
	} catch (e) {}

	// 3. キャンペーン詳細 (campaigns コレクション -> /campaigns/[slug])
	try {
		const cmpResult = await getEmDashCollection("campaigns" as any, { limit: 50 });
		if (cmpResult?.entries) {
			for (const entry of cmpResult.entries) {
				const slug = entry.id;
				const lastmod = entry.data?.updated_at || entry.data?.published_at;
				const imgUrl = formatImageUrl(entry.data?.featured_image || entry.data?.image);
				dynamicUrls.push({
					url: `${siteUrl}/campaigns/${slug}`,
					priority: "0.7",
					changefreq: "weekly",
					lastmod: lastmod ? new Date(lastmod).toISOString() : now,
					image: imgUrl ? { loc: imgUrl, title: entry.data?.title } : undefined,
				});
			}
		}
	} catch (e) {}

	// 4. 拠点個別ページ (locations コレクション -> /location/[slug])
	try {
		const locResult = await getEmDashCollection("locations" as any, { limit: 50 });
		if (locResult?.entries) {
			for (const entry of locResult.entries) {
				const slug = entry.id;
				const lastmod = entry.data?.updated_at || entry.data?.published_at;
				const imgUrl = formatImageUrl(entry.data?.featured_image || entry.data?.image);
				dynamicUrls.push({
					url: `${siteUrl}/location/${slug}`,
					priority: "0.7",
					changefreq: "monthly",
					lastmod: lastmod ? new Date(lastmod).toISOString() : now,
					image: imgUrl ? { loc: imgUrl, title: entry.data?.title } : undefined,
				});
			}
		}
	} catch (e) {}

	const allUrls = [...staticPages, ...dynamicUrls];

	const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${allUrls
	.map(
		(p) => `  <url>
    <loc>${p.url}</loc>
    <lastmod>${p.lastmod || now}</lastmod>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>${p.image ? `
    <image:image>
      <image:loc>${p.image.loc}</image:loc>${p.image.title ? `
      <image:title>${p.image.title.replace(/[<>&'"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '\'': '&apos;', '"': '&quot;' }[c] || c))}</image:title>` : ""}
    </image:image>` : ""}
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
