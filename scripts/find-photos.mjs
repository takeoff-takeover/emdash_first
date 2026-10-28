import fs from 'fs';

const html = fs.readFileSync('scratch/pressclub-ix4.html', 'utf8');

// Search for links or API calls
const lines = html.split('\n');
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  if (line.includes('photos') || line.includes('gallery') || line.includes('P90') || line.includes('media-item')) {
    console.log(`[Line ${i}]:`, line.trim().slice(0, 150));
  }
}
