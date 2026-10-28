import fs from 'fs';
import path from 'path';

const outDir = 'public/uploads/ix4';
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

function createMonochromeSvg(title, subtitle, badgeNumber, totalCount, details = []) {
  const detailItems = details.map((d, i) => `
    <g transform="translate(80, ${520 + i * 36})">
      <rect x="0" y="0" width="6" height="6" fill="#A0A0AA" rx="1"/>
      <text x="20" y="7" fill="#D4D4D8" font-family="'JetBrains Mono', 'Inter', monospace" font-size="13" font-weight="500" letter-spacing="1.5">${d}</text>
    </g>
  `).join('');

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 900" width="1600" height="900">
  <defs>
    <!-- Monotone Palette -->
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0a0a0c"/>
      <stop offset="60%" stop-color="#141418"/>
      <stop offset="100%" stop-color="#08080a"/>
    </linearGradient>
    <radialGradient id="meshGrad" cx="65%" cy="45%" r="65%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.08"/>
      <stop offset="60%" stop-color="#ffffff" stop-opacity="0.01"/>
      <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="subtleLine" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.4"/>
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0.05"/>
    </linearGradient>
    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.025)" stroke-width="1"/>
    </pattern>
  </defs>

  <!-- Background -->
  <rect width="1600" height="900" fill="url(#bgGrad)"/>
  <rect width="1600" height="900" fill="url(#meshGrad)"/>
  <rect width="1600" height="900" fill="url(#grid)"/>

  <!-- Minimal Frame Border -->
  <rect x="30" y="30" width="1540" height="840" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="1"/>

  <!-- Counter Indicator (Top Right) - Minimal format -->
  <g transform="translate(1440, 70)">
    <text x="0" y="0" fill="#71717A" font-family="'JetBrains Mono', monospace" font-size="14" font-weight="600" letter-spacing="2">${badgeNumber} / ${totalCount}</text>
  </g>

  <!-- Technical Wireframe Silhouette Graphic -->
  <g transform="translate(680, 200)" opacity="0.75">
    <!-- Fastback Silhouette (iX4 Coupe) -->
    <path d="M 40 420 C 140 400, 240 370, 380 270 C 520 170, 680 180, 800 240 L 860 300 C 820 330, 780 370, 770 410 L 40 420 Z" fill="none" stroke="rgba(255,255,255,0.18)" stroke-width="1.5"/>
    <path d="M 180 390 C 280 330, 390 260, 500 240 C 620 220, 710 240, 780 290" fill="none" stroke="rgba(255,255,255,0.4)" stroke-width="2" stroke-dasharray="6,4"/>
    <!-- Iconic Glow Kidney contours -->
    <rect x="50" y="375" width="120" height="35" rx="6" fill="none" stroke="#FFFFFF" stroke-width="2.5" opacity="0.85"/>
    <rect x="55" y="380" width="110" height="25" rx="4" fill="none" stroke="#FFFFFF" stroke-width="1" stroke-dasharray="4,2" opacity="0.6"/>
    <!-- Wheels -->
    <circle cx="200" cy="420" r="72" fill="none" stroke="rgba(255,255,255,0.25)" stroke-width="2"/>
    <circle cx="200" cy="420" r="54" fill="none" stroke="rgba(255,255,255,0.12)" stroke-width="1" stroke-dasharray="6,4"/>
    <circle cx="700" cy="420" r="72" fill="none" stroke="rgba(255,255,255,0.25)" stroke-width="2"/>
    <circle cx="700" cy="420" r="54" fill="none" stroke="rgba(255,255,255,0.12)" stroke-width="1" stroke-dasharray="6,4"/>
  </g>

  <!-- Editorial Info & Typography -->
  <g transform="translate(80, 110)">
    <!-- Main Subject Title -->
    <text x="0" y="80" fill="#FFFFFF" font-family="'Inter', -apple-system, sans-serif" font-size="44" font-weight="700" letter-spacing="-0.5">${title}</text>
    
    <!-- Subtitle / Caption -->
    <text x="0" y="130" fill="#A0A0AA" font-family="'Inter', -apple-system, sans-serif" font-size="19" font-weight="400" letter-spacing="0.2">${subtitle}</text>

    <!-- Hairline Separator -->
    <line x1="0" y1="170" x2="300" y2="170" stroke="url(#subtleLine)" stroke-width="1.5"/>
  </g>

  <!-- Feature Details (Specs / Description) -->
  ${detailItems}

  <!-- Footer Branding (Minimal Monotone) -->
  <g transform="translate(80, 835)">
    <text x="0" y="0" fill="#52525B" font-family="'JetBrains Mono', monospace" font-size="11" font-weight="500" letter-spacing="2">BMW GROUP PRESSCLUB OFFICIAL RELEASE // NEUE KLASSE ARCHITECTURE</text>
  </g>
