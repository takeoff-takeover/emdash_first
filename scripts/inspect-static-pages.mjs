import fs from 'fs';

const xml = fs.readFileSync('wordpress-export.xml', 'utf8');
const items = xml.split('<item>');

const targetSlugs = [
  'nicole-cars',
  'nicole-automobiles',
  'nicole-motorcars',
  'nicole-competizione',
  'nicole-racing-japan',
  'bmw',
  'mini',
  'privacystatement',
  'customer-policy',
  'esg_sdgs',
  'contact',
  'contact-thanks',
  'campaign'
];

for (const it of items) {
  const postTypeMatch = it.match(/<wp:post_type><!\[CDATA\[(.*?)\]\]><\/wp:post_type>/);
  if (!postTypeMatch || postTypeMatch[1] !== 'page') continue;

  const slugMatch = it.match(/<wp:post_name><!\[CDATA\[(.*?)\]\]><\/wp:post_name>/);
  const titleMatch = it.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/);
  const slug = slugMatch ? slugMatch[1] : '';
  const title = titleMatch ? titleMatch[1] : '';

  if (targetSlugs.includes(slug)) {
    console.log(`\n========================================`);
    console.log(`PAGE: [${slug}] - ${title}`);
    
    // Check if elementor data exists
    const hasElementor = it.includes('<wp:meta_key><![CDATA[_elementor_data]]></wp:meta_key>');
    console.log(`Has Elementor Data:`, hasElementor);

    // Get content:encoded
    const contentMatch = it.match(/<content:encoded><!\[CDATA\[([\s\S]*?)\]\]><\/content:encoded>/);
    const content = contentMatch ? contentMatch[1] : '';
    console.log(`Content Length:`, content.length);
    console.log(`Content Preview (first 400 chars):`);
    console.log(content.slice(0, 400));
    
    // Check for images
    const images = content.match(/https?:\/\/[^\s"'<>]+\.(?:jpg|jpeg|png|svg|webp)/gi) || [];
    console.log(`Images found in content (${images.length}):`, [...new Set(images)].slice(0, 5));
  }
}
