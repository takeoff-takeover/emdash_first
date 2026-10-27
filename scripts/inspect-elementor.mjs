import fs from 'fs';

const xml = fs.readFileSync('wordpress-export.xml', 'utf8');
const items = xml.split('<item>');

function getMeta(itemXml, key) {
  const reg = new RegExp(`<wp:meta_key><!\\[CDATA\\[${key}\\]\\]><\\/wp:meta_key>\\s*<wp:meta_value><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/wp:meta_value>`);
  const m = itemXml.match(reg);
  return m ? m[1] : null;
}

const report = {};

for (const it of items) {
  const postTypeMatch = it.match(/<wp:post_type><!\[CDATA\[(.*?)\]\]><\/wp:post_type>/);
  if (!postTypeMatch || postTypeMatch[1] !== 'page') continue;

  const slugMatch = it.match(/<wp:post_name><!\[CDATA\[(.*?)\]\]><\/wp:post_name>/);
  const titleMatch = it.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/);
  const slug = slugMatch ? slugMatch[1] : '';
  const title = titleMatch ? titleMatch[1] : '';

  const rawElementor = getMeta(it, '_elementor_data');
  if (rawElementor) {
    try {
      const data = JSON.parse(rawElementor);
      report[slug] = {
        title,
        elementsCount: data.length,
        hasData: true
      };
    } catch (e) {
      report[slug] = { title, error: e.message };
    }
  } else {
    report[slug] = { title, hasData: false };
  }
}

console.log(JSON.stringify(report, null, 2));
