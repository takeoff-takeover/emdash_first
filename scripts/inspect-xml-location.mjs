import fs from 'fs';

const xml = fs.readFileSync('wordpress-export.xml', 'utf8');

const targetIds = ['7016', '4594', '5200'];
for (const id of targetIds) {
  const itemMarker = `<wp:post_id>${id}</wp:post_id>`;
  const idx = xml.indexOf(itemMarker);
  if (idx !== -1) {
    const itemStart = xml.lastIndexOf('<item>', idx);
    const itemEnd = xml.indexOf('</item>', idx) + '</item>'.length;
    const itemXml = xml.slice(itemStart, itemEnd);
    console.log(`=== Location Post ${id} ===`);
    // Extract title, post_name, post_type, postmeta
    const title = itemXml.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/)?.[1] || itemXml.match(/<title>(.*?)<\/title>/)?.[1];
    const postName = itemXml.match(/<wp:post_name><!\[CDATA\[(.*?)\]\]><\/wp:post_name>/)?.[1] || itemXml.match(/<wp:post_name>(.*?)<\/wp:post_name>/)?.[1];
    const postType = itemXml.match(/<wp:post_type><!\[CDATA\[(.*?)\]\]><\/wp:post_type>/)?.[1] || itemXml.match(/<wp:post_type>(.*?)<\/wp:post_type>/)?.[1];
    console.log('Title:', title, '| postName:', postName, '| postType:', postType);

    // ACF / postmeta keys
    const metaRegex = /<wp:meta_key><!\[CDATA\[(.*?)\]\]><\/wp:meta_key>\s*<wp:meta_value><!\[CDATA\[(.*?)\]\]><\/wp:meta_value>/gs;
    let m;
    const meta = {};
    while ((m = metaRegex.exec(itemXml)) !== null) {
      if (!m[1].startsWith('_')) {
        meta[m[1]] = m[2];
      }
    }
    console.log('Meta keys:', Object.keys(meta));
    console.log('Sample meta:', meta);

    // Categories / taxonomies
    const catRegex = /<category domain="([^"]+)" nicename="([^"]+)"><!\[CDATA\[(.*?)\]\]><\/category>/g;
    let c;
    const cats = [];
    while ((c = catRegex.exec(itemXml)) !== null) {
      cats.push({ domain: c[1], slug: c[2], name: c[3] });
    }
    console.log('Taxonomies:', cats);
  } else {
    console.log(`Post ID ${id} not found in XML!`);
  }
}
