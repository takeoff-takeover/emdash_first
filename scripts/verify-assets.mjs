import fs from 'fs';
import path from 'path';

const devUrl = 'http://localhost:4321';

async function testUrl(pathStr) {
  try {
    const res = await fetch(`${devUrl}${pathStr}`);
    return { path: pathStr, status: res.status, ok: res.ok, type: res.headers.get('content-type') };
  } catch (e) {
    return { path: pathStr, error: e.message };
  }
}

async function run() {
  console.log('Testing page endpoints and image asset loading...');

  const pages = [
    '/',
    '/corporate',
    '/philosophy',
    '/posts',
    '/posts/recruit-event-september-2026',
    '/pages/nicole-cars'
  ];

  console.log('\n--- 1. Testing Pages ---');
  for (const p of pages) {
    const res = await testUrl(p);
    console.log(`Page ${p.padEnd(40)} -> ${res.status || res.error}`);
  }

  console.log('\n--- 2. Testing Sample Localized Images from /uploads/ ---');
  const sampleImages = [
    '/uploads/2026/02/witt_pc-scaled.jpg',
    '/uploads/2026/08/DSC5134.jpg',
    '/uploads/2026/01/Nicole-BMW-%E6%9C%AC%E7%A4%BE.jpg',
    '/uploads/2026/06/mini_lineup_2026.jpg',
    '/uploads/2026/10/DSC6593-1-scaled.jpg',
    '/uploads/2026/05/%E3%83%95%E3%83%BC%E3%83%89%E3%83%89%E3%83%A9%E3%82%A4%E3%83%96%E5%AF%84%E4%BB%98-scaled.jpeg'
  ];

  for (const img of sampleImages) {
    const res = await testUrl(img);
    console.log(`Image ${img.padEnd(50)} -> ${res.status} (${res.type})`);
  }

  console.log('\n--- 3. Testing Self-Hosted Vendor CSS/JS ---');
  const vendorAssets = [
    '/wp-content/themes/astra/assets/css/minified/main.min.css',
    '/wp-content/plugins/elementor/assets/css/frontend.min.css',
    '/wp-includes/js/jquery/jquery.min.js',
    '/wp-content/plugins/elementor/assets/lib/swiper/v8/swiper.min.js'
  ];

  for (const asset of vendorAssets) {
    const res = await testUrl(asset);
    console.log(`Vendor ${asset.padEnd(60)} -> ${res.status} (${res.type})`);
  }
}

run().catch(console.error);
