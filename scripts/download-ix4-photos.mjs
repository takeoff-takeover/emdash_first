import fs from 'fs';
import path from 'path';

const outDir = 'public/uploads/ix4';
fs.mkdirSync(outDir, { recursive: true });

const images = [
  { name: 'key-visual.jpg', url: 'https://mediapool.bmwgroup.com/cache/P9/202610/P90659268/P90659268-bmw-ix4-highlight-shots-10-26-2248px.jpg' },
  { name: 'ext-01.jpg', url: 'https://mediapool.bmwgroup.com/cache/P9/202610/P90659264/P90659264-bmw-ix4-highlight-shots-10-26-2248px.jpg' },
  { name: 'ext-02.jpg', url: 'https://mediapool.bmwgroup.com/cache/P9/202610/P90659266/P90659266-bmw-ix4-highlight-shots-10-26-2249px.jpg' },
  { name: 'ext-03.jpg', url: 'https://mediapool.bmwgroup.com/cache/P9/202610/P90659267/P90659267-bmw-ix4-highlight-shots-10-26-2249px.jpg' },
  { name: 'ext-04.jpg', url: 'https://mediapool.bmwgroup.com/cache/P9/202609/P90655718/P90655718-bmw-ix4-m60-xdrive-driving-shots-10-26-2250px.jpg' },
  { name: 'ext-05.jpg', url: 'https://mediapool.bmwgroup.com/cache/P9/202609/P90655719/P90655719-bmw-ix4-m60-xdrive-driving-shots-10-26-2250px.jpg' },
  { name: 'ext-06.jpg', url: 'https://mediapool.bmwgroup.com/cache/P9/202609/P90655720/P90655720-bmw-ix4-m60-xdrive-driving-shots-10-26-2250px.jpg' },
  { name: 'ext-07.jpg', url: 'https://mediapool.bmwgroup.com/cache/P9/202609/P90655726/P90655726-bmw-ix4-m60-xdrive-driving-shots-10-26-2250px.jpg' },
  { name: 'ext-08.jpg', url: 'https://mediapool.bmwgroup.com/cache/P9/202609/P90655740/P90655740-bmw-ix4-50-xdrive-driving-shots-10-26-2250px.jpg' },
  { name: 'ext-09.jpg', url: 'https://mediapool.bmwgroup.com/cache/P9/202609/P90655745/P90655745-bmw-ix4-50-xdrive-driving-shots-10-26-2250px.jpg' },
  { name: 'ext-10.jpg', url: 'https://mediapool.bmwgroup.com/cache/P9/202609/P90655770/P90655770-bmw-ix4-m60-xdrive-static-10-26-2249px.jpg' },
  { name: 'int-01.jpg', url: 'https://mediapool.bmwgroup.com/cache/P9/202609/P90655771/P90655771-bmw-ix4-m60-xdrive-static-10-26-2249px.jpg' },
  { name: 'int-02.jpg', url: 'https://mediapool.bmwgroup.com/cache/P9/202609/P90655772/P90655772-bmw-ix4-m60-xdrive-static-10-26-2248px.jpg' },
  { name: 'int-03.jpg', url: 'https://mediapool.bmwgroup.com/cache/P9/202609/P90655773/P90655773-bmw-ix4-m60-xdrive-static-10-26-2248px.jpg' },
  { name: 'int-04.jpg', url: 'https://mediapool.bmwgroup.com/cache/P9/202609/P90655774/P90655774-bmw-ix4-m60-xdrive-static-10-26-2249px.jpg' },
  { name: 'int-05.jpg', url: 'https://mediapool.bmwgroup.com/cache/P9/202609/P90655776/P90655776-bmw-ix4-m60-xdrive-static-10-26-2249px.jpg' }
];

async function downloadAll() {
  console.log(`Starting download of ${images.length} official press images...`);
  for (const img of images) {
    const dest = path.join(outDir, img.name);
    try {
      console.log(`Downloading ${img.name}...`);
      const res = await fetch(img.url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
      });
      if (res.ok) {
        const buffer = await res.arrayBuffer();
        fs.writeFileSync(dest, Buffer.from(buffer));
        console.log(`Saved ${img.name} (${buffer.byteLength} bytes)`);
      } else {
        console.error(`Failed ${img.name}: status ${res.status}`);
      }
    } catch (e) {
      console.error(`Error downloading ${img.name}:`, e.message);
    }
  }
  console.log('Download complete.');
}

downloadAll();
