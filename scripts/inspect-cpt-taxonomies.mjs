// scripts/inspect-cpt-taxonomies.mjs
import fs from 'fs';

const xml = fs.readFileSync('wordpress-export.xml', 'utf8');

const types = [...xml.matchAll(/<wp:post_type><!\[CDATA\[(.*?)\]\]><\/wp:post_type>/g)].map(m => m[1]);
const counts = {};
types.forEach(t => counts[t] = (counts[t] || 0) + 1);
console.log('Post Types in XML:', counts);

const categories = [...xml.matchAll(/<category\s+domain="([^"]+)"\s+nicename="([^"]+)"[^>]*>(?:<!\[CDATA\[(.*?)\]\]>|(.*?))<\/category>/g)];
const taxCounts = {};
for (const cat of categories) {
  const domain = cat[1];
  taxCounts[domain] = (taxCounts[domain] || 0) + 1;
}
console.log('Taxonomies in XML:', taxCounts);

// Look for ACF or postmeta keys
const metas = [...xml.matchAll(/<wp:meta_key><!\[CDATA\[(.*?)\]\]><\/wp:meta_key>/g)].map(m => m[1]);
const metaCounts = {};
metas.forEach(m => {
  if (!m.startsWith('_')) {
    metaCounts[m] = (metaCounts[m] || 0) + 1;
  }
});
console.log('Top Custom Fields (non-underscore):', Object.entries(metaCounts).sort((a,b) => b[1] - a[1]).slice(0, 30));
