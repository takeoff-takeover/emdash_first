import fs from 'fs';

const raw = fs.readFileSync('src/pages/mini.astro', 'utf8');
const startQuote = raw.indexOf('const elementorHtml = "') + 'const elementorHtml = "'.length;
const endQuote = raw.lastIndexOf('";\n---');
const html = raw.slice(startQuote, endQuote).replace(/\\"/g, '"').replace(/\\n/g, '\n').replace(/\\t/g, '\t');

// 1. Vehicles
const modelHeadingIdx = html.indexOf('MINI MODEL LINE UP') !== -1 ? html.indexOf('MINI MODEL LINE UP') : html.indexOf('MODEL LINE UP');
const modelLoopStart = html.indexOf('<div class="elementor-loop-container elementor-grid"', modelHeadingIdx);
const modelStyleEnd = html.indexOf('</style>', modelLoopStart) + '</style>'.length;
const firstVehicleIdx = html.indexOf('<div data-elementor-type="loop-item"', modelStyleEnd);

const locHeadingIdx = html.indexOf('Nicole MINI 店舗一覧') !== -1 ? html.indexOf('Nicole MINI 店舗一覧') : html.indexOf('店舗一覧', firstVehicleIdx);
const lastVehicleIdx = html.lastIndexOf('<div data-elementor-type="loop-item" data-elementor-id="143"', locHeadingIdx);

let depth = 0;
let lastVehicleEnd = -1;
for (let i = lastVehicleIdx; i < locHeadingIdx; i++) {
  if (html.slice(i, i + 4) === '<div') {
    depth++;
  } else if (html.slice(i, i + 6) === '</div>') {
    depth--;
    if (depth === 0) {
      lastVehicleEnd = i + 6;
      break;
    }
  }
}

console.log('MINI Vehicle loop:', { firstVehicleIdx, lastVehicleEnd });

// 2. Locations
const firstLocIdx = html.indexOf('<div data-elementor-type="loop-item" data-elementor-id="7256"', locHeadingIdx);

const lastLocIdx = html.lastIndexOf('<div data-elementor-type="loop-item" data-elementor-id="7256"');

let locDepth = 0;
let lastLocEnd = -1;
for (let i = lastLocIdx; i < html.length; i++) {
  if (html.slice(i, i + 4) === '<div') {
    locDepth++;
  } else if (html.slice(i, i + 6) === '</div>') {
    locDepth--;
    if (locDepth === 0) {
      lastLocEnd = i + 6;
      break;
    }
  }
}

console.log('MINI Location loop:', { firstLocIdx, lastLocEnd });
console.log('Slice after lastVehicleEnd (first 100):', JSON.stringify(html.slice(lastVehicleEnd, lastVehicleEnd + 100)));
console.log('Slice after lastLocEnd (first 100):', JSON.stringify(html.slice(lastLocEnd, lastLocEnd + 100)));
