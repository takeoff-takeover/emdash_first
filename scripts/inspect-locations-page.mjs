import fs from 'fs';

const content = fs.readFileSync('src/pages/locations.astro', 'utf8');
console.log('locations.astro length:', content.length);
console.log('First 600 chars of locations.astro:');
console.log(content.slice(0, 600));

// Check if there are loop templates in locations.astro
const loopMatches = content.match(/data-elementor-id="(\d+)"/g) || [];
console.log('Elementor loop/template matches in locations.astro:', Array.from(new Set(loopMatches)));
