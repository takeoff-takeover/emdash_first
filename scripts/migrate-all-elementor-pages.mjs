// scripts/migrate-all-elementor-pages.mjs
import fs from 'fs';
import path from 'path';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const targets = [
  {
    slug: 'corporate',
    url: 'https://www.nicole.co.jp/corporate/',
    outPath: 'src/pages/corporate.astro',
    title: '会社概要 | Nicole Group 公式',
    description: 'ニコル・グループの会社概要、代表メッセージ、5つの事業会社、受賞歴、企業データをご紹介します。'
  },
  {
    slug: 'philosophy',
    url: 'https://www.nicole.co.jp/philosophy/',
    outPath: 'src/pages/philosophy.astro',
    title: '企業理念 | Nicole Group 公式',
    description: 'ニコル・グループの理念、ミッション、ビジョン、バリューをご紹介します。'
  },
  {
    slug: 'bmw',
    url: 'https://www.nicole.co.jp/bmw/',
    outPath: 'src/pages/bmw.astro',
    title: 'Nicole BMW | 7年連続全国最優秀ディーラー',
    description: 'BMW正規ディーラー Nicole BMW。7度の最優秀ディーラー受賞実績、モデルラインナップ、ショールーム情報。'
  },
  {
    slug: 'mini',
    url: 'https://www.nicole.co.jp/mini/',
    outPath: 'src/pages/mini.astro',
    title: 'Nicole MINI | 3度全国最優秀ディーラー',
    description: 'MINI正規ディーラー Nicole MINI。3度の全国最優秀賞受賞、最新モデルラインナップ、ショールーム情報。'
  },
  {
    slug: 'locations',
    url: 'https://www.nicole.co.jp/locations/',
    outPath: 'src/pages/locations.astro',
    title: '拠点一覧 | Nicole Group 公式',
    description: 'ニコル・グループのショールーム・サービスセンター拠点一覧。BMW、MINI、Rolls-Royce、Ferrari各ショールームをご案内。'
  },
  {
    slug: 'esg_sdgs',
    url: 'https://www.nicole.co.jp/esg_sdgs/',
    outPath: 'src/pages/esg_sdgs.astro',
    title: 'ESG / SDGs | Nicole Group 公式',
    description: 'ニコル・グループの持続可能な未来への取り組み。環境保全、地域社会貢献活動、ガバナンスへの取り組み。'
  },
  {
    slug: 'privacystatement',
    url: 'https://www.nicole.co.jp/privacystatement/',
    outPath: 'src/pages/privacystatement.astro',
    title: 'プライバシー・ポリシー | Nicole Group 公式',
    description: 'ニコル・グループの個人情報保護方針、お客様情報の取り扱い方針について定めたプライバシーステートメントです。'
  },
  {
    slug: 'customer-policy',
    url: 'https://www.nicole.co.jp/corporate/customer-policy/',
    outPath: 'src/pages/customer-policy.astro',
    title: 'お客さま本位の業務運営方針（FD宣言） | Nicole Group 公式',
    description: 'ニコル・グループ各社が定める「お客さま本位の業務運営方針（FD宣言）」をご案内いたします。'
  },
  {
    slug: 'contact',
    url: 'https://www.nicole.co.jp/contact/',
    outPath: 'src/pages/contact.astro',
    title: 'お問い合わせ | Nicole Group 公式',
    description: 'ニコル・グループへのお問い合わせ・ご相談窓口。試乗・商談・点検整備など各ショールームへのお問い合わせはこちら。'
  },
  {
    slug: 'contact-thanks',
    url: 'https://www.nicole.co.jp/contact-thanks/',
    outPath: 'src/pages/contact-thanks.astro',
    title: 'お問い合わせ完了 | Nicole Group 公式',
    description: 'お問い合わせを受け付けいたしました。担当者より順次ご連絡差し上げます。'
  },
  // 5 Group Company Profiles
  {
    slug: 'nicole-cars',
    url: 'https://www.nicole.co.jp/corporate/nicole-cars/',
    outPath: 'src/components/companies/NicoleCarsElementor.html',
    title: 'ニコル・カーズ合同会社 | Nicole Group 公式',
    description: 'BMW正規ディーラー、MINI正規ディーラーを展開するニコル・カーズ合同会社の企業情報です。'
  },
  {
    slug: 'nicole-automobiles',
    url: 'https://www.nicole.co.jp/corporate/nicole-automobiles/',
    outPath: 'src/components/companies/NicoleAutomobilesElementor.html',
    title: 'ニコル・オートモビルズ合同会社 | Nicole Group 公式',
    description: 'BMW ALPINAの日本総輸入元として歴史を紡ぐニコル・オートモビルズ合同会社の企業情報です。'
  },
  {
    slug: 'nicole-motorcars',
    url: 'https://www.nicole.co.jp/corporate/nicole-motorcars/',
    outPath: 'src/components/companies/NicoleMotorcarsElementor.html',
    title: 'ニコル・モーターカーズ合同会社 | Nicole Group 公式',
    description: 'Rolls-Royce Motor Cars正規販売代理店 ニコル・モーターカーズ合同会社の企業情報です。'
  },
  {
    slug: 'nicole-competizione',
    url: 'https://www.nicole.co.jp/corporate/nicole-competizione/',
    outPath: 'src/components/companies/NicoleCompetizioneElementor.html',
    title: 'ニコル・コンペティツィオーネ合同会社 | Nicole Group 公式',
    description: 'Ferrari正規ディーラー ニコル・コンペティツィオーネ合同会社の企業情報です。'
  },
  {
    slug: 'nicole-racing-japan',
    url: 'https://www.nicole.co.jp/corporate/nicole-racing-japan/',
    outPath: 'src/components/companies/NicoleRacingJapanElementor.html',
    title: 'ニコル・レーシング・ジャパン合同会社 | Nicole Group 公式',
    description: 'ニコル・グループの創業母体、ニコル・レーシング・ジャパン合同会社の企業情報です。'
  }
];

