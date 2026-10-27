// scripts/generate-company-pages.mjs
import fs from 'fs';
import path from 'path';

const companies = [
  { slug: 'nicole-cars', base: 'NicoleCarsElementor', title: 'ニコル・カーズ合同会社 | Nicole Group 公式', desc: 'BMW正規ディーラー、MINI正規ディーラーを展開するニコル・カーズ合同会社の企業情報です。' },
  { slug: 'nicole-automobiles', base: 'NicoleAutomobilesElementor', title: 'ニコル・オートモビルズ合同会社 | Nicole Group 公式', desc: 'BMW ALPINAの日本総輸入元として歴史を紡ぐニコル・オートモビルズ合同会社の企業情報です。' },
  { slug: 'nicole-motorcars', base: 'NicoleMotorcarsElementor', title: 'ニコル・モーターカーズ合同会社 | Nicole Group 公式', desc: 'Rolls-Royce Motor Cars正規販売代理店 ニコル・モーターカーズ合同会社の企業情報です。' },
  { slug: 'nicole-competizione', base: 'NicoleCompetizioneElementor', title: 'ニコル・コンペティツィオーネ合同会社 | Nicole Group 公式', desc: 'Ferrari正規ディーラー ニコル・コンペティツィオーネ合同会社の企業情報です。' },
  { slug: 'nicole-racing-japan', base: 'NicoleRacingJapanElementor', title: 'ニコル・レーシング・ジャパン合同会社 | Nicole Group 公式', desc: 'ニコル・グループの創業母体、ニコル・レーシング・ジャパン合同会社の企業情報です。' },
];

function generateAstro(c) {
  const jsonPath = path.join('src/components/companies', `${c.base}.json`);
  const htmlPath = path.join('src/components/companies', `${c.base}.html`);

  const meta = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  const html = fs.readFileSync(htmlPath, 'utf8');

  const cssLinks = (meta.cssFiles || []).map(f => `    <link rel="stylesheet" href="${f}" />`).join('\n');

  return `---
// ニコル・グループ 公式企業ページ（WordPress/Elementor デザインレイアウト完全継承）
import NicoleLayout from "../../layouts/NicoleLayout.astro";

const pageTitle = "${c.title}";
const pageDescription = "${c.desc}";

const elementorHtml = ${JSON.stringify(html)};
---

<NicoleLayout title={pageTitle} description={pageDescription}>
  <slot name="head" slot="head">
${cssLinks}
    <style is:global>
      .elementor {
        box-sizing: border-box;
      }
      .entry-content {
        width: 100%;
        max-width: 100%;
        margin: 0;
        padding: 0;
      }
      .elementor img {
        height: auto;
        max-width: 100%;
      }
    </style>
  </slot>

  <div class="elementor-page-wrapper">
    <div class="entry-content" set:html={elementorHtml} />
  </div>
</NicoleLayout>
`;
}

for (const c of companies) {
  const code = generateAstro(c);
  // Write to src/pages/pages/[slug].astro
  const target1 = path.join('src/pages/pages', `${c.slug}.astro`);
  fs.mkdirSync(path.dirname(target1), { recursive: true });
  fs.writeFileSync(target1, code, 'utf8');
  console.log(`Generated ${target1}`);

  // Write to src/pages/corporate/[slug].astro (for URL compatibility)
  const target2 = path.join('src/pages/corporate', `${c.slug}.astro`);
  fs.mkdirSync(path.dirname(target2), { recursive: true });
  fs.writeFileSync(target2, code, 'utf8');
  console.log(`Generated ${target2}`);
}
