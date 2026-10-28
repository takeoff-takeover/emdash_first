import fs from 'fs';

let content = fs.readFileSync('src/components/blocks/SliderBlock.astro', 'utf8');

// Replace .slider-counter styling
content = content.replace(
  /\.slider-counter\s*\{[\s\S]*?\}/,
  `.slider-counter {
		font-family: var(--font-mono, monospace);
		font-size: 0.85rem;
		font-weight: 500;
		color: #9ca3af;
		background: transparent;
		border: none;
		padding: 0;
		border-radius: 0;
		letter-spacing: 0.08em;
	}`
);

// Replace .counter-current styling (monotone white)
content = content.replace(
  /\.counter-current\s*\{[\s\S]*?\}/,
  `.counter-current {
		color: #ffffff;
		font-weight: 700;
	}`
);

// Replace .slider-badge if present
content = content.replace(
  /\.slider-badge\s*\{[\s\S]*?\}/,
  `.slider-badge {
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
		font-family: var(--font-mono, monospace);
		font-size: 0.72rem;
		letter-spacing: 0.12em;
		color: #ffffff;
		background: rgba(255, 255, 255, 0.08);
		padding: 0.25rem 0.5rem;
		border-radius: 0;
		font-weight: 600;
	}`
);

// Replace .dot-btn styling (bars instead of circle/oval dots)
content = content.replace(
  /\.dot-btn\s*\{[\s\S]*?\}\s*\.dot-btn\.active\s*\{[\s\S]*?\}/,
  `.dot-btn {
		width: 24px;
		height: 2px;
		border-radius: 0;
		background: rgba(255, 255, 255, 0.25);
		border: none;
		cursor: pointer;
		padding: 0;
		transition: background 0.2s ease;
	}
	.dot-btn.active {
		background: #ffffff;
		transform: none;
	}`
);

fs.writeFileSync('src/components/blocks/SliderBlock.astro', content, 'utf8');
console.log('Updated SliderBlock.astro: removed oval buttons and dots');