// Helper to download a remote file and return its local public/ path
async function downloadAssetLocally(remoteUrl, baseSubdir = '') {
  try {
    const cleanUrl = remoteUrl.split('?')[0];
    let relPath = '';

    if (cleanUrl.includes('/wp-content/uploads/')) {
      relPath = 'public' + cleanUrl.slice(cleanUrl.indexOf('/wp-content/uploads/'));
    } else if (cleanUrl.includes('/wp-content/')) {
      relPath = 'public' + cleanUrl.slice(cleanUrl.indexOf('/wp-content/'));
    } else if (cleanUrl.includes('/wp-includes/')) {
      relPath = 'public' + cleanUrl.slice(cleanUrl.indexOf('/wp-includes/'));
    } else {
      const filename = path.basename(cleanUrl);
      relPath = path.join('public', baseSubdir, filename);
    }

    if (fs.existsSync(relPath)) {
      return relPath.replace(/^public/, '');
    }

    fs.mkdirSync(path.dirname(relPath), { recursive: true });
    console.log(`  Downloading ${remoteUrl} -> ${relPath}`);
    const res = await fetch(remoteUrl);
    if (!res.ok) {
      console.warn(`  Warning: failed to download ${remoteUrl} (${res.status})`);
      return null;
    }
    const buf = Buffer.from(await res.arrayBuffer());
    fs.writeFileSync(relPath, buf);
    return relPath.replace(/^public/, '');
  } catch (e) {
    console.warn(`  Download error for ${remoteUrl}: ${e.message}`);
    return null;
  }
}

