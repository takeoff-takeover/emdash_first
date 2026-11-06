import fs from 'node:fs';

let content = fs.readFileSync('src/layouts/NicoleLayout.astro', 'utf8');
const isCrlf = content.includes('\r\n');
const nl = isCrlf ? '\r\n' : '\n';

// Replace interface Props
content = content.replace(
	/interface Props \{[\s\S]*?currentSlug\?: string;\s*\}/,
	`interface Props {${nl}\ttitle?: string;${nl}\tdescription?: string;${nl}\tisMagazine?: boolean;${nl}\tcurrentSlug?: string;${nl}\tjsonLd?: Record<string, any> | Array<Record<string, any>>;${nl}}`
);

// Replace const props unpacking
content = content.replace(
	/const \{[\s\S]*?currentSlug\s*\} = Astro\.props;/,
	`const {${nl}\ttitle = "HOME - ニコル・グループ",${nl}\tdescription = "東京・神奈川エリアを中心に、世界のプレミアムブランドを通じて最高の喜びをお届けするカーディーラー・グループ。",${nl}\tisMagazine = false,${nl}\tcurrentSlug,${nl}\tjsonLd${nl}} = Astro.props;${nl}${nl}const organizationSchema = {${nl}\t"@context": "https://schema.org",${nl}\t"@type": "AutoDealer",${nl}\t"name": "ニコル・グループ (Nicole Group)",${nl}\t"alternateName": "Nicole Group",${nl}\t"url": "https://my-emdash-site.kaz130.workers.dev",${nl}\t"logo": "https://my-emdash-site.kaz130.workers.dev/uploads/2026/01/NICOLE_N_LOGO_neg.svg",${nl}\t"description": "東京・神奈川エリアを中心にBMW、MINI、Rolls-Royce、Ferrariなどの正規ディーラーおよび認定サービス工場を展開するプレミアムカーディーラーグループ。",${nl}\t"brand": [${nl}\t\t{ "@type": "Brand", "name": "BMW" },${nl}\t\t{ "@type": "Brand", "name": "MINI" },${nl}\t\t{ "@type": "Brand", "name": "Rolls-Royce" },${nl}\t\t{ "@type": "Brand", "name": "Ferrari" },${nl}\t\t{ "@type": "Brand", "name": "BMW ALPINA" }${nl}\t],${nl}\t"areaServed": ["東京都", "神奈川県"]${nl}};`
);

// Inject JSON-LD in head
content = content.replace(
	/<slot name="head" \/>\s*<\/head>/,
	`<script type="application/ld+json" set:html={JSON.stringify(organizationSchema)} />${nl}\t{jsonLd && (${nl}\t\t<script type="application/ld+json" set:html={JSON.stringify(jsonLd)} />${nl}\t)}${nl}\t<slot name="head" />${nl}</head>`
);

fs.writeFileSync('src/layouts/NicoleLayout.astro', content, 'utf8');
console.log('Updated NicoleLayout successfully.');
