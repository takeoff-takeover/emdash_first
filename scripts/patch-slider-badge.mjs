import fs from 'fs';

let content = fs.readFileSync('src/components/blocks/SliderBlock.astro', 'utf8');

content = content.replace(
  /<div class="slider-badge">[\s\S]*?<\/div>/,
  ''
);

fs.writeFileSync('src/components/blocks/SliderBlock.astro', content, 'utf8');
console.log('Removed PHOTO GALLERY badge from SliderBlock.astro');
