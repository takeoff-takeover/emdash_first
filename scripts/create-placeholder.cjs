const sharp = require('sharp');
const fs = require('fs');

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="1000" viewBox="0 0 1600 1000">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#141419" />
      <stop offset="50%" stop-color="#1a1a24" />
      <stop offset="100%" stop-color="#0e0e13" />
    </linearGradient>
    <linearGradient id="goldAccent" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#c5a059" />
      <stop offset="100%" stop-color="#e2c58a" />
    </linearGradient>
  </defs>

  <!-- Background -->
  <rect width="1600" height="1000" fill="url(#bg)" />

  <!-- Outer subtle border -->
  <rect x="24" y="24" width="1552" height="952" rx="12" fill="none" stroke="#ffffff" stroke-opacity="0.08" stroke-width="2" stroke-dasharray="8 8" />

  <g transform="translate(800, 430)" text-anchor="middle">
    <!-- Camera Icon Circle Background -->
    <circle cx="0" cy="-60" r="76" fill="#22222e" stroke="#38384a" stroke-width="2" />
    
    <!-- Camera Glyph -->
    <g transform="translate(0, -60)" stroke="#c5a059" stroke-width="3.5" fill="none" stroke-linecap="round" stroke-linejoin="round">
      <path d="M-36 -12 L-22 -30 L22 -30 L36 -12 Z" />
      <rect x="-42" y="-12" width="84" height="60" rx="8" />
      <circle cx="0" cy="18" r="18" />
      <circle cx="24" cy="2" r="3" fill="#c5a059" />
    </g>

    <!-- Main Title -->
    <text y="70" fill="#ffffff" font-family="-apple-system, BlinkMacSystemFont, 'Hiragino Sans', 'Noto Sans JP', sans-serif" font-size="34" font-weight="700" letter-spacing="0.1em">
      【 写真未設定 ／ 差し替え用プレースホルダー 】
    </text>

    <!-- Subtitle / Instruction -->
    <text y="125" fill="#e2c58a" font-family="-apple-system, BlinkMacSystemFont, 'Hiragino Sans', 'Noto Sans JP', sans-serif" font-size="22" font-weight="600" letter-spacing="0.08em">
      管理画面（Admin UI）から実写真をアップロードして差し替えてください
    </text>

    <!-- English Sub instruction -->
    <text y="170" fill="#888899" font-family="Helvetica, Arial, sans-serif" font-size="16" font-weight="500" letter-spacing="0.12em">
      IMAGE PLACEHOLDER · CLICK "REPLACE" IN CMS ADMIN TO SET PHOTO
    </text>

    <!-- Decorative Accent Bar -->
    <rect x="-80" y="210" width="160" height="3" rx="1.5" fill="url(#goldAccent)" />
  </g>
</svg>`;

async function main() {
  const buf = Buffer.from(svg);
  fs.mkdirSync('public/images', { recursive: true });
  fs.mkdirSync('public/uploads/wp/2026/03', { recursive: true });

  await sharp(buf)
    .jpeg({ quality: 90 })
    .toFile('public/images/placeholder-replace.jpg');
  console.log('Created public/images/placeholder-replace.jpg');

  await sharp(buf)
    .jpeg({ quality: 90 })
    .toFile('public/images/no-image.jpg');
  console.log('Created public/images/no-image.jpg');

  fs.copyFileSync('public/images/placeholder-replace.jpg', 'public/uploads/wp/2026/03/DSC8995-2.jpg');
  console.log('Created public/uploads/wp/2026/03/DSC8995-2.jpg');
}

main().catch(console.error);
