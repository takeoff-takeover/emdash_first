// scripts/test-migrate-single.mjs
import fs from 'fs';
import path from 'path';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

async function testSingle() {
  const url = 'https://www.nicole.co.jp/corporate/nicole-cars/';
  console.log('Fetching', url);
  const res = await fetch(url);
  const html = await res.text();

  // Find stylesheets
  const linkRegex = /<link\s+[^>]*rel=["']stylesheet["'][^>]*>/gi;
  const links = html.match(linkRegex) || [];
  const stylesheets = [];
  for (const l of links) {
    const href = l.match(/href=["']([^"']+)["']/)?.[1];
    if (href && (href.includes('elementor') || href.includes('post-') || href.includes('astra-addon'))) {
      stylesheets.push(href);
    }
  }
  console.log('Stylesheets to download/link:', stylesheets.length);
  stylesheets.forEach(s => console.log(' -', s));

  // Find Elementor content block
  // Pattern 1: data-elementor-type="wp-page"
  const startIdx = html.indexOf('<div data-elementor-type="wp-page"');
  if (startIdx === -1) {
    console.error('Could not find data-elementor-type="wp-page"');
    return;
  }
  // Find where it ends: usually before </article> or <footer or .entry-content
  const endIdx = html.indexOf('<!-- .entry-content -->', startIdx);
  let elementorContent = '';
  if (endIdx !== -1) {
    elementorContent = html.slice(startIdx, endIdx).trim();
  } else {
    const articleEnd = html.indexOf('</article>', startIdx);
    elementorContent = html.slice(startIdx, articleEnd).trim();
  }
  console.log('Extracted Elementor content length:', elementorContent.length);

  // Check inline styles
  const inlineStyles = [...html.matchAll(/<style[^>]*id="([^"]*elementor[^"]*)"[^>]*>([\s\S]*?)<\/style>/gi)];
  console.log('Inline Elementor styles found:', inlineStyles.length);
}

testSingle();