// Rewriting URLs inside HTML
function rewriteUrls(html) {
  let cleaned = html;

  // 1. Rewrite remote uploads to local uploads
  cleaned = cleaned.replace(/https?:\/\/(?:www\.)?nicole\.co\.jp\/wp\/wp-content\/uploads\//g, '/uploads/');
  cleaned = cleaned.replace(/https?:\/\/(?:www\.)?nicole\.co\.jp\/wp-content\/uploads\//g, '/uploads/');
  cleaned = cleaned.replace(/https?:\/\/(?:www\.)?nicole\.co\.jp\/wp\/wp-content\//g, '/wp-content/');
  cleaned = cleaned.replace(/https?:\/\/(?:www\.)?nicole\.co\.jp\/wp-content\//g, '/wp-content/');

  // 2. Rewrite internal navigation links
  cleaned = cleaned.replace(/https?:\/\/(?:www\.)?nicole\.co\.jp\/corporate\/nicole-cars\/?/g, '/pages/nicole-cars');
  cleaned = cleaned.replace(/https?:\/\/(?:www\.)?nicole\.co\.jp\/corporate\/nicole-automobiles\/?/g, '/pages/nicole-automobiles');
  cleaned = cleaned.replace(/https?:\/\/(?:www\.)?nicole\.co\.jp\/corporate\/nicole-motorcars\/?/g, '/pages/nicole-motorcars');
  cleaned = cleaned.replace(/https?:\/\/(?:www\.)?nicole\.co\.jp\/corporate\/nicole-competizione\/?/g, '/pages/nicole-competizione');
  cleaned = cleaned.replace(/https?:\/\/(?:www\.)?nicole\.co\.jp\/corporate\/nicole-racing-japan\/?/g, '/pages/nicole-racing-japan');
  cleaned = cleaned.replace(/https?:\/\/(?:www\.)?nicole\.co\.jp\/corporate\/customer-policy\/?/g, '/customer-policy');
  cleaned = cleaned.replace(/https?:\/\/(?:www\.)?nicole\.co\.jp\/corporate\/?/g, '/corporate');
  cleaned = cleaned.replace(/https?:\/\/(?:www\.)?nicole\.co\.jp\/philosophy\/?/g, '/philosophy');
  cleaned = cleaned.replace(/https?:\/\/(?:www\.)?nicole\.co\.jp\/bmw\/?/g, '/bmw');
  cleaned = cleaned.replace(/https?:\/\/(?:www\.)?nicole\.co\.jp\/mini\/?/g, '/mini');
  cleaned = cleaned.replace(/https?:\/\/(?:www\.)?nicole\.co\.jp\/locations\/?/g, '/locations');
  cleaned = cleaned.replace(/https?:\/\/(?:www\.)?nicole\.co\.jp\/esg_sdgs\/?/g, '/esg_sdgs');
  cleaned = cleaned.replace(/https?:\/\/(?:www\.)?nicole\.co\.jp\/privacystatement\/?/g, '/privacystatement');
  cleaned = cleaned.replace(/https?:\/\/(?:www\.)?nicole\.co\.jp\/contact-thanks\/?/g, '/contact-thanks');
  cleaned = cleaned.replace(/https?:\/\/(?:www\.)?nicole\.co\.jp\/contact\/?/g, '/contact');
  cleaned = cleaned.replace(/https?:\/\/(?:www\.)?nicole\.co\.jp\/magazine\/?/g, '/posts');
  cleaned = cleaned.replace(/https?:\/\/(?:www\.)?nicole\.co\.jp\/?(?=["' >])/g, '/');

  return cleaned;
}

async function migratePage(target) {
  console.log(`\n========================================`);
  console.log(`Processing ${target.slug} (${target.url})`);
  console.log(`========================================`);

  const res = await fetch(target.url);
  if (!res.ok) {
    throw new Error(`Failed to fetch ${target.url}: ${res.status}`);
  }
  const html = await res.text();

  // 1. Extract and download all stylesheets
  const linkRegex = /<link\s+[^>]*rel=["']stylesheet["'][^>]*>/gi;
  const linkTags = html.match(linkRegex) || [];
  const localCssHrefs = [];

  for (const tag of linkTags) {
    const hrefMatch = tag.match(/href=["']([^"']+)["']/);
    if (!hrefMatch) continue;
    const href = hrefMatch[1];
    if (href.includes('elementor') || href.includes('astra') || href.includes('swiper') || href.includes('post-')) {
      const localHref = await downloadAssetLocally(href);
      if (localHref) {
        localCssHrefs.push(localHref);
      }
    }
  }

  // 2. Extract Elementor main content block
  // Locate data-elementor-type="wp-page"
  const startIdx = html.indexOf('<div data-elementor-type="wp-page"');
  if (startIdx === -1) {
    console.warn(`Could not find data-elementor-type="wp-page" for ${target.slug}`);
    return;
  }
  const endMarker = '<!-- .entry-content -->';
  const endIdx = html.indexOf(endMarker, startIdx);
  let rawContent = '';
  if (endIdx !== -1) {
    rawContent = html.slice(startIdx, endIdx).trim();
  } else {
    const articleEnd = html.indexOf('</article>', startIdx);
    rawContent = html.slice(startIdx, articleEnd !== -1 ? articleEnd : html.length).trim();
  }

  // 3. Scan all images in content and download if missing
  const imgMatches = [...rawContent.matchAll(/src=["'](https?:\/\/[^"']+)["']/gi)];
  for (const m of imgMatches) {
    const imgUrl = m[1];
    if (imgUrl.includes('nicole.co.jp')) {
      await downloadAssetLocally(imgUrl, 'uploads');
    }
  }

  // 4. Rewrite URLs
  let processedContent = rewriteUrls(rawContent);

  // If this target is an HTML component (for 5 companies)
  if (target.outPath.endsWith('.html')) {
    fs.mkdirSync(path.dirname(target.outPath), { recursive: true });
    // Save metadata json as well
    const metaObj = {
      slug: target.slug,
      title: target.title,
      description: target.description,
      cssFiles: [...new Set(localCssHrefs)],
    };
    fs.writeFileSync(target.outPath.replace(/\.html$/, '.json'), JSON.stringify(metaObj, null, 2), 'utf8');
    fs.writeFileSync(target.outPath, processedContent, 'utf8');
    console.log(`Saved HTML fragment and metadata for ${target.slug}`);
    return;
  }

  // 5. Generate complete Astro page
  const uniqueCss = [...new Set(localCssHrefs)];
  const cssLinksCode = uniqueCss.map(c => `\t<link rel="stylesheet" href="${c}" />`).join('\n');

  const astroPageCode = `---
// ${target.outPath}
// ニコル・グループ 公式固定ページ（WordPress/Elementor デザインレイアウト完全継承）
import NicoleLayout from "../layouts/NicoleLayout.astro";

const pageTitle = "${target.title}";
const pageDescription = "${target.description}";

// Elementor 完全継承HTMLコンテンツ
const elementorHtml = ${JSON.stringify(processedContent)};
---

<NicoleLayout title={pageTitle} description={pageDescription}>
  <slot name="head" slot="head">
${cssLinksCode}
    <style is:global>
      /* Elementor 余白・レイアウト完全適合スタイル */
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
      /* コンテナ幅・表示崩れ防止 */
      .elementor-element {
        --flex-direction: initial;
        --flex-wrap: initial;
        --justify-content: initial;
        --align-items: initial;
      }
    </style>
  </slot>

  <div class="elementor-page-wrapper">
    <div class="entry-content" set:html={elementorHtml} />
  </div>
</NicoleLayout>
`;

  fs.mkdirSync(path.dirname(target.outPath), { recursive: true });
  fs.writeFileSync(target.outPath, astroPageCode, 'utf8');
  console.log(`✅ Successfully generated Astro page: ${target.outPath}`);
}

async function run() {
  console.log(`Starting Elementor exact layout migration for ${targets.length} pages...`);
  for (const t of targets) {
    try {
      await migratePage(t);
    } catch (e) {
      console.error(`❌ Error migrating ${t.slug}: ${e.message}`);
    }
  }
  console.log(`\nAll target pages migrated!`);
}

run();
