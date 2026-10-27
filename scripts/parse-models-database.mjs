// scripts/parse-models-database.mjs
import fs from 'fs';

function parseModels(filePath, defaultBrand) {
  const content = fs.readFileSync(filePath, 'utf8');
  const items = content.split('data-elementor-type=\\"loop-item\\"').slice(1);
  console.log(`Processing ${items.length} items from ${filePath}...`);

  const models = [];
  for (const item of items) {
    if (!item.includes('type-vehicle')) continue;

    // Post ID
    const postIdMatch = item.match(/post-(\d+)/);
    const postId = postIdMatch ? postIdMatch[1] : '';

    // Model name in h3
    const h3Match = item.match(/<h3[^>]*>([\s\S]*?)<\/h3>/i);
    let name = '';
    if (h3Match) {
      name = h3Match[1].replace(/\\"/g, '"').replace(/<[^>]+>/g, '').trim();
    }

    // Catchphrase in h5
    const h5Match = item.match(/<h5[^>]*>([\s\S]*?)<\/h5>/i);
    let catchphrase = '';
    if (h5Match) {
      catchphrase = h5Match[1].replace(/\\"/g, '"').replace(/<[^>]+>/g, '').trim();
    }

    // URL
    const urlMatch = item.match(/href=\\"([^\\"]+)\\"/i);
    const url = urlMatch ? urlMatch[1].replace(/\\/g, '') : '';

    // Image
    const imgMatch = item.match(/src=\\"([^\\"]+)\\"/i);
    const image = imgMatch ? imgMatch[1].replace(/\\/g, '') : '';

    // Series
    const seriesMatch = item.match(/series-([a-zA-Z0-9\-]+)/);
    const series = seriesMatch ? seriesMatch[1] : '';

    // Body type
    const bodyMatch = item.match(/body_type-([a-zA-Z0-9\-]+)/);
    const bodyType = bodyMatch ? bodyMatch[1] : '';

    // Powertrains
    const powertrains = [...item.matchAll(/powertrain-([a-zA-Z0-9\-]+)/g)].map(m => m[1]);

    // Badges in text editor
    const badgeMatches = [...item.matchAll(/ng-badge[^>]*>([\s\S]*?)<\/span>/gi)]
      .map(b => b[1].replace(/\\"/g, '"').replace(/<[^>]+>/g, '').trim())
      .filter(Boolean);

    models.push({
      id: postId || url.replace(/^\/|\/$/g, '').replace(/\//g, '-'),
      name,
      catchphrase,
      brand: defaultBrand,
      series,
      bodyType,
      powertrains: [...new Set(powertrains)],
      badges: badgeMatches,
      image,
      detailUrl: url,
    });
  }
  return models;
}

const bmwModels = parseModels('src/pages/bmw.astro', 'BMW');
const miniModels = parseModels('src/pages/mini.astro', 'MINI');

console.log(`Parsed ${bmwModels.length} BMW models:`);
bmwModels.forEach(m => console.log(` - [${m.brand}] ${m.name}: ${m.catchphrase} (${m.badges.join(', ')})`));

console.log(`\nParsed ${miniModels.length} MINI models:`);
miniModels.forEach(m => console.log(` - [${m.brand}] ${m.name}: ${m.catchphrase} (${m.badges.join(', ')})`));

const all = [...bmwModels, ...miniModels];
fs.mkdirSync('src/data', { recursive: true });
fs.writeFileSync('src/data/models.json', JSON.stringify(all, null, 2), 'utf8');
console.log(`\n✅ Saved total ${all.length} models into src/data/models.json!`);
