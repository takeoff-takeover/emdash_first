import fs from 'fs';

const raw = fs.readFileSync('src/pages/bmw.astro', 'utf8');
const startQuote = raw.indexOf('const elementorHtml = "') + 'const elementorHtml = "'.length;
const endQuote = raw.lastIndexOf('";\n---');
const html = raw.slice(startQuote, endQuote).replace(/\\"/g, '"').replace(/\\n/g, '\n').replace(/\\t/g, '\t');

const locHeadingIdx = html.indexOf('Nicole BMW 店舗一覧');
const locLoopStart = html.indexOf('<div class="elementor-loop-container elementor-grid"', locHeadingIdx);

const locAllItemIndices = [];
let pos = locLoopStart;
while (true) {
  const next = html.indexOf('<div data-elementor-type="loop-item"', pos);
  if (next === -1) break;
  locAllItemIndices.push(next);
  pos = next + 10;
}

const lastLocItem = locAllItemIndices[locAllItemIndices.length - 1];
console.log('lastLocItem starts at:', lastLocItem);
console.log('lastLocItem tag:', html.slice(lastLocItem, lastLocItem + 150));
console.log('Next 1000 chars from lastLocItem + 6800:');
console.log(html.slice(lastLocItem + 6800, lastLocItem + 7800));
