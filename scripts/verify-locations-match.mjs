import fs from 'fs';

const locs = JSON.parse(fs.readFileSync('src/data/locations.json', 'utf8'));
console.log('Total locations in locations.json:', locs.length);
console.log('Sample location:', locs[0]);

const bmwPostIds = ['7016', '4594', '4689', '4753', '4710', '4032', '4609', '4691', '4776', '5193', '4788', '4802'];
const miniPostIds = ['5200', '5215', '5221', '5229', '5256'];

const locIds = locs.map(l => String(l.id));
console.log('BMW post IDs matching count:', bmwPostIds.filter(id => locIds.includes(id)).length, 'out of', bmwPostIds.length);
console.log('MINI post IDs matching count:', miniPostIds.filter(id => locIds.includes(id)).length, 'out of', miniPostIds.length);

const missingBmw = bmwPostIds.filter(id => !locIds.includes(id));
console.log('Missing BMW IDs if any:', missingBmw);
const missingMini = miniPostIds.filter(id => !locIds.includes(id));
console.log('Missing MINI IDs if any:', missingMini);
