// scripts/inspect-all-live-pages.mjs
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const targets = [
  { slug: 'corporate', url: 'https://www.nicole.co.jp/corporate/' },
  { slug: 'philosophy', url: 'https://www.nicole.co.jp/philosophy/' },
  { slug: 'nicole-cars', url: 'https://www.nicole.co.jp/corporate/nicole-cars/' },
  { slug: 'nicole-automobiles', url: 'https://www.nicole.co.jp/corporate/nicole-automobiles/' },
  { slug: 'nicole-motorcars', url: 'https://www.nicole.co.jp/corporate/nicole-motorcars/' },
  { slug: 'nicole-competizione', url: 'https://www.nicole.co.jp/corporate/nicole-competizione/' },
  { slug: 'nicole-racing-japan', url: 'https://www.nicole.co.jp/corporate/nicole-racing-japan/' },
  { slug: 'bmw', url: 'https://www.nicole.co.jp/bmw/' },
  { slug: 'mini', url: 'https://www.nicole.co.jp/mini/' },
  { slug: 'locations', url: 'https://www.nicole.co.jp/locations/' },
  { slug: 'esg_sdgs', url: 'https://www.nicole.co.jp/esg_sdgs/' },
  { slug: 'privacystatement', url: 'https://www.nicole.co.jp/privacystatement/' },
  { slug: 'customer-policy', url: 'https://www.nicole.co.jp/corporate/customer-policy/' },
  { slug: 'contact', url: 'https://www.nicole.co.jp/contact/' },
  { slug: 'contact-thanks', url: 'https://www.nicole.co.jp/contact-thanks/' },
];

async function checkAll() {
  for (const t of targets) {
    try {
      const res = await fetch(t.url);
      const text = await res.text();
      const postIdMatch = text.match(/data-elementor-id="(\d+)"/);
      const postCssMatch = text.match(/post-(\d+)\.css/g);
      console.log(`[${res.status}] ${t.slug} -> el-id: ${postIdMatch ? postIdMatch[1] : 'none'}, css: ${postCssMatch ? [...new Set(postCssMatch)].join(', ') : 'none'}, html len: ${text.length}`);
    } catch (e) {
      console.error(`ERR ${t.slug}: ${e.message}`);
    }
  }
}

checkAll();
