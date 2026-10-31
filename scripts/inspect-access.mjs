// scripts/inspect-access.mjs
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

const urls = [
  'https://www.nicole.co.jp/location/nicole-bmw-kawasaki-hq/',
  'https://www.nicole.co.jp/location/nicole-bmw-yokohama-kohoku/',
  'https://www.nicole.co.jp/location/nicole-bmw-aobamiyamae/'
];

for (const url of urls) {
  console.log('=== URL:', url, '===');
  const html = await fetchUrl(url);
  const text = html.replace(/<script[\s\S]*?<\/script>/gi, '').replace(/<style[\s\S]*?<\/style>/gi, '').replace(/<[^>]+>/g, '\n');
  const lines = text.split('\n').map(s => s.trim()).filter(Boolean);

  for (let i = 0; i < lines.length; i++) {
    const l = lines[i];
    if (l.includes('アクセス') || l.includes('お車') || l.includes('電車') || l.includes('バス') || l.includes('駅') || l.includes('IC') || l.includes('線') || l.includes('ルート')) {
      console.log(`Line ${i}: ${lines.slice(Math.max(0, i - 1), i + 4).join(' | ')}`);
    }
  }
}
