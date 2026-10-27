// scripts/inspect-loop-grid.mjs
import fs from 'fs';

const bmwHtml = fs.readFileSync('src/pages/bmw.astro', 'utf8');

const loopGridMatches = [...bmwHtml.matchAll(/<div class="elementor-element[^"]*elementor-widget-loop-grid[^"]*"[^>]*>([\s\S]*?)<\/div>\s*<\/div>\s*<\/div>/g)];
console.log('Loop grids in BMW page:', loopGridMatches.length);

for (let i = 0; i < loopGridMatches.length; i++) {
  console.log(`\n--- Loop Grid #${i + 1} ---`);
  console.log(loopGridMatches[i][0].slice(0, 500));
}
