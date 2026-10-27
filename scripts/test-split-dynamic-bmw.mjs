// scripts/test-split-dynamic-bmw.mjs
import fs from 'fs';

const raw = fs.readFileSync('src/pages/bmw.astro', 'utf8');
// Extract string by finding the start quote and end quote
const startQuote = raw.indexOf('const elementorHtml = "') + 'const elementorHtml = "'.length;
const endQuote = raw.lastIndexOf('";\n---');
const html = raw.slice(startQuote, endQuote).replace(/\\"/g, '"').replace(/\\n/g, '\n').replace(/\\t/g, '\t');

console.log('Unescaped HTML length:', html.length);

// 1. Locate Model Loop Container
const modelHeadingIdx = html.indexOf('BMW MODEL LINE UP');
console.log('BMW MODEL LINE UP idx:', modelHeadingIdx);

const modelLoopStart = html.indexOf('<div class="elementor-loop-container elementor-grid"', modelHeadingIdx);
console.log('modelLoopStart:', modelLoopStart);

// Find next heading
const nextHeading = html.indexOf('Nicole BMW 店舗一覧', modelLoopStart);
console.log('Next heading Nicole BMW 店舗一覧 at:', nextHeading);
console.log('--- 500 chars before Nicole BMW 店舗一覧 ---');
console.log(html.slice(nextHeading - 500, nextHeading));
