// scripts/inject-dynamic-data-to-pages.mjs
import fs from 'fs';

// 1. Process BMW page
function processBmw() {
  const content = fs.readFileSync('src/pages/bmw.astro', 'utf8');

  // Extract elementorHtml
  const startQuote = content.indexOf('const elementorHtml = "') + 'const elementorHtml = "'.length;
  const endQuote = content.lastIndexOf('";\n---');
  const html = content.slice(startQuote, endQuote).replace(/\\"/g, '"').replace(/\\n/g, '\n').replace(/\\t/g, '\t');

  // Find model loop container start
  const modelHeading = 'BMW MODEL LINE UP';
  const headingIdx = html.indexOf(modelHeading);
  const loopStartMarker = '<div class="elementor-loop-container elementor-grid" role="list">';
  const loopStartIdx = html.indexOf(loopStartMarker, headingIdx);
  const styleEndIdx = html.indexOf('</style>', loopStartIdx) + '</style>'.length;

  // Find where this loop container ends (before the closing </div>\t\t</div> of the loop grid widget)
  const firstItemIdx = html.indexOf('<div data-elementor-type="loop-item"', styleEndIdx);
  
  // Find where all loop items end
  const nextHeading = 'Nicole BMW 店舗一覧';
  const nextHeadingIdx = html.indexOf(nextHeading, firstItemIdx);
  // Look backward from nextHeading for the end of the loop-grid widget
  const loopEndIdx = html.lastIndexOf('</div>\n\t\t\t\t</div>\n\t\t\t\t</div>\n\t\t<div class="elementor-element', nextHeadingIdx);

  console.log('BMW Model Loop: styleEndIdx =', styleEndIdx, ', loopEndIdx =', loopEndIdx);

  const beforeModel = html.slice(0, styleEndIdx);
  const afterModel = html.slice(loopEndIdx);

  // Write new dynamic bmw.astro
  const headCode = content.slice(0, content.indexOf('const elementorHtml'));
  const footCode = content.slice(content.indexOf('<NicoleLayout'));

  const newBmwCode = `${headCode}import modelsData from "../data/models.json";
import locationsData from "../data/locations.json";

// 1. 車種モデルDB（models.json）から動的取得（Taxonomy: brand=BMW）
const bmwModels = modelsData.filter(m => m.brand === "BMW");

// 2. 拠点DB（locations.json）から動的取得（Taxonomy: brand=BMW）
const bmwLocations = locationsData.filter(l => l.brand === "BMW");

// Loop item dynamic HTML renderer
function renderBmwModelItems(models: typeof modelsData) {
  return models.map(m => \`
    <div data-elementor-type="loop-item" data-elementor-id="143" class="elementor elementor-143 e-loop-item e-loop-item-\${m.id} post-\${m.id} vehicle type-vehicle status-publish hentry brand-\${m.brand.toLowerCase()} series-\${m.series} body_type-\${m.bodyType} \${m.powertrains.map(p => \`powertrain-\${p}\`).join(' ')} nicole-brand-content nicole-brand-\${m.brand.toLowerCase()}">
      <div class="elementor-element elementor-element-dbbb6e0 e-flex e-con-boxed e-con e-parent">
        <div class="e-con-inner">
          <div class="elementor-element elementor-element-ef5b364 elementor-widget elementor-widget-image">
            <a href="\${m.detailUrl}">
              <img loading="lazy" decoding="async" width="1024" height="576" src="\${m.image}" alt="\${m.name}" class="attachment-large size-large" />
            </a>
          </div>
          \${m.catchphrase ? \`<div class="elementor-element elementor-element-1da3959 elementor-widget elementor-widget-heading"><h5 class="elementor-heading-title elementor-size-default"><a href="\${m.detailUrl}">\${m.catchphrase}</a></h5></div>\` : ''}
          <div class="elementor-element elementor-element-3bdf977 elementor-widget elementor-widget-heading">
            <h3 class="elementor-heading-title elementor-size-default"><a href="\${m.detailUrl}">\${m.name}</a></h3>
          </div>
          <div class="elementor-element elementor-element-87d8a36 elementor-widget elementor-widget-text-editor">
            <div class="ng-badges ng-badges-powertrain">
              \${m.badges.map(b => \`<span class="ng-badge \${b.includes('ガソリン') ? 'ng-badge--gasoline' : b.includes('ディーゼル') ? 'ng-badge--diesel' : b.includes('電気') ? 'ng-badge--bev' : 'ng-badge--phev'}">\${b}</span>\`).join(' ')}
            </div>
          </div>
        </div>
      </div>
    </div>
  \`).join('');
}

const beforePart = ${JSON.stringify(beforeModel)};
const afterPart = ${JSON.stringify(afterModel)};
const elementorHtml = beforePart + renderBmwModelItems(bmwModels) + afterPart;
---
${footCode}`;

  fs.writeFileSync('src/pages/bmw.astro', newBmwCode, 'utf8');
  console.log('✅ bmw.astro updated with dynamic models query!');
}

processBmw();
