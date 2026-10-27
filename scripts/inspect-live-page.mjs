// scripts/inspect-live-page.mjs
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

async function check(url) {
  const res = await fetch(url);
  const html = await res.text();
  console.log('=== URL:', url, 'Length:', html.length, '===');
  
  // Extract CSS stylesheets
  const regex = /<link\s+[^>]*rel=["']stylesheet["'][^>]*>/gi;
  const links = html.match(regex) || [];
  console.log('Stylesheet tags found:', links.length);
  for (const l of links) {
    const hrefMatch = l.match(/href=["']([^"']+)["']/);
    if (hrefMatch) {
      const h = hrefMatch[1];
      if (h.includes('elementor') || h.includes('post-') || h.includes('astra')) {
        console.log('  ->', h);
      }
    }
  }

  // Find Elementor content block
  const entryMatch = html.match(/<div class="entry-content[^"]*"[^>]*>([\s\S]*?)<\/div>\s*<!-- \.entry-content -->/) ||
                     html.match(/(<div data-elementor-type="wp-page"[\s\S]*?)<\/article>/);
  if (entryMatch) {
    console.log('Found entry-content block! Length:', entryMatch[0].length);
    console.log('First 300 chars:', entryMatch[0].slice(0, 300));
  } else {
    console.log('No entry-content block found.');
  }
}

async function run() {
  await check('https://www.nicole.co.jp/corporate/nicole-cars/');
  await check('https://www.nicole.co.jp/corporate/');
}

run();
