// scripts/scrape-official-test.mjs
import https from 'https';

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { rejectUnauthorized: false }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

const html = await fetchUrl('https://www.nicole.co.jp/location/nicole-bmw-kawasaki-hq/');
const text = html
  .replace(/<script[\s\S]*?<\/script>/gi, '')
  .replace(/<style[\s\S]*?<\/style>/gi, '')
  .replace(/<[^>]+>/g, '\n');

const lines = text.split('\n').map(s => s.trim()).filter(Boolean);

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  if (
    line.includes('TEL') ||
    line.includes('FAX') ||
    line.includes('営業時間') ||
    line.includes('定休日') ||
    line.includes('〒') ||
    line.includes('神奈川県') ||
    line.includes('東京都')
  ) {
    console.log(`Line ${i}: ${lines.slice(i, i + 4).join(' | ')}`);
  }
}
