import fs from 'fs';

if (fs.existsSync('scripts/inspect-locations.mjs')) {
  console.log(fs.readFileSync('scripts/inspect-locations.mjs', 'utf8'));
} else {
  console.log('inspect-locations.mjs not found');
}
