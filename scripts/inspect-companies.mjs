import fs from 'fs';

const xml = fs.readFileSync('wordpress-export.xml', 'utf8');
const items = xml.split('<item>');

const slugs = ['nicole-cars', 'nicole-automobiles', 'nicole-motorcars', 'nicole-competizione', 'nicole-racing-japan'];

for (const it of items) {
  const slugMatch = it.match(/<wp:post_name><!\[CDATA\[(.*?)\]\]><\/wp:post_name>/);
  const slug = slugMatch ? slugMatch[1] : '';
  if (slugs.includes(slug)) {
    const titleMatch = it.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/);
    const contentMatch = it.match(/<content:encoded><!\[CDATA\[([\s\S]*?)\]\]><\/content:encoded>/);
    const content = contentMatch ? contentMatch[1] : '';
    
    // Extract SVG
    const svgMatch = content.match(/<svg[\s\S]*?<\/svg>/);
    console.log(`\n================ ${slug} (${titleMatch ? titleMatch[1] : ''}) ================`);
    console.log('Has SVG Logo:', !!svgMatch);
    if (svgMatch) console.log('SVG viewBox:', svgMatch[0].match(/viewBox="[^"]+"/)?.[0]);
    
    // Extract text blocks
    const texts = content.replace(/<svg[\s\S]*?<\/svg>/g, '').replace(/<[^>]+>/g, '\n').split('\n').map(t => t.trim()).filter(Boolean);
    console.log('Texts:', texts.slice(0, 10));
  }
}
