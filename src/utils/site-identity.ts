/** Resolved media reference from getSiteSettings() */
export interface MediaReference {
	mediaId: string;
	alt?: string;
	url?: string;
}

export interface BlogSiteIdentitySettings {
	title?: string;
	tagline?: string;
	logo?: MediaReference;
	favicon?: MediaReference;
}

const DEFAULT_SITE_TITLE = "ニコル・グループ";
const DEFAULT_SITE_TAGLINE = "期待を超える喜びを。プレミアム・カー・ブランドの正規ディーラー・グループ。";

export function resolveBlogSiteIdentity(settings?: BlogSiteIdentitySettings): {
	siteTitle: string;
	siteTagline: string;
	siteLogo: MediaReference | null;
} {
	const isDefaultTitle = !settings?.title || settings.title === "My Blog" || settings.title === "THE MOMENT";
	const isDefaultTagline = !settings?.tagline || settings.tagline === "Thoughts, stories, and ideas." || settings.tagline === "Thoughts on building for the web";

	return {
		siteTitle: isDefaultTitle ? DEFAULT_SITE_TITLE : (settings?.title ?? DEFAULT_SITE_TITLE),
		siteTagline: isDefaultTagline ? DEFAULT_SITE_TAGLINE : (settings?.tagline ?? DEFAULT_SITE_TAGLINE),
		siteLogo: settings?.logo?.url ? settings.logo : { mediaId: "nicole-logo", url: "/logo.svg", alt: "ニコル・グループ" },
	};
}


