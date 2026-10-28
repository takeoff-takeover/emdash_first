import fs from 'fs';

// 1. src/pages/magazine/index.astro
{
  const filePath = 'src/pages/magazine/index.astro';
  let content = fs.readFileSync(filePath, 'utf8');

  const ix4Article = `	{
		id: "2027_new_bmw_ix4_neue_klasse",
		slug: "2027_new_bmw_ix4_neue_klasse",
		title: "【公式発表】新型BMW iX4登場。次世代EV専用『ノイエ・クラッセ』SACが切り拓く航続828kmの新時代",
		brand: "BMW",
		topic: "Feature",
		date: "2026.10.28",
		views: "15,820",
		image: "/uploads/ix4/key-visual.svg",
		lead: "BMW公式プレスリリースより完全電動スポーツ・アクティビティ・クーペ『BMW iX4』が世界初公開。Cd値0.23の流麗なファストバック、最大出力612馬力のM60 xDrive、航続最大828kmの新時代。",
		url: "/magazine/2027_new_bmw_ix4_neue_klasse/",
		isFeatured: true
	},`;

  if (!content.includes('2027_new_bmw_ix4_neue_klasse')) {
    content = content.replace('const staticArticles = [', 'const staticArticles = [\n' + ix4Article);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Updated:', filePath);
  } else {
    console.log('Already updated:', filePath);
  }
}

// 2. src/components/NicoleHomeMain.astro
{
  const filePath = 'src/components/NicoleHomeMain.astro';
  let content = fs.readFileSync(filePath, 'utf8');

  // fallbackInsights
  const ix4Insight = `	{
		id: "2027_new_bmw_ix4_neue_klasse",
		slug: "2027_new_bmw_ix4_neue_klasse",
		title: "【公式発表】新型BMW iX4登場。次世代EV専用『ノイエ・クラッセ』SACが切り拓く航続828kmの新時代",
		category: "BMW",
		date: "2026.10.28",
		readTime: "6 MIN READ",
		image: "/uploads/ix4/key-visual.svg",
		lead: "BMW公式プレスリリースより完全電動SAC『BMW iX4』が世界初公開。Cd値0.23の流麗なクーペフォルム、最大出力612馬力、航続最大828kmの新時代。",
		url: "/magazine/2027_new_bmw_ix4_neue_klasse/"
	},`;

  if (!content.includes('2027_new_bmw_ix4_neue_klasse')) {
    content = content.replace('const fallbackInsights = [', 'const fallbackInsights = [\n' + ix4Insight);
  }

  // newsList
  const ix4News = `	{
		date: "2026.10.28",
		category: "ニュース",
		title: "【公式発表】新型完全電動SAC『BMW iX4』誕生｜航続距離最大828kmのノイエ・クラッセ",
		url: "/magazine/2027_new_bmw_ix4_neue_klasse/"
	},`;

  if (!content.includes('【公式発表】新型完全電動SAC『BMW iX4』誕生')) {
    content = content.replace('const newsList = [', 'const newsList = [\n' + ix4News);
  }

  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Updated:', filePath);
}
