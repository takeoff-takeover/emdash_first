// scripts/extract-all-vehicles.mjs
import fs from 'fs';

function extractVehiclesFromPage(filePath, brandDefault) {
  const content = fs.readFileSync(filePath, 'utf8');
  const match = content.match(/const elementorHtml\s*=\s*("[\s\S]*?");/);
  if (!match) {
    console.error('Could not find elementorHtml in', filePath);
    return [];
  }
  const html = JSON.parse(match[1]);
  // Match each e-loop-item
  const itemRegex = /<div[^>]*class=["'][^"']*e-loop-item[^"']*type-vehicle[^"']*["'][^>]*>([\s\S]*?)<\/div>\s*<\/div>\s*<\/div>/g;
  const matches = [...html.matchAll(itemRegex)];
  console.log(`Found ${matches.length} vehicles in ${filePath}`);

  const vehicles = [];
  for (const m of matches) {
    const block = m[0];
    
    // Classes
    const classMatch = block.match(/class=["']([^"']+)["']/);
    const classes = classMatch ? classMatch[1].split(/\s+/) : [];
    
    // Brand
    const brandClass = classes.find(c => c.startsWith('brand-'));
    const brand = brandClass ? brandClass.replace('brand-', '').toUpperCase() : brandDefault;

    // Series
    const seriesClass = classes.find(c => c.startsWith('series-'));
    const series = seriesClass ? seriesClass.replace('series-', '') : '';

    // Body type
    const bodyClass = classes.find(c => c.startsWith('body_type-'));
    const bodyType = bodyClass ? bodyClass.replace('body_type-', '') : '';

    // Powertrains
    const powertrains = classes
      .filter(c => c.startsWith('powertrain-'))
      .map(c => c.replace('powertrain-', ''));

    // Image
    const imgMatch = block.match(/<img[^>]+src=["']([^"']+)["']/);
    const image = imgMatch ? imgMatch[1] : '';

    // Catchphrase (h5)
    const h5Match = block.match(/<h5[^>]*>([\s\S]*?)<\/h5>/);
    const catchphrase = h5Match ? h5Match[1].replace(/<[^>]+>/g, '').trim() : '';

    // Model Name (h3)
    const h3Match = block.match(/<h3[^>]*>([\s\S]*?)<\/h3>/);
    const name = h3Match ? h3Match[1].replace(/<[^>]+>/g, '').trim() : '';

    // URL
    const urlMatch = block.match(/<a[^>]+href=["']([^"']+)["']/);
    const detailUrl = urlMatch ? urlMatch[1] : '';

    // Badges
    const badgeMatches = [...block.matchAll(/<span[^>]*class=["'][^"']*ng-badge[^"']*["'][^>]*>([\s\S]*?)<\/span>/g)]
      .map(b => b[1].replace(/<[^>]+>/g, '').trim())
      .filter(Boolean);

    vehicles.push({
      id: detailUrl.replace(/^\/|\/$/g, '').replace(/[\/\\]/g, '-'),
      name,
      catchphrase,
      brand,
      series,
      bodyType,
      powertrains,
      badges: badgeMatches,
      image,
      detailUrl,
    });
  }
  return vehicles;
}

const bmwVehicles = extractVehiclesFromPage('src/pages/bmw.astro', 'BMW');
const miniVehicles = extractVehiclesFromPage('src/pages/mini.astro', 'MINI');

console.log('\nExtracted BMW Vehicles:', bmwVehicles.length);
bmwVehicles.forEach(v => console.log(` - [${v.brand}] ${v.name} (${v.series}): ${v.catchphrase}`));

console.log('\nExtracted MINI Vehicles:', miniVehicles.length);
miniVehicles.forEach(v => console.log(` - [${v.brand}] ${v.name}: ${v.catchphrase}`));

// Save to src/data/models.json
const allModels = [...bmwVehicles, ...miniVehicles];
fs.writeFileSync('src/data/models.json', JSON.stringify(allModels, null, 2), 'utf8');
console.log(`\n✅ Saved ${allModels.length} models into src/data/models.json`);
