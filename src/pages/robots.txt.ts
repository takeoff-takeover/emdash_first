import type { APIRoute } from "astro";
import { getSiteUrl } from "../utils/siteUrl";

export const GET: APIRoute = async ({ site }) => {
	const siteUrl = getSiteUrl(site);
	const allowIndexing = import.meta.env.PUBLIC_ALLOW_INDEXING === "true" || 
		(typeof process !== "undefined" && process.env.PUBLIC_ALLOW_INDEXING === "true");

	let robotsContent = "";

	if (allowIndexing) {
		robotsContent = [
			"# Robots.txt for Nicole Group (Production - Indexing Allowed)",
			"User-agent: *",
			"Disallow: /_emdash/",
			"Disallow: /admin",
			"Disallow: /api/",
			"Allow: /",
			"",
			`Sitemap: ${siteUrl}/sitemap.xml`,
			""
		].join("\n");
	} else {
		robotsContent = [
			"# Robots.txt for Nicole Group (Staging / Development - Noindex)",
			"User-agent: *",
			"Disallow: /",
			"",
			`Sitemap: ${siteUrl}/sitemap.xml`,
			""
		].join("\n");
	}

	return new Response(robotsContent, {
		status: 200,
		headers: {
			"Content-Type": "text/plain; charset=utf-8",
			"Cache-Control": "public, max-age=3600"
		}
	});
};
