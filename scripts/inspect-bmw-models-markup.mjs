// scripts/inspect-bmw-models-markup.mjs
import fs from 'fs';

const bmwHtml = fs.readFileSync('src/pages/bmw.astro', 'utf8');
const miniHtml = fs.readFileSync('src/pages/mini.astro', 'utf8');

console.log('=== BMW PAGE SEARCH FOR MODELS ===');
// look for headings or titles
const bmwHeadings = [...bmwHtml.matchAll(/<h[2-4][^>]*>(.*?)<\/h[2-4]>/gi)].map(m => m[1]);
console.log('BMW Headings sample:', bmwHeadings.slice(0, 30));

console.log('\n=== MINI PAGE SEARCH FOR MODELS ===');
const miniHeadings = [...miniHtml.matchAll(/<h[2-4][^>]*>(.*?)<\/h[2-4]>/gi)].map(m => m[1]);
console.log('MINI Headings sample:', miniHeadings.slice(0, 30));
