// scripts/inspect-acf-groups.mjs
import fs from 'fs';

const xml = fs.readFileSync('wordpress-export.xml', 'utf8');
const items = xml.split('<item>').slice(1);

for (const item of items) {
  const postType = item.match(/<wp:post_type><!\[CDATA\[(.*?)\]\]><\/wp:post_type>/)?.[1];
  if (postType === 'acf-field-group') {
    const title = item.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/)?.[1] || item.match(/<title>(.*?)<\/title>/)?.[1];
    const postName = item.match(/<wp:post_name><!\[CDATA\[(.*?)\]\]><\/wp:post_name>/)?.[1];
    console.log(`ACF Group: ${title} (${postName})`);
  }
}
