import fs from 'fs';

const raw = fs.readFileSync('src/pages/bmw.astro', 'utf8');
const startQuote = raw.indexOf('const elementorHtml = "') + 'const elementorHtml = "'.length;
const endQuote = raw.lastIndexOf('";\n---');
const html = raw.slice(startQuote, endQuote).replace(/\\"/g, '"').replace(/\\n/g, '\n').replace(/\\t/g, '\t');

// Extract 1st model card
const model1Start = html.indexOf('<div data-elementor-type="loop-item" data-elementor-id="143"');
const model2Start = html.indexOf('<div data-elementor-type="loop-item" data-elementor-id="143"', model1Start + 10);
const sampleModelHtml = html.slice(model1Start, model2Start);

console.log('=== SAMPLE MODEL ITEM HTML ===');
console.log(sampleModelHtml);

// Extract 1st location card
const loc1Start = html.indexOf('<div data-elementor-type="loop-item" data-elementor-id="7256"');
const loc2Start = html.indexOf('<div data-elementor-type="loop-item" data-elementor-id="7256"', loc1Start + 10);
const sampleLocHtml = html.slice(loc1Start, loc2Start);

console.log('=== SAMPLE LOCATION ITEM HTML ===');
console.log(sampleLocHtml);