</svg>`;
}

const images = [
  // EXTERIOR 10点
  {
    file: 'ext-01-front-mask.svg',
    title: 'Iconic Glow Kidney Grille & LED Light Signature',
    subtitle: 'ノイエ・クラッセの象徴である一体型発光キドニーグリルとスリムLEDヘッドライト',
    details: [
      'MONOLITHIC DIGITAL FRONT-END WITH INTERACTIVE ILLUMINATION',
      'THREE-DIMENSIONAL VERTICAL LIGHT SIGNATURE',
      'INTEGRATED SENSOR SUITE CONCEALED BEHIND ILLUMINATED SURFACES'
    ]
  },
  {
    file: 'ext-02-side-profile.svg',
    title: 'Dynamic Fastback Silhouette & Hofmeister Kink',
    subtitle: '流麗なクーペルーフラインと力強いプロポーションが融合した新世代SACデザイン',
    details: [
      'CLASSIC HOFMEISTER KINK REINTERPRETED FOR ELECTRIC ERA',
      'LONG WHEELBASE (2,950MM) WITH SHORT OVERHANGS',
      'LOW-SLUNG GROUND CLEARANCE ENHANCING DYNAMIC STANCE'
    ]
  },
  {
    file: 'ext-03-rear-quarter.svg',
    title: 'Sculpted Rear Light Bar & Ducktail Spoiler',
    subtitle: '全幅にわたる3D立体LEDライトバーとダウンフォースを高めるダックテール',
    details: [
      'HORIZONTAL CONTINUOUS REAR LIGHT STRIP WITH 3D DEPTH',
      'AERODYNAMIC INTEGRATED DUCKTAIL SPOILER LIP',
      'CLEAN MONOLITHIC SURFACING DEVOID OF SUPERFLUOUS CREASES'
    ]
  },
  {
    file: 'ext-04-aerodynamics.svg',
    title: 'Aerodynamic Efficiency (Cd 0.23)',
    subtitle: '自動格納式フラッシュドアハンドルと整流エアカーテンによるクラストップの空力性能',
    details: [
      'FLUSH AUTOMATIC DOOR HANDLES REDUCING TURBULENCE',
      'ACTIVE AIR FLAPS AND UNDERBODY FLAT PANEL ENCLOSURE',
      'Cd VALUE OF 0.23 OPTIMIZING LONG-DISTANCE HIGHWAY EFFICIENCY'
    ]
  },
  {
    file: 'ext-05-glass-roof.svg',
    title: 'Seamless Full-Length Panoramic Glass Roof',
    subtitle: 'フロントからリアまで継ぎ目なく広がる遮熱パノラマ・ガラスルーフ',
    details: [
      'HIGH INFRARED AND UV PROTECTION COATING',
      'AIRY LOUNGE-LIKE CABIN ILLUMINATION WITHOUT SOLAR HEAT GAIN',
      'STRUCTURAL RIGIDITY INTEGRATED WITH ROOF RAILS'
    ]
  },
  {
    file: 'ext-06-wheels.svg',
    title: '21-inch Aerodynamic Lightweight Alloy Wheels',
    subtitle: '航続距離を伸ばす低転がり抵抗・空力最適化バイカラー・アロイホイール',
    details: [
      'PRECISION-MACHINED TWO-TONE LIGHTWEIGHT ALLOY CONSTRUCTION',
      'INTEGRATED CARBON-COMPOSITE INSERTS CHANNELLING AIRFLOW',
      'OPTIMIZED LOW-ROLLING-RESISTANCE EV PERFORMANCE TIRES'
    ]
  },
  {
    file: 'ext-07-m60-front.svg',
    title: 'BMW iX4 M60 xDrive Front Apron & M Badging',
    subtitle: 'ハイパフォーマンスモデル専用のグロスブラック・エアインテークとMエンブレム',
    details: [
      'HIGH-GLOSS SHADOWLINE FINISH ON AGGRESSIVE LOWER FRONT APRON',
      'COOLING DUCTS DEDICATED TO 450KW DUAL-MOTOR THERMAL CONTROL',
      'DISTINCTIVE M EMBLEM INTEGRATED ON FRONT GRILLE CONTOUR'
    ]
  },
  {
    file: 'ext-08-m60-diffuser.svg',
    title: 'Rear Venturi Aerodynamic Diffuser (M60)',
    subtitle: '車体下面の気流を整流し高速スタビリティを高める専用リアディフューザー',
    details: [
      'MOTORSPORT-INSPIRED REAR VENTURI FLOW CHANNELS',
      'REDUCED REAR AXLE LIFT AT HIGH AUTOBAHN SPEEDS',
      'DARK SATIN ACCENTS FRAMING THE REAR LOWER SECTION'
    ]
  },
  {
    file: 'ext-09-lighting-dance.svg',
    title: 'Personalized Welcome & Farewell Light Choreography',
    subtitle: 'オーナー接近時に流れるように迎えるインタラクティブ・ライティング演出',
    details: [
      'LIGHT PROJECTION FROM SIDE MIRRORS ONTO GROUND',
      'COORDINATED SEQUENCE ACROSS FRONT GRILLE, HEADLIGHTS AND REAR LIGHTS',
      'ULTRA-WIDEBAND (UWB) SMARTPHONE KEY ACTIVATION'
    ]
  },
  {
    file: 'ext-10-dynamic-drive.svg',
    title: 'Dynamic Alpine Testing & xDrive All-Weather Handling',
    subtitle: '標高2,500mの山岳路で鍛え上げられたデュアルモーター四輪駆動の圧倒的ロードホールディング',
    details: [
      'INTELLIGENT ELECTRIC ALL-WHEEL DRIVE WITH MILLI-SECOND POWER SHIFT',
      'NEAR-PERFECT 50:50 WEIGHT DISTRIBUTION ACROSS AXLES',
      'UNCOMPROMISED STABILITY ON WET, DRY AND SNOWY SURFACES'
    ]
  },

  // INTERIOR 5点
  {
    file: 'int-01-panoramic-vision.svg',
    title: 'BMW Panoramic Vision (Windshield Projection)',
    subtitle: 'フロントガラス全幅に走行情報やナビゲーションを鮮明に投影する新世代HUD',
    details: [
      'PILLAR-TO-PILLAR HIGH-RESOLUTION DIGITAL PROJECTION',
      'CRUCIAL SPEED AND NAVIGATION DATA DIRECTLY IN DRIVER LINE OF SIGHT',
      'SEAMLESS INTEGRATION WITH BMW OPERATING SYSTEM X'
    ]
  },
  {
    file: 'int-02-cockpit-minimal.svg',
    title: 'Driver-Focused Minimal Cockpit Architecture',
    subtitle: '物理的な雑音を徹底的に排し、洗練された空間美と操作性を両立したコックピット',
    details: [
      'REDUCED PHYSICAL BUTTONS EMPHASIZING VOICE & TOUCH INTERACTION',
      'FLOATING CENTRAL CONSOLE WITH INTEGRATED WIRELESS CHARGING',
      'NATURAL WARM BACKLIT AMBIENT LIGHTING STRIPS'
    ]
  },
  {
    file: 'int-03-central-display.svg',
    title: 'Geometric Central Display & OS X Interface',
    subtitle: '人間工学に基づいて傾斜配置されたパラレログラム形状のタッチスクリーン',
    details: [
      'MATRIX BACKLIGHTING DELIVERING ULTRA-HIGH CONTRAST RATIO',
      'GENERATIVE AI-POWERED BMW INTELLIGENT PERSONAL ASSISTANT',
      'ZERO-LAYER QUICKSELECT INTERFACE FOR EFFORTLESS CONTROL'
    ]
  },
  {
    file: 'int-04-seats-sustainable.svg',
    title: 'Sustainable Luxury Vegan Leather Sports Seats',
    subtitle: '植物由来ヴィーガンレザーと海洋再生繊維を採用したエルゴノミクス・スポーツシート',
    details: [
      'VEGAN-CERTIFIED HIGH-DURABILITY SOFT-TOUCH SURFACING',
      'INTEGRATED VENTILATION, HEATING AND ACTIVE MASSAGE FUNCTIONS',
      'CIRCULAR ECONOMY MATERIALS REDUCING CARBON FOOTPRINT BY 30%'
    ]
  },
  {
    file: 'int-05-rear-lounge.svg',
    title: 'Executive Rear Lounge & Generous Cargo Space',
    subtitle: 'ロングホイールベースがもたらす広大な後席レッグルームと最大1,560Lの積載容量',
    details: [
      'AMPLE REAR HEADROOM DESPITE COUPÉ ROOFLINE PROPORTIONS',
      'FLAT-FLOOR ARCHITECTURE ELIMINATING TRANSMISSION TUNNEL HUMP',
      'EXPANDABLE 515L TO 1,560L TRUNK WITH SPLIT-FOLDING BACKRESTS'
    ]
  }
];

// キービジュアルも生成
const keyVisualSvg = createMonochromeSvg(
  'THE NEW BMW iX4',
  '次世代完全電動スポーツ・アクティビティ・クーペ｜ワールドプレミア',
  'KEY',
  '15',
  [
    'WORLD PREMIERE: ALL-ELECTRIC SPORTS ACTIVITY COUPÉ ON NEUE KLASSE ARCHITECTURE',
    'FLAGSHIP MODEL: BMW iX4 M60 xDrive WITH 450 KW / 612 HP & 875 NM',
    'MAXIMUM WLTP RANGE: UP TO 828 KM (108.7 KWH BATTERY)',
    'GLOBAL LAUNCH: COMMENCING MARCH 2027 (JAPAN INTRODUCTION IN 2027)'
  ]
);
fs.writeFileSync(path.join(outDir, 'key-visual.svg'), keyVisualSvg, 'utf8');
console.log('Created: key-visual.svg');

images.forEach((img, idx) => {
  const svg = createMonochromeSvg(img.title, img.subtitle, idx + 1, images.length, img.details);
  fs.writeFileSync(path.join(outDir, img.file), svg, 'utf8');
  console.log(`Created: ${img.file}`);
});

console.log(`All ${images.length + 1} iX4 images generated successfully!`);
