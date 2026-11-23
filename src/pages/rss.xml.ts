import type { APIRoute } from "astro";
import { getEmDashCollection, getSiteSettings } from "emdash";

import { getSiteLocale } from "../utils/locale";
import { resolveBlogSiteIdentity } from "../utils/site-identity";

export const GET: APIRoute = async ({ site, url }) => {
	const siteUrl = site ?? new URL(url.origin);
	const { siteTitle, siteTagline } = resolveBlogSiteIdentity(await getSiteSettings());

	const { entries: posts } = await getEmDashCollection("posts", {
		orderBy: { published_at: "desc" },
		limit: 20,
	});

	let magazineEntries: any[] = [];
	try {
		const magRes = await getEmDashCollection("magazine" as any, {
			orderBy: { published_at: "desc" },
			limit: 30,
		});
		magazineEntries = magRes?.entries || [];
	} catch (e) {}

	type FeedEntry = {
		title: string;
		url: string;
		pubDate: Date;
		description: string;
	};

	const feedEntries: FeedEntry[] = [];

	for (const post of posts) {
		const rawDate = post.data.publishedAt || (post.data as any).published_at;
		if (!rawDate) continue;
		const pubDate = rawDate instanceof Date ? rawDate : new Date(rawDate);
		if (Number.isNaN(pubDate.getTime())) continue;
		feedEntries.push({
			title: post.data.title || "Untitled",
			url: new URL(`/news/${post.id}`, siteUrl).href,
			pubDate,
			description: post.data.excerpt || "",
		});
	}

	for (const entry of magazineEntries) {
		const rawDate = entry.data?.publishedAt || entry.data?.published_at;
		if (!rawDate) continue;
		const pubDate = rawDate instanceof Date ? rawDate : new Date(rawDate);
		if (Number.isNaN(pubDate.getTime())) continue;
		feedEntries.push({
			title: entry.data?.title || "Untitled",
			url: new URL(`/magazine/${entry.id}`, siteUrl).href,
			pubDate,
			description: entry.data?.excerpt || "",
		});
	}

	feedEntries.sort((a, b) => b.pubDate.getTime() - a.pubDate.getTime());

	const items = feedEntries
		.slice(0, 30)
		.map((item) => {
			return `    <item>
      <title>${escapeXml(item.title)}</title>
      <link>${escapeXml(item.url)}</link>
      <guid isPermaLink="true">${escapeXml(item.url)}</guid>
      <pubDate>${item.pubDate.toUTCString()}</pubDate>
      <description>${escapeXml(item.description)}</description>
    </item>`;
		})
		.join("\n");

	const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(siteTitle)}</title>
    <description>${escapeXml(siteTagline)}</description>
	<link>${escapeXml(siteUrl.href)}</link>
	<atom:link href="${escapeXml(new URL("/rss.xml", siteUrl).href)}" rel="self" type="application/rss+xml"/>
    <language>${getSiteLocale() ?? "ja"}</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
${items}
  </channel>
</rss>`;

	return new Response(rss, {
		headers: {
			"Content-Type": "application/rss+xml; charset=utf-8",
			"Cache-Control": "public, max-age=3600",
		},
	});
};

const XML_ESCAPE_PATTERNS = [
	[/&/g, "&amp;"],
	[/</g, "&lt;"],
	[/>/g, "&gt;"],
	[/"/g, "&quot;"],
	[/'/g, "&apos;"],
] as const;

function escapeXml(str: string): string {
	let result = str;
	for (const [pattern, replacement] of XML_ESCAPE_PATTERNS) {
		result = result.replace(pattern, replacement);
	}
	return result;
}
