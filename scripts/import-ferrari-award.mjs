import fs from 'fs';
import { DatabaseSync } from 'node:sqlite';

const db = new DatabaseSync('seed/backup.sqlite');

const articleId = '01M6WORLD1FERRARINICOLE202611';
const slug = '202611_ferrari_world-award-2025';
const title = '世界が認めた跳ね馬の頂点へ。Nicole Competizione、2025年度「サービス部門 世界一」の栄冠に輝く';
const publishedAt = '2026-11-20T19:32:15.000Z';
const featuredImage = {
  src: '/uploads/2026/11/nczworld1-scaled.png',
  alt: '世界が認めた跳ね馬の頂点へ。Nicole Competizione、2025年度「サービス部門 世界一」の栄冠に輝く'
};
const excerpt = 'Nicole Competizioneは、フェラーリ正規ディーラーのアフターセールス（サービス）部門において世界の頂点に輝きました。2026年11月19日、Ferrari S.p.A. 主催の年次総会「Ferrari Dealer Annual Meeting」において、2025年度のサービス部門最高賞「Global Top Service Dealer Award 2025」を受賞。世界60以上の市場で展開される正規ディーラーネットワークの中で、世界一の栄冠を獲得いたしました。';

// Portable Text Content Blocks
const content = [
  {
    _type: 'block',
    _key: 'b-intro-1',
    style: 'normal',
    children: [{ _type: 'span', _key: 's-intro-1', text: '日本一の、その先へ ────── ' }]
  },
  {
    _type: 'block',
    _key: 'b-intro-2',
    style: 'normal',
    children: [{ _type: 'span', _key: 's-intro-2', text: 'Nicole Competizioneは、フェラーリ正規ディーラーのアフターセールス（サービス）部門において世界の頂点に輝きました。2026年11月19日、Ferrari S.p.A. 主催の年次総会「Ferrari Dealer Annual Meeting」において、2025年度のサービス部門最高賞「Global Top Service Dealer Award 2025」を受賞。世界60以上の市場で展開されるフェラーリ正規ディーラーネットワークの中で、サービス部門世界一の栄冠を獲得いたしました。' }]
  },
  {
    _type: 'block',
    _key: 'b-intro-3',
    style: 'normal',
    children: [{ _type: 'span', _key: 's-intro-3', text: '日頃より支えてくださるすべてのお客様に、心より感謝申し上げます。' }]
  },
  {
    _type: 'customImage',
    _key: 'b-img-1',
    image: {
      src: '/uploads/2026/11/large_preview-.jpg',
      alt: 'Nicole Competizione 代表取締役社長 ミヒャエル・ヴィット、ゼネラルマネージャー 北川 隆三'
    },
    caption: '写真右から：Nicole Competizione 代表取締役社長 ミヒャエル・ヴィット、ゼネラルマネージャー 北川 隆三'
  },
  {
    _type: 'block',
    _key: 'b-h2-1',
    style: 'h2',
    children: [{ _type: 'span', _key: 's-h2-1', text: '世界最高峰のディーラーネットワークを牽引する評価基準' }]
  },
  {
    _type: 'block',
    _key: 'b-p-1',
    style: 'normal',
    children: [{ _type: 'span', _key: 's-p-1', text: '「Global Top Service Dealer Award」は、世界中のフェラーリ正規ディーラーを対象に、年間を通じたサービスクオリティを多角的に審査・選出する最も権威ある賞です。高度な整備技術はもちろん、パーツ供給の正確性、整備入庫時の迅速な対応、専用テスターを用いた厳格な車両診断、そして何よりオーナー様からの高い顧客満足度に至るまで、あらゆる領域の総合的なパフォーマンスが厳格に評価されます。' }]
  },
  {
    _type: 'customImage',
    _key: 'b-img-2',
    image: {
      src: '/uploads/2026/02/Z7A8366_re_web.avif',
      alt: 'Nicole Competizione 港北サービスセンター'
    },
    caption: '世界最高水準の整備技術を誇るNicole Competizione 港北サービスセンター'
  },
  {
    _type: 'block',
    _key: 'b-h2-2',
    style: 'h2',
    children: [{ _type: 'span', _key: 's-h2-2', text: '「ONE Nicole」で築いた、世界最高水準の安心と信頼' }]
  },
  {
    _type: 'block',
    _key: 'b-p-2',
    style: 'normal',
    children: [{ _type: 'span', _key: 's-p-2', text: '今回の受賞は、港北サービスセンターのサービスチームを中心に、日々オーナー様と一台一台のお車に真摯に向き合ってきた積み重ねが国際水準で認められた証です。' }]
  },
  {
    _type: 'block',
    _key: 'b-p-3',
    style: 'normal',
    children: [{ _type: 'span', _key: 's-p-3', text: 'フェラーリという至高のブランドを所有する喜びを支えるのは、確かな技術力と、細部まで行き届くホスピタリティに他なりません。その根底にあるのは、ニコル・グループが大切にしてきた「ONE Nicole」の精神です。サービス、セールス、そしてブランド体験を支えるすべての部門が垣根を越えて一丸となり、オーナー様との深い信頼関係を築いてきたからこそ、この到達点へとたどり着くことができました。' }]
  },
  {
    _type: 'block',
    _key: 'b-p-4',
    style: 'normal',
    children: [{ _type: 'span', _key: 's-p-4', text: '世界一という称号を新たな基準とし、これからも謙虚に、目の前のお客様のためにできることを一つずつ積み重ねながら、跳ね馬がもたらす唯一無二の感動を最高のコンディションとともにお届けしてまいります。' }]
  },
  {
    _type: 'customImage',
    _key: 'b-img-3',
    image: {
      src: '/uploads/2026/11/DSC7864.png',
      alt: 'Nicole Competizione ショールーム'
    },
    caption: 'Nicole Competizione 横浜ショールーム'
  },
  {
    _type: 'block',
    _key: 'b-h2-3',
    style: 'h2',
    children: [{ _type: 'span', _key: 's-h2-3', text: '世界が認めた空間とホスピタリティを、ぜひショールーム、サービスセンターで' }]
  },
  {
    _type: 'block',
    _key: 'b-p-5',
    style: 'normal',
    children: [{ _type: 'span', _key: 's-p-5', text: 'Nicole Competizioneでは、世界最高水準と認められた港北サービスセンターでのメンテナンス・整備のご相談をはじめ、最新モデルの展示や厳格な基準をクリアしたフェラーリ認定中古車（Ferrari Approved）のご案内まで、オーナー様一人ひとりのフェラーリライフをトータルでサポートしております。' }]
  },
  {
    _type: 'block',
    _key: 'b-p-6',
    style: 'normal',
    children: [{ _type: 'span', _key: 's-p-6', text: '世界の頂点に立った技術力と空間、そしてフェラーリが放つ圧倒的な情熱を、ぜひ実際のショールームおよびサービスセンターにてご体感ください。スタッフ一同、皆様のご来場を心よりお待ち申し上げております。' }]
  },
  {
    _type: 'cta',
    _key: 'b-cta-1',
    heading: '世界一のクオリティを、あなたのお手元に',
    text: 'Nicole Competizioneでの点検・整備、モデル試乗、認定中古車のご相談を承ります。',
    buttonText: '試乗・商談予約をする',
    buttonUrl: '/contact/?form_type=inquiry',
    theme: 'primary',
    card_style: 'box'
  }
];

