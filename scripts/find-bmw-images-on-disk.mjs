import fs from 'fs';
import path from 'path';

const models = JSON.parse(fs.readFileSync('src/data/models.json', 'utf8'));
const locs = JSON.parse(fs.readFileSync('src/data/locations.json', 'utf8'));

console.log('=== BMW Models Image Check ===');
const bmwModels = models.filter(m => m.brand === 'BMW');
for (const m of bmwModels) {
  const img = m.image;
  const basename = path.basename(img);
  
  // Check variations
  const p1 = path.join('public', img.replace(/^\//, ''));
  const p2 = path.join('public/wp-content', img.replace(/^\//, ''));
  const p3 = path.join('public/wp-content/uploads', img.replace(/^\/uploads\//, ''));
  const p4 = path.join('public/uploads', img.replace(/^\/wp-content\/uploads\//, ''));

  let found = null;
  if (fs.existsSync(p1)) found = p1;
  else if (fs.existsSync(p2)) found = p2;
  else if (fs.existsSync(p3)) found = p3;
  else if (fs.existsSync(p4)) found = p4;

  console.log(`[${found ? 'FOUND' : 'MISSING'}] ${m.name} -> ${img} (found at: ${found})`);
}

console.log('\n=== BMW Locations Image Check ===');
const bmwLocs = locs.filter(l => l.brand === 'BMW');
for (const l of bmwLocs) {
  const img = l.image;
  const p1 = path.join('public', (img || '').replace(/^\//, ''));
  const p2 = path.join('public/wp-content', (img || '').replace(/^\//, ''));
  const p3 = path.join('public/wp-content/uploads', (img || '').replace(/^\/uploads\//, ''));
  const p4 = path.join('public/uploads', (img || '').replace(/^\/wp-content\/uploads\//, ''));

  let found = null;
  if (fs.existsSync(p1)) found = p1;
  else if (fs.existsSync(p2)) found = p2;
  else if (fs.existsSync(p3)) found = p3;
  else if (fs.existsSync(p4)) found = p4;

  console.log(`[${found ? 'FOUND' : 'MISSING'}] ${l.name} -> ${img} (found at: ${found})`);
}
