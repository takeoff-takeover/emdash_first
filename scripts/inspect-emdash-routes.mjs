import fs from 'fs';

const content = fs.readFileSync('node_modules/emdash/dist/astro/index.mjs', 'utf8');
const regex = /pattern:\s*"([^"]+)"/g;
let m;
const patterns = [];
while ((m = regex.exec(content)) !== null) {
  patterns.push(m[1]);
}
console.log('UI/Page patterns (non-api):');
console.log(patterns.filter(p => !p.includes('/api/')));
