import fs from 'fs';
import path from 'path';

const xml = fs.readFileSync('wordpress-export.xml', 'utf8');
const items = xml.split('<item>');

const slugs = [
  'nicole-cars',
  'nicole-automobiles',
  'nicole-motorcars',
  'nicole-competizione',
  'nicole-racing-japan'
];

const destDir = path.resolve('public/logos');
if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });

for (const it of items) {
  const slugMatch = it.match(/<wp:post_name><!\[CDATA\[(.*?)\]\]><\/wp:post_name>/);
  const slug = slugMatch ? slugMatch[1] : '';
  if (slugs.includes(slug)) {
    const contentMatch = it.match(/<content:encoded><!\[CDATA\[([\s\S]*?)\]\]><\/content:encoded>/);
    const content = contentMatch ? contentMatch[1] : '';
    const svgMatch = content.match(/<svg[\s\S]*?<\/svg>/);
    if (svgMatch) {
      let svg = svgMatch[0];
      // Ensure fill="currentColor" or fill="#ffffff" if not specified
      if (!svg.includes('fill=')) {
        svg = svg.replace('<svg ', '<svg fill="currentColor" ');
      }
      const filePath = path.join(destDir, `${slug}.svg`);
      fs.writeFileSync(filePath, svg, 'utf8');
      console.log(`Saved SVG: public/logos/${slug}.svg`);
    }
  }
}
