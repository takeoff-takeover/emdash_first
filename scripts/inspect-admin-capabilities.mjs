import fs from 'fs';

const adminCode = fs.readFileSync('node_modules/@emdash-cms/admin/dist/index.js', 'utf8');

// Find route paths
const routeMatches = adminCode.match(/path:\s*["']([^"']+)["']/g) || [];
console.log('Admin route paths count:', routeMatches.length);
console.log('Sample route paths:');
const uniquePaths = Array.from(new Set(routeMatches)).slice(0, 30);
console.log(uniquePaths);

// Check collections / posts / media / taxonomies
const keywords = ['posts', 'pages', 'media', 'collections', 'taxonomies', 'users', 'settings', 'plugins', 'navigation'];
for (const kw of keywords) {
  console.log(`Keyword "${kw}" present:`, adminCode.includes(kw));
}
