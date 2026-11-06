import fs from 'node:fs';

let content = fs.readFileSync('src/pages/magazine/[slug].astro', 'utf8');

// We need to construct articleJsonLd and pass it to NicoleLayout
const jsonLdLogic = `
const pageUrl = \`https://my-emdash-site.kaz130.workers.dev/magazine/\${slug}\`;
const articleJsonLd: any = [
	{
		"@context": "https://schema.org",
		"@type": "Article",
		"mainEntityOfPage": {
			"@type": "WebPage",
			"@id": pageUrl
		},
		"headline": post.data.title,
		"description": post.data.excerpt || "世界最高峰のモビリティと美学を編むNicole Connect公式記事。",
		"image": heroImageUrl ? [heroImageUrl.startsWith("http") ? heroImageUrl : \`https://my-emdash-site.kaz130.workers.dev\${heroImageUrl}\`] : [],
		"datePublished": (post.data as any).publishedAt || (post.data as any).published_at || new Date().toISOString(),
		"dateModified": (post.data as any).updatedAt || (post.data as any).updated_at || (post.data as any).publishedAt || new Date().toISOString(),
		"author": {
			"@type": "Organization",
			"name": "ニコル・グループ (Nicole Group)",
			"url": "https://my-emdash-site.kaz130.workers.dev"
		},
		"publisher": {
			"@type": "Organization",
			"name": "ニコル・グループ",
			"logo": {
				"@type": "ImageObject",
				"url": "https://my-emdash-site.kaz130.workers.dev/uploads/2026/01/NICOLE_N_LOGO_neg.svg"
			}
		}
	}
];

// If content has FAQ block, construct FAQPage JSON-LD
if (Array.isArray(post.data?.content)) {
	const faqBlock = post.data.content.find((b: any) => b._type === "editorial-tools:faq");
	if (faqBlock && Array.isArray(faqBlock.items) && faqBlock.items.length > 0) {
		articleJsonLd.push({
			"@context": "https://schema.org",
			"@type": "FAQPage",
			"mainEntity": faqBlock.items.map((item: any) => ({
				"@type": "Question",
				"name": item.question,
				"acceptedAnswer": {
					"@type": "Answer",
					"text": item.answer
				}
			}))
		});
	}
}
`;

content = content.replace(
	`const editUrl = postDbId \n\t? \`/_emdash/admin/content/\${contentCollection}/\${postDbId}\`\n\t: \`/_emdash/admin/content/\${contentCollection}\`;`,
	`const editUrl = postDbId \n\t? \`/_emdash/admin/content/\${contentCollection}/\${postDbId}\`\n\t: \`/_emdash/admin/content/\${contentCollection}\`;\n${jsonLdLogic}`
);

// If CRLF
content = content.replace(
	`const editUrl = postDbId \r\n\t? \`/_emdash/admin/content/\${contentCollection}/\${postDbId}\`\r\n\t: \`/_emdash/admin/content/\${contentCollection}\`;`,
	`const editUrl = postDbId \r\n\t? \`/_emdash/admin/content/\${contentCollection}/\${postDbId}\`\r\n\t: \`/_emdash/admin/content/\${contentCollection}\`;\r\n${jsonLdLogic}`
);

// Add jsonLd to NicoleLayout props
content = content.replace(
	`isMagazine={true}\n\tcurrentSlug={slug}\n>`,
	`isMagazine={true}\n\tcurrentSlug={slug}\n\tjsonLd={articleJsonLd}\n>`
);
content = content.replace(
	`isMagazine={true}\r\n\tcurrentSlug={slug}\r\n>`,
	`isMagazine={true}\r\n\tcurrentSlug={slug}\r\n\tjsonLd={articleJsonLd}\r\n>`
);

fs.writeFileSync('src/pages/magazine/[slug].astro', content, 'utf8');
console.log('Updated magazine [slug].astro with Article and FAQPage JSON-LD');
