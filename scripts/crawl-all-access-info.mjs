// scripts/crawl-all-access-info.mjs
// 公式サイトの全拠点から「店舗紹介文」「お車での行き方」「電車・バスでの行き方（沿線・最寄り駅）」をスクレイピング
import https from 'https';
import fs from 'fs';

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { rejectUnauthorized: false, timeout: 15000 }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

const DETAIL_MAP = [
  { slug: 'nicole-bmw-kawasaki', url: 'https://www.nicole.co.jp/location/nicole-bmw-kawasaki-hq/' },
  { slug: 'nicole-bmw-kohoku', url: 'https://www.nicole.co.jp/location/nicole-bmw-yokohama-kohoku/' },
  { slug: 'nicole-bmw-aoba-miyamae', url: 'https://www.nicole.co.jp/location/nicole-bmw-aobamiyamae/' },
  { slug: 'nicole-bmw-shinyurigaoka', url: 'https://www.nicole.co.jp/location/nicole-bmw-shin-yurigaoka/' },
  { slug: 'nicole-bmw-ota', url: 'https://www.nicole.co.jp/location/nicole-bmw-ota/' },
  { slug: 'bps-kohoku', url: 'https://www.nicole.co.jp/location/bmw-premium-selection-yokohama-kohoku/' },
  { slug: 'bps-shinyurigaoka', url: 'https://www.nicole.co.jp/location/bmw-premium-selection-shin-yurigaoka/' },
  { slug: 'nicole-bmw-service-centre', url: 'https://www.nicole.co.jp/location/nicole-bmw-service-centre/' },
  { slug: 'mini-kohoku', url: 'https://www.nicole.co.jp/location/mini-kohoku/' },
  { slug: 'mini-tsuzuki', url: 'https://www.nicole.co.jp/location/mini-yokohama-tsuzuki/' },
  { slug: 'mini-shinyurigaoka', url: 'https://www.nicole.co.jp/location/mini-shin-yurigaoka/' },
  { slug: 'mini-next-kohoku', url: 'https://www.nicole.co.jp/location/mini-next-yokohama-kohoku/' },
  { slug: 'mini-next-shinyurigaoka', url: 'https://www.nicole.co.jp/location/mini-next-shin-yurigaoka/' },
  { slug: 'rolls-royce-motor-cars-yokohama', url: 'https://www.nicole.co.jp/location/rolls-royce-motor-cars-yokohama/' },
  { slug: 'nicole-competizione-showroom', url: 'https://www.nicole.co.jp/location/nicole-competizione-ferrari/' },
  { slug: 'nicole-competizione-pre-owned', url: 'https://www.nicole.co.jp/location/nicole-ccompetizione-ferrari-preowned/' },
  { slug: 'nicole-competizione-service-centre', url: 'https://www.nicole.co.jp/location/nicole-competizione-service-centre/' },
  { slug: 'nicole-aoyama', url: 'https://www.nicole.co.jp/location/nicole-automobiles-aoyama/' },
  { slug: 'nicole-setagaya', url: 'https://www.nicole.co.jp/location/nicole-automobiles-setagaya/' },
  { slug: 'office-kawasaki', url: 'https://www.nicole.co.jp/location/nicole-racing-japan-kawasaki/' },
  { slug: 'office-yokohama', url: 'https://www.nicole.co.jp/location/nicole-racing-japan-yokohama/' }
];

console.log(`[Crawl Access] Crawling ${DETAIL_MAP.length} official location pages...`);

const results = [];

for (const item of DETAIL_MAP) {
  try {
    const html = await fetchUrl(item.url);
    const text = html
      .replace(/<script[\s\S]*?<\/script>/gi, '')
      .replace(/<style[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, '\n');

    const lines = text.split('\n').map(s => s.trim()).filter(Boolean);

    let intro = '';
    let carRoutes = [];
    let trainRoutes = [];

    // 店舗紹介文（通常「アクセス・店舗情報」の直前にある長文）
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes('アクセス・店舗情報') || lines[i] === 'アクセス') {
        if (i > 0 && lines[i-1].length > 30) {
          intro = lines[i-1];
        } else if (i > 1 && lines[i-2].length > 30) {
          intro = lines[i-2];
        }
        break;
      }
    }

    // お車での行き方
    let inCar = false;
    let inTrain = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      if (line.includes('お車でお越しの方')) {
        inCar = true;
        inTrain = false;
        continue;
      }

      if (line.includes('電車・バスでお越しの方') || line.includes('電車でお越しの方')) {
        inCar = false;
        inTrain = true;
        continue;
      }

      if (line.includes('営業時間') || line.includes('定休日') || line.includes('電話番号') || line.includes('マップで開く')) {
        inCar = false;
        inTrain = false;
        continue;
      }

      if (inCar) {
        if (!line.includes('お車でお越しの方')) {
          carRoutes.push(line);
        }
      }

      if (inTrain) {
        if (!line.includes('電車・バスでお越しの方') && !line.includes('電車でお越しの方')) {
          trainRoutes.push(line);
        }
      }
    }

    results.push({
      slug: item.slug,
      url: item.url,
      intro,
      accessCar: carRoutes.join('\n'),
      accessTrain: trainRoutes.join('\n')
    });

    console.log(`[${item.slug}] Intro: ${intro.slice(0, 30)}... | Car lines: ${carRoutes.length} | Train lines: ${trainRoutes.length}`);
  } catch (err) {
    console.error(`Error crawling ${item.slug}:`, err.message);
  }
}

fs.writeFileSync('scripts/official-access-data.json', JSON.stringify(results, null, 2));
console.log('[Crawl Access] Successfully saved to scripts/official-access-data.json');