// Check if already exists in backup.sqlite
const existing = db.prepare('SELECT id FROM ec_magazine WHERE slug = ?').get(slug);
if (!existing) {
  db.prepare(`
    INSERT INTO ec_magazine (
      id, slug, status, author_id, primary_byline_id, created_at, updated_at, published_at, version, locale, translation_group, title, featured_image, content, excerpt, layout
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    articleId,
    slug,
    'published',
    'system',
    null,
    publishedAt,
    publishedAt,
    publishedAt,
    1,
    'ja',
    articleId,
    title,
    JSON.stringify(featuredImage),
    JSON.stringify(content),
    excerpt,
    'standard'
  );
  console.log('Inserted ec_magazine article:', slug);
} else {
  db.prepare(`
    UPDATE ec_magazine SET
      title = ?,
      featured_image = ?,
      content = ?,
      excerpt = ?,
      status = 'published',
      published_at = ?
    WHERE slug = ?
  `).run(title, JSON.stringify(featuredImage), JSON.stringify(content), excerpt, publishedAt, slug);
  console.log('Updated ec_magazine article:', slug);
}

// Add content_taxonomies
const termBrand = 'term_brand_ferrari';
const termCat = 'term_mag_people';

for (const tId of [termBrand, termCat]) {
  const hasTax = db.prepare('SELECT entry_id FROM content_taxonomies WHERE collection = ? AND entry_id = ? AND taxonomy_id = ?').get('magazine', articleId, tId);
  if (!hasTax) {
    db.prepare('INSERT INTO content_taxonomies (collection, entry_id, taxonomy_id, published_at, created_at) VALUES (?, ?, ?, ?, ?)').run('magazine', articleId, tId, publishedAt, publishedAt);
    console.log('Attached taxonomy:', tId);
  }
}

// Add views
const hasViews = db.prepare('SELECT slug FROM article_views WHERE slug = ?').get(slug);
if (!hasViews) {
  db.prepare('INSERT INTO article_views (slug, collection, views, created_at, updated_at) VALUES (?, ?, ?, ?, ?)').run(slug, 'magazine', 3280, publishedAt, publishedAt);
  console.log('Seeded views for:', slug);
}

// Synchronize with seed/seed.json
const seed = JSON.parse(fs.readFileSync('seed/seed.json', 'utf8'));
if (!seed.content.magazine) seed.content.magazine = [];

const existingSeedIdx = seed.content.magazine.findIndex(m => m.slug === slug || m.id === articleId);
const newSeedItem = {
  id: articleId,
  slug,
  status: 'published',
  author_id: 'system',
  primary_byline_id: null,
  created_at: publishedAt,
  updated_at: publishedAt,
  published_at: publishedAt,
  version: 1,
  locale: 'ja',
  translation_group: articleId,
  title,
  featured_image: featuredImage,
  content,
  excerpt,
  layout: 'standard'
};

if (existingSeedIdx >= 0) {
  seed.content.magazine[existingSeedIdx] = newSeedItem;
} else {
  seed.content.magazine.unshift(newSeedItem);
}

// Synchronize taxonomies in seed.json
if (!seed.content_taxonomies) seed.content_taxonomies = [];
for (const tId of [termBrand, termCat]) {
  const hasSeedTax = seed.content_taxonomies.some(t => t.collection === 'magazine' && t.entry_id === articleId && t.taxonomy_id === tId);
  if (!hasSeedTax) {
    seed.content_taxonomies.push({
      collection: 'magazine',
      entry_id: articleId,
      taxonomy_id: tId,
      published_at: publishedAt,
      created_at: publishedAt
    });
  }
}

fs.writeFileSync('seed/seed.json', JSON.stringify(seed, null, 2));
console.log('Synchronized seed/seed.json');
