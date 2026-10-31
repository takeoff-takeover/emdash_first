// scripts/crawl-official-locations.mjs
// 公式サイトの全拠点詳細ページから店舗情報をスクレイピング
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

const DETAIL_URLS = [
  'https://www.nicole.co.jp/location/nicole-bmw-kawasaki-hq/',
  'https://www.nicole.co.jp/location/nicole-bmw-kawasaki-service/',
  'https://www.nicole.co.jp/location/nicole-bmw-yokohama-kohoku/',
  'https://www.nicole.co.jp/location/nicole-bmw-yokohama-kohoku-service/',
  'https://www.nicole.co.jp/location/nicole-bmw-aobamiyamae/',
  'https://www.nicole.co.jp/location/nicole-bmw-aobamiyamae-service/',
  'https://www.nicole.co.jp/location/nicole-bmw-shin-yurigaoka/',
  'https://www.nicole.co.jp/location/nicole-bmw-shin-yurigaoka-service/',
  'https://www.nicole.co.jp/location/bmw-premium-selection-shin-yurigaoka/',
  'https://www.nicole.co.jp/location/nicole-bmw-ota/',
  'https://www.nicole.co.jp/location/bmw-premium-selection-yokohama-kohoku/',
  'https://www.nicole.co.jp/location/nicole-bmw-service-centre/',
  'https://www.nicole.co.jp/location/mini-kohoku/',
  'https://www.nicole.co.jp/location/mini-yokohama-tsuzuki/',
  'https://www.nicole.co.jp/location/mini-shin-yurigaoka/',
  'https://www.nicole.co.jp/location/mini-next-shin-yurigaoka/',
  'https://www.nicole.co.jp/location/mini-next-yokohama-kohoku/',
  'https://www.nicole.co.jp/location/rolls-royce-motor-cars-yokohama/',
  'https://www.nicole.co.jp/location/nicole-competizione-ferrari/',
  'https://www.nicole.co.jp/location/nicole-ccompetizione-ferrari-preowned/',
  'https://www.nicole.co.jp/location/nicole-competizione-service-centre/',
  'https://www.nicole.co.jp/location/nicole-automobiles-aoyama/',
  'https://www.nicole.co.jp/location/nicole-automobiles-setagaya/',
  'https://www.nicole.co.jp/location/nicole-racing-japan-kawasaki/',
  'https://www.nicole.co.jp/location/nicole-racing-japan-yokohama/'
];

console.log(`[Crawl] Starting fetch for ${DETAIL_URLS.length} official location pages...`);

const results = [];

for (const url of DETAIL_URLS) {
  try {
    const html = await fetchUrl(url);
    const titleMatch = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
    const title = titleMatch ? titleMatch[1].replace(/<[^>]+>/g, '').trim() : '';

    const text = html
      .replace(/<script[\s\S]*?<\/script>/gi, '')
      .replace(/<style[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, '\n');

    const lines = text.split('\n').map(s => s.trim()).filter(Boolean);

    let postal = '';
    let address = '';
    let tel = '';
    let hours = '';
    let closed = '';

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      // 郵便番号
      const postM = line.match(/〒?\s*([0-9]{3}-[0-9]{4})/);
      if (postM && !postal) postal = `〒${postM[1]}`;

      // 住所
      if ((line.includes('神奈川県') || line.includes('東京都')) && !address) {
        address = line;
      }

      // 電話番号
      if (line.includes('TEL') || line.includes('電話番号')) {
        const telM = line.match(/([0-9]{2,4}-[0-9]{2,4}-[0-9]{3,4})/);
        if (telM && !tel) tel = telM[1];
        else if (lines[i+1] && lines[i+1].match(/([0-9]{2,4}-[0-9]{2,4}-[0-9]{3,4})/) && !tel) {
          tel = lines[i+1].match(/([0-9]{2,4}-[0-9]{2,4}-[0-9]{3,4})/)[1];
        }
      }

      // 営業時間
      if (line.includes('営業時間') && !hours) {
        const hM = lines.slice(i, i+3).join(' ').match(/([0-9]{1,2}:[0-9]{2}\s*～\s*[0-9]{1,2}:[0-9]{2})/);
        if (hM) hours = hM[1];
      }

      // 定休日
      if (line.includes('定休日') && !closed) {
        const cCandidate = lines[i+1] || '';
        if (cCandidate && !cCandidate.includes('住所') && !cCandidate.includes('TEL')) {
          closed = cCandidate;
        }
      }
    }

    // メイン画像（アイキャッチ）
    let image = '';
    const imgMatch = html.match(/class=\"[^\"]*wp-post-image[^\"]*\"[^>]*src=\"([^\"]+)\"/i) ||
                     html.match(/src=\"(https:\/\/www\.nicole\.co\.jp\/wp\/wp-content\/uploads\/[^\"]+\.(jpg|png|webp|jpeg))/i);
    if (imgMatch) {
      image = imgMatch[1];
    }

    results.push({
      url,
      title,
      postal,
      address,
      tel,
      hours,
      closed,
      image
    });

    console.log(`Fetched: [${title}] tel=${tel}, hours=${hours}, closed=${closed}`);
  } catch (err) {
    console.error(`Error fetching ${url}:`, err.message);
  }
}

fs.writeFileSync('scripts/official-scraped-data.json', JSON.stringify(results, null, 2));
console.log('[Crawl] Saved all data to scripts/official-scraped-data.json');
