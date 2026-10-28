import fs from 'fs';

let content = fs.readFileSync('src/pages/magazine/[slug].astro', 'utf8');

// Replace .slide-badge
content = content.replace(
  /\.slide-badge\s*\{[\s\S]*?\}/,
  `.slide-badge {
		position: absolute;
		top: 14px;
		right: 14px;
		padding: 4px 8px;
		background: rgba(0, 0, 0, 0.8);
		border: 1px solid rgba(255, 255, 255, 0.25);
		border-radius: 0;
		font-family: var(--font-mono, monospace);
		font-size: 11px;
		font-weight: 600;
		color: #ffffff;
		letter-spacing: 0.05em;
	}`
);

// Replace .slider-thumb-btn border-radius: 6px -> 0
content = content.replace(
  /\.slider-thumb-btn\s*\{[\s\S]*?border-radius:\s*6px;[\s\S]*?\}/,
  (m) => m.replace('border-radius: 6px;', 'border-radius: 0;')
);

fs.writeFileSync('src/pages/magazine/[slug].astro', content, 'utf8');
console.log('Updated magazine/[slug].astro: removed oval slide-badge');
