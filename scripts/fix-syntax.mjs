import fs from 'fs';

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  content = content.replace(') : {isBMWX5 ? (', ') : isBMWX5 ? (');
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Fixed syntax in:', filePath);
}

fixFile('src/pages/magazine/[slug].astro');
fixFile('src/pages/posts/[slug].astro');
