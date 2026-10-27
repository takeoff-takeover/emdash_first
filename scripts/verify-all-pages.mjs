// scripts/verify-all-pages.mjs
const routes = [
  '/',
  '/corporate',
  '/philosophy',
  '/bmw',
  '/mini',
  '/locations',
  '/esg_sdgs',
  '/customer-policy',
  '/privacystatement',
  '/contact',
  '/contact-thanks',
  '/pages/nicole-cars',
  '/pages/nicole-automobiles',
  '/pages/nicole-motorcars',
  '/pages/nicole-competizione',
  '/pages/nicole-racing-japan',
  '/posts',
];

const BASE_URL = 'http://localhost:4321';

async function testRoute(route) {
  try {
    const res = await fetch(`${BASE_URL}${route}`);
    const text = await res.text();
    const isOk = res.status >= 200 && res.status < 400;
    const hasNicoleBrand = text.includes('Nicole') || text.includes('NICOLE');
    console.log(`${isOk ? '✅' : '❌'} [${res.status}] ${route} (size: ${(text.length / 1024).toFixed(1)} KB, title/brand: ${hasNicoleBrand})`);
    return isOk;
  } catch (err) {
    console.error(`❌ [ERR] ${route}: ${err.message}`);
    return false;
  }
}

async function run() {
  console.log(`Testing ${routes.length} routes against ${BASE_URL}...\n`);
  let passed = 0;
  for (const r of routes) {
    const ok = await testRoute(r);
    if (ok) passed++;
  }
  console.log(`\nResult: ${passed}/${routes.length} passed.`);
  if (passed !== routes.length) {
    process.exit(1);
  }
}

run();
