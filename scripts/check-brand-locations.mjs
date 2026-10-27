import fs from 'fs';

const locs = JSON.parse(fs.readFileSync('src/data/locations.json', 'utf8'));

const bmwLocations = locs.filter(l => l.brand === 'BMW');
const miniLocations = locs.filter(l => l.brand === 'MINI');

console.log('BMW locations count:', bmwLocations.length);
bmwLocations.forEach((l, i) => console.log(`  [${i + 1}] ${l.name} (${l.facilityType})`));

console.log('MINI locations count:', miniLocations.length);
miniLocations.forEach((l, i) => console.log(`  [${i + 1}] ${l.name} (${l.facilityType})`));
