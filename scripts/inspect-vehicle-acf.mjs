// scripts/inspect-vehicle-acf.mjs
import fs from 'fs';

const xml = fs.readFileSync('wordpress-export.xml', 'utf8');
const items = xml.split('<item>').slice(1);

for (const item of items) {
  const postType = item.match(/<wp:post_type><!\[CDATA\[(.*?)\]\]><\/wp:post_type>/)?.[1];
  const title = item.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/)?.[1] || item.match(/<title>(.*?)<\/title>/)?.[1];
  if (postType === 'acf-field' && (title.includes('車') || title.includes('モデル') || title.includes('価格') || title.includes('スペック') || title.includes('ブランド'))) {
    const postName = item.match(/<wp:post_name><!\[CDATA\[(.*?)\]\]><\/wp:post_name>/)?.[1];
    const content = item.match(/<content:encoded><!\[CDATA\[([\s\S]*?)\]\]><\/content:encoded>/)?.[1] || '';
    console.log(`ACF Field: ${title} (${postName})`);
  }
}
