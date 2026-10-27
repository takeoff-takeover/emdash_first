import fs from 'fs';

const xml = fs.readFileSync('wordpress-export.xml', 'utf8');
const items = xml.split('<item>');

for (const it of items) {
  const slugMatch = it.match(/<wp:post_name><!\[CDATA\[(.*?)\]\]><\/wp:post_name>/);
  const slug = slugMatch ? slugMatch[1] : '';
  if (slug === 'bmw' || slug === 'mini') {
    const raw = it.match(/<content:encoded><!\[CDATA\[([\s\S]*?)\]\]><\/content:encoded>/)?.[1] || '';
    const imgs = raw.match(/https?:\/\/[^\s"'<>]+\.(?:jpg|jpeg|png|svg|webp)/gi) || [];
    console.log(`\n=== ${slug.toUpperCase()} IMAGES (${imgs.length}) ===`);
    console.log([...new Set(imgs)]);
    
    // Check links
    const links = raw.match(/href="([^"]+)"/g) || [];
    console.log(`Links (${links.length}):`, [...new Set(links)].slice(0, 10));
  }
}
