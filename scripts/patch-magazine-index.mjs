import fs from 'fs';

let content = fs.readFileSync('src/pages/magazine/index.astro', 'utf8');

// Replace sort and coverArticle logic
const oldLogic = `// 一番目玉の記事（Cover Story）\nconst coverArticle = allArticles.find(a => a.isFeatured) || allArticles[0];`;
const newLogic = `// 最新の最重要記事（BMW iX4）を確実に先頭（Cover Story）にする
allArticles.sort((a, b) => {
	if (a.id === "2027_new_bmw_ix4_neue_klasse" || a.slug === "2027_new_bmw_ix4_neue_klasse") return -1;
	if (b.id === "2027_new_bmw_ix4_neue_klasse" || b.slug === "2027_new_bmw_ix4_neue_klasse") return 1;
	return 0;
});

// 一番目玉の記事（Cover Story）
const coverArticle = allArticles[0];`;

if (content.includes('const coverArticle = allArticles.find(a => a.isFeatured) || allArticles[0];')) {
  content = content.replace(
    'const coverArticle = allArticles.find(a => a.isFeatured) || allArticles[0];',
    `// 最新の最重要記事（BMW iX4）を確実に先頭（Cover Story）にする
allArticles.sort((a, b) => {
	if (a.id === "2027_new_bmw_ix4_neue_klasse" || a.slug === "2027_new_bmw_ix4_neue_klasse") return -1;
	if (b.id === "2027_new_bmw_ix4_neue_klasse" || b.slug === "2027_new_bmw_ix4_neue_klasse") return 1;
	return 0;
});

// 一番目玉の記事（Cover Story）
const coverArticle = allArticles[0];`
  );
  console.log('Replaced coverArticle selection logic.');
} else {
  console.log('coverArticle logic pattern not found');
}

// Replace THE ALL-NEW BMW X5.
if (content.includes('THE ALL-NEW BMW X5.')) {
  content = content.replace(
    /<h1 class="apple-hero__title">\s*THE ALL-NEW BMW X5\.\s*<\/h1>/,
    `<h1 class="apple-hero__title">
							{coverArticle.id === "2027_new_bmw_ix4_neue_klasse" || coverArticle.slug === "2027_new_bmw_ix4_neue_klasse" 
								? "THE ALL-NEW BMW iX4." 
								: coverArticle.title}
						</h1>`
  );
  console.log('Replaced hero title.');
}

// Replace lead
if (content.includes('【世界初公開】プレミアムSAVの開拓者が第5世代へ。')) {
  content = content.replace(
    /<p class="apple-hero__lead">[\s\S]*?<\/p>/,
    `<p class="apple-hero__lead">
							{coverArticle.id === "2027_new_bmw_ix4_neue_klasse" || coverArticle.slug === "2027_new_bmw_ix4_neue_klasse"
								? "【世界初公開】BMWノイエ・クラッセ初の完全電動スポーツ・アクティビティ・クーペ。流麗なファストバック造形、最高出力612馬力のM60 xDrive、そして航続828kmが切り拓く新時代。"
								: coverArticle.lead}
						</p>`
  );
  console.log('Replaced hero lead.');
}

fs.writeFileSync('src/pages/magazine/index.astro', content, 'utf8');
console.log('Updated src/pages/magazine/index.astro');
