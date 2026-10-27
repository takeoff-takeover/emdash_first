import fs from 'fs';

const xml = fs.readFileSync('wordpress-export.xml', 'utf8');
const postTypes = new Set();
const regex = /<wp:post_type><!\[CDATA\[(.*?)\]\]><\/wp:post_type>/g;
let m;
while ((m = regex.exec(xml)) !== null) {
  postTypes.add(m[1]);
}
console.log('Post types in XML:', Array.from(postTypes));

// Check count of each
for (const pt of postTypes) {
  const count = (xml.match(new RegExp(`<wp:post_type><!\\[CDATA\\[${pt}\\]\\]><\\/wp:post_type>`, 'g')) || []).length;
  console.log(`  ${pt}: ${count}`);
}
