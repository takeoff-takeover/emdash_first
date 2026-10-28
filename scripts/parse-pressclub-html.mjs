import fs from 'fs';

async function run() {
  const res = await fetch('https://www.press.bmwgroup.com/global/article/detail/T0461402EN/the-new-bmw-ix4', {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
  });
  const html = await res.text();
  fs.writeFileSync('scratch/pressclub-ix4.html', html);
  
  // Find all P90 numbers
  const p90s = [...new Set([...html.matchAll(/P90\d{5}/g)].map(m => m[0]))];
  console.log('P90 IDs found:', p90s);

  // Find image tags or photo attachments
  const photoMatches = [...html.matchAll(/attachmentId=(\d+)/g)].map(m => m[1]);
  console.log('Photo attachments:', photoMatches);
}
run();
