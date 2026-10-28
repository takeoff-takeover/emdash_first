import fs from 'fs';

let content = fs.readFileSync('src/pages/magazine/[slug].astro', 'utf8');

if (content.includes('/uploads/ix4/key-visual.svg')) {
  content = content.replaceAll('/uploads/ix4/key-visual.svg', '/uploads/ix4/key-visual.jpg');
  console.log('Replaced key-visual.svg with key-visual.jpg in magazine/[slug].astro');
}

fs.writeFileSync('src/pages/magazine/[slug].astro', content, 'utf8');
