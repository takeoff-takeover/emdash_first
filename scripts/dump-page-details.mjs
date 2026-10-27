import fs from 'fs';

const xml = fs.readFileSync('wordpress-export.xml', 'utf8');
const items = xml.split('<item>');

function getMeta(itemXml, key) {
  const reg = new RegExp(`<wp:meta_key><!\\[CDATA\\[${key}\\]\\]><\\/wp:meta_key>\\s*<wp:meta_value><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/wp:meta_value>`);
  const m = itemXml.match(reg);
  return m ? m[1] : null;
}

function extractElementorContent(element, output = []) {
  if (!element) return output;
  const widgetType = element.widgetType || element.elType;
  const settings = element.settings || {};

  const info = { type: widgetType };
  if (settings.title) info.title = settings.title;
  if (settings.heading_title) info.heading_title = settings.heading_title;
  if (settings.editor) info.editor = settings.editor.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  if (settings.image?.url) info.imageUrl = settings.image.url;
  if (settings.html) info.html = settings.html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 100);

  if (Object.keys(info).length > 1) {
    output.push(info);
  }

  if (element.elements && Array.isArray(element.elements)) {
    for (const child of element.elements) {
      extractElementorContent(child, output);
    }
  }
  return output;
}

const target = process.argv[2] || 'nicole-cars';

for (const it of items) {
  const postTypeMatch = it.match(/<wp:post_type><!\[CDATA\[(.*?)\]\]><\/wp:post_type>/);
  if (!postTypeMatch || postTypeMatch[1] !== 'page') continue;
  const slugMatch = it.match(/<wp:post_name><!\[CDATA\[(.*?)\]\]><\/wp:post_name>/);
  const slug = slugMatch ? slugMatch[1] : '';

  if (slug === target) {
    const titleMatch = it.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/);
    console.log(`\n=== TARGET PAGE: ${slug} (${titleMatch ? titleMatch[1] : ''}) ===`);
    const raw = getMeta(it, '_elementor_data');
    if (raw) {
      const data = JSON.parse(raw);
      const extracted = [];
      for (const el of data) {
        extractElementorContent(el, extracted);
      }
      console.log(JSON.stringify(extracted, null, 2));
    }
  }
}
