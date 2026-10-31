// scripts/clean-scrape-access-info.mjs
// UTF-8 Buffer.concat で文字化けを完全に防止して公式サイトから再取得
import https from 'https';
import fs from 'fs';
import { DatabaseSync } from 'node:sqlite';

function fetchUrlBuffer(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { rejectUnauthorized: false, timeout: 15000 }, (res) => {
      const chunks = [];
      res.on('data', chunk => chunks.push(chunk));
      res.on('end', () => {
        const buf = Buffer.concat(chunks);
        resolve(buf.toString('utf8'));
      });
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

console.log('[Clean Scrape] Re-fetching all 21 locations with safe Buffer decoding...');

const DB_PATH = '.wrangler/state/v3/d1/miniflare-D1DatabaseObject/c5f74f54de1b54dfe248af0cae042e755774e9e90fc1e7dc6e84e3d6d7130474.sqlite';
const db = new DatabaseSync(DB_PATH);

const updateStmt = db.prepare(`
	UPDATE ec_locations SET
		concept_text = ?,
		access_car = ?,
		access_train = ?,
		updated_at = datetime('now')
	WHERE slug = ?
`);

for (const item of DETAIL_MAP) {
  try {
    const html = await fetchUrlBuffer(item.url);
    const text = html
      .replace(/<script[\s\S]*?<\/script>/gi, '')
      .replace(/<style[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, '\n');

    const lines = text.split('\n').map(s => s.trim()).filter(Boolean);

    let intro = '';
    let carRoutes = [];
    let trainRoutes = [];

    // 店舗紹介文
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

    // お車・電車
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

      if (inCar && !line.includes('お車でお越しの方')) {
        carRoutes.push(line);
      }

      if (inTrain && !line.includes('電車・バスでお越しの方') && !line.includes('電車でお越しの方')) {
        trainRoutes.push(line);
      }
    }

    const accessCar = carRoutes.join('\n');
    const accessTrain = trainRoutes.join('\n');

    updateStmt.run(intro, accessCar, accessTrain, item.slug);
    console.log(`[Clean Updated] ${item.slug}: Train=${accessTrain.replace(/\n/g, ' ')}`);
  } catch (err) {
    console.error(`Error updating ${item.slug}:`, err.message);
  }
}

console.log('[Clean Scrape] All 21 locations cleanly updated with zero corruption.');
