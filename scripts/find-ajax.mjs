import fs from 'fs';

const html = fs.readFileSync('scratch/pressclub-ix4.html', 'utf8');
const lines = html.split('\n');
for (const line of lines) {
  if (line.includes('articleDetailModule') || line.includes('loadMedia') || line.includes('api') || line.includes('ajax')) {
    console.log(line.trim().slice(0, 150));
  }
}
