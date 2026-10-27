import fs from 'fs';

const raw = fs.readFileSync('src/pages/bmw.astro', 'utf8');
const startQuote = raw.indexOf('const elementorHtml = "') + 'const elementorHtml = "'.length;
const endQuote = raw.lastIndexOf('";\n---');
const html = raw.slice(startQuote, endQuote).replace(/\\"/g, '"').replace(/\\n/g, '\n').replace(/\\t/g, '\t');

const regex = /<div data-elementor-type="loop-item" data-elementor-id="7256" class="[^"]*post-(\d+) ([^"]*)"/g;
let m;
const locItems = [];
while ((m = regex.exec(html)) !== null) {
  locItems.push({ postId: m[1], classes: m[2], index: m.index });
}

console.log('Location loop items count in BMW:', locItems.length);
for (const item of locItems) {
  // Extract name/title and address from this item's markup
  const itemHtml = html.slice(item.index, item.index + 7000);
  const title = itemHtml.match(/<h[2345] class="elementor-heading-title[^>]*>(.*?)<\/h[2345]>/)?.[1] ||
                itemHtml.match(/<a[^>]*>(Nicole BMW [^<]*)<\/a>/)?.[1] ||
                itemHtml.match(/(Nicole BMW [^<]+)/)?.[1];
  console.log(`Post ${item.postId}:`, title?.trim());
}
