# Project Guidelines for Claude Code

This is an EmDash CMS project built on Astro.
When working in this repository, strictly adhere to all guidelines, rules, and design principles below.

## Key Files & Structure
- `AGENTS.md`: Full project specifications and master rules.
- `.agents/rules/`: Detailed rulebooks (`article-block-rules.md`, `design-rules.md`, etc.).
- `src/pages/magazine/`: Nicole Connect Magazine pages.
- `src/components/blocks/`: Structured Portable Text custom blocks (TableBlock, SplitMediaBlock, ColumnCardsBlock, CTABlock, NotesBlock, AccordionBlock, SliderBlock).

## Core Design Principles & Rules (All AI & Human Editors)

### 1. Color Palette: Monotone Base + Strategic Red
- Base palette is strictly **Black, White, and Gray (Monotone)** (`#0a0a0c`, `#141418`, neutral grays). No arbitrary blue, purple, yellow, or multi-color decorations.
- **Strategic Red Accent ("ここぞという時の赤")**: Red (`#e11d48` / `#dc2626` / `#E60012`) is strictly reserved for high-impact focal points (primary CTA conversion buttons, critical badges). Never use red casually on routine text, regular borders, or secondary elements.

### 2. Dignified Japanese Typography & Clean Gallleries
- Avoid cheap AI-flavored English labels (e.g. "SPECIAL BENEFITS") or promotional clutter ("PHOTO GALLERY", "全○点", "【エクステリア】").
- Use clean, simple, and high-status Japanese editorial typography.

### 3. Vehicle Photography Cropping Prohibition (全景カットの欠損厳禁)
- **Awkward cropping of vehicle silhouettes is strictly forbidden**: Never crop a vehicle exterior photo so that bumpers, wheels, roof, or ends get chopped off when showing ~80% of the car.
- **Intentional close-ups of details are encouraged**: Close-ups of headlights, taillights, emblems, steering wheels, or wheel spokes are completely fine. Full vehicle shots must be fully visible with clean aspect ratios (`object-fit: contain` or unclipped frames).

### 4. Photo-First Explanation & "No Image" Placeholder Rule
- Features requiring visual context (headlights, interiors, display screens, wheel textures) must use photo-oriented layout blocks (`split_media`, photo cards).
- If actual photos are not available at creation time, NEVER retreat to plain text bullet points. Always insert the standard placeholder image (`/images/no-image.svg`) so human editors have a clear target to replace later in Admin UI.

### 5. Mobile & Tablet Responsive Table Cardification (No Horizontal Scroll)
- Tables must NEVER force horizontal scrolling on mobile or tablet.
- Automatic 3-stage transformation in `TableBlock.astro`:
  - **PC (> 1024px)**: Standard editorial table (`<table>`).
  - **Tablet (641px - 1024px)**: 2-column spec cards grid (`<dl><dt><dd>`).
  - **Mobile (<= 640px)**: 1-column vertical spec cards stack.
- Never use pseudo-element hacks (`::before { content: attr(data-label); }`) that cause duplicate labels.

### 6. Natural Heading Line Break & Phrasal Wrapping Rule (言葉の途中のぶつ切り改行禁止)
- Never allow mid-word awkward line breaks in headings (H1, H2, H3, H4) or cards (e.g. 「メリッ/ト」「注/意点」).
- Apply CSS `word-break: auto-phrase !important; line-break: strict !important;` to all headings.
- In article main titles (H1), segment into natural semantic phrases wrapped in `<span class="title-phrase">` (`display: inline-block`) at punctuation (`！`, `？`, `。`, `：`) or particle boundaries (`と`, `から`, etc.).

### 7. Section Block Spacing & Card Heading Margin Protection
- Treat "heading until the next heading begins" as a cohesive section block.
- Generous breathing room before section headings: H2 `margin-top: clamp(80px, 8.5vw, 116px)` and H3 `margin-top: clamp(56px, 6vw, 76px)`.
- **STRICT PROHIBITION**: Never let section margins leak into cards or widgets. Card internal titles (`.cms-col-card__title`, `.cms-split-card__title`, `.cms-spec-card__title`, `.cms-table-title`) must strictly maintain `margin-top: 0 !important;` to preserve card design balance and compactness.

### 8. Block-First Article Authoring (手動編集担保)
- Articles must be composed of structured Portable Text blocks (`table`, `cta`, `split_media`, `columnCards`, `accordion`, `slider`, `notes` / paragraph style `note`).
- Raw HTML dumping (`CustomHtmlBlock` with huge tables) is strictly prohibited so human editors can edit every cell and item directly in Admin UI.

## Workflows & Commands
- Dev start: `npm run dev` (Admin direct bypass: `http://localhost:4321/_emdash/api/auth/dev-bypass?redirect=/_emdash/admin`)
- Database backup: `npm run db:backup`
- Database restore: `npm run db:restore --force`
- Typecheck: `npm run typecheck`
- Deploy rule: Never deploy to Cloudflare (`wrangler deploy`) without explicit user instruction.
