// scripts/inspect-loop-item.mjs
import fs from 'fs';

const html = fs.readFileSync('src/pages/bmw.astro', 'utf8');
const needle = 'data-elementor-type=\\"loop-item\\"';
const idx = html.indexOf(needle);
console.log('Index:', idx);
if (idx !== -1) {
  console.log(html.slice(idx, idx + 2500));
}
