import fs from 'fs';

const raw = fs.readFileSync('src/pages/bmw.astro', 'utf8');
const startQuote = raw.indexOf('const elementorHtml = "') + 'const elementorHtml = "'.length;
const endQuote = raw.lastIndexOf('";\n---');
const html = raw.slice(startQuote, endQuote).replace(/\\"/g, '"').replace(/\\n/g, '\n').replace(/\\t/g, '\t');

// 1. Vehicles
const modelHeadingIdx = html.indexOf('BMW MODEL LINE UP');
const modelLoopStart = html.indexOf('<div class="elementor-loop-container elementor-grid"', modelHeadingIdx);
const modelStyleEnd = html.indexOf('</style>', modelLoopStart) + '</style>'.length;
const firstVehicleIdx = html.indexOf('<div data-elementor-type="loop-item"', modelStyleEnd);

// Find container of next section
const locHeadingIdx = html.indexOf('Nicole BMW 店舗一覧', firstVehicleIdx);
const lastVehicleIdx = html.lastIndexOf('<div data-elementor-type="loop-item" data-elementor-id="143"', locHeadingIdx);

// Count depth to find exact end of last vehicle
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

console.log('Vehicle loop:', { firstVehicleIdx, lastVehicleEnd });

// 2. Locations
const locLoopStart = html.indexOf('<div class="elementor-loop-container elementor-grid"', locHeadingIdx);
const locStyleEnd = html.indexOf('</style>', locLoopStart) !== -1 ? html.indexOf('</style>', locLoopStart) + '</style>'.length : locLoopStart;
const firstLocIdx = html.indexOf('<div data-elementor-type="loop-item" data-elementor-id="7256"', locHeadingIdx);

// Find last location item
const campaignHeadingIdx = html.indexOf('CAMPAIGN / EVENT', firstLocIdx);
const searchEnd = campaignHeadingIdx !== -1 ? campaignHeadingIdx : html.length;
const lastLocIdx = html.lastIndexOf('<div data-elementor-type="loop-item" data-elementor-id="7256"', searchEnd);

let locDepth = 0;
let lastLocEnd = -1;
for (let i = lastLocIdx; i < searchEnd; i++) {
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

console.log('Location loop:', { firstLocIdx, lastLocEnd });
console.log('Slice between lastVehicleEnd and firstLocIdx (first 100):', JSON.stringify(html.slice(lastVehicleEnd, lastVehicleEnd + 100)));
console.log('Slice after lastLocEnd (first 100):', JSON.stringify(html.slice(lastLocEnd, lastLocEnd + 100)));
