import fs from 'fs';

const html = fs.readFileSync('scratch/pressclub-ix4.html', 'utf8');

// Check script tags or JSON embedded
const scriptMatches = [...html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/gi)];
console.log('Script tags count:', scriptMatches.length);
for (let i = 0; i < scriptMatches.length; i++) {
  const content = scriptMatches[i][1];
  if (content.includes('mediapool') || content.includes('P90') || content.includes('photo')) {
    console.log(`Script ${i} matches:`, content.slice(0, 300));
  }
}

// Check for all image tags
const imgMatches = [...html.matchAll(/<img[^>]+src=["']([^"']+)["'][^>]*>/gi)].map(m => m[1]);
console.log('Image srcs in HTML:');
for (const src of imgMatches) {
  console.log(src);
}
