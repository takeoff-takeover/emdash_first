import { DatabaseSync } from 'node:sqlite';
import fs from 'fs';
import path from 'path';

const d1Dir = '.wrangler/state/v3/d1/miniflare-D1DatabaseObject';
const files = fs.readdirSync(d1Dir);
const dbFile = files.find(f => f.endsWith('.sqlite') && !f.includes('metadata') && !f.includes('bak'));
if (!dbFile) {
  console.error('Database file not found');
  process.exit(1);
}

const db = new DatabaseSync(path.join(d1Dir, dbFile));

const postId = '01M5F4BMWIX4NEUEKLASSE2027';
const postSlug = '2027_new_bmw_ix4_neue_klasse';
const postTitle = '【公式発表】新型BMW iX4登場。次世代EV専用『ノイエ・クラッセ』SACが切り拓く航続828kmの新時代';
const postExcerpt = 'BMW公式プレスリリースより完全電動スポーツ・アクティビティ・クーペ『BMW iX4』が世界初公開。Cd値0.23の流麗なファストバック、最大出力612馬力のM60 xDrive、そして最大828kmの航続性能を誇る新世代SAC。';
const postPublishedAt = '2026-10-28T10:00:00.000Z';
const postFeaturedImage = JSON.stringify({
  id: '',
  provider: 'external',
  src: '/uploads/ix4/key-visual.svg'
});

const portableTextContent = [
  {
    _type: 'block',
    _key: 'ix4_intro_1',
    style: 'normal',
    children: [
      {
        _type: 'span',
        _key: 'ix4_intro_1s',
        text: 'BMW Groupは、次世代EV専用アーキテクチャ「ノイエ・クラッセ（Neue Klasse）」をベースにした初のスポーツ・アクティビティ・クーペ（SAC）、『新型BMW iX4』を公式発表しました。'
      }
    ]
  },
  {
    _type: 'block',
    _key: 'ix4_intro_2',
    style: 'normal',
    children: [
      {
        _type: 'span',
        _key: 'ix4_intro_2s',
        text: '流麗なファストバック・シルエットと、クラス最高峰の空力性能（Cd値0.23）を高次元で両立。新世代円筒形バッテリーセルと800V超急速充電アーキテクチャを搭載し、一充電での航続距離は最大828km（WLTP）に達します。さらに最高出力450kW（612hp）を誇るフラッグシップ「BMW iX4 M60 xDrive」もラインナップされ、2027年3月より順次グローバル市場へ導入されます。'
      }
    ]
  },
  {
    _type: 'block',
    _key: 'h2_press_quote',
    style: 'h2',
    children: [
      {
        _type: 'span',
        _key: 'h2_press_quote_s',
        text: '1. BMW公式プレスリリース引用（T0461402EN）'
      }
    ]
  },
  {
    _type: 'block',
    _key: 'quote_official',
    style: 'blockquote',
    children: [
      {
        _type: 'span',
        _key: 'quote_official_s',
        text: '“Extrovert, unmistakable and fully electric, the new BMW iX4 is the next Neue Klasse model from BMW. Like its Neue Klasse siblings, the new Sports Utility Vehicle in coupé form represents a technological leap forward into a new era. At the same time, the BMW iX4 showcases its own, particularly expressive interpretation of the reduced-to-the-essential Neue Klasse design. Its dynamic looks underscore the car’s clear sporting instincts ...”\n── BMW Group Official Press Release (Document ID: T0461402EN)\n\n【日本語公式要約】「外向的で、唯一無二、そして完全電動。新型BMW iX4は、BMWが放つ『ノイエ・クラッセ』の次なるマイルストーンです。他のノイエ・クラッセ兄弟車と同様に、このクーペスタイルのスポーツ・ユーティリティ・ビークル（SAC）は新時代への技術的な大躍進を体現しています。同時にBMW iX4は、本質へと研ぎ澄まされたノイエ・クラッセのデザイン言語を、独自の極めてエモーショナルな造形として昇華させました。そのダイナミックなプロポーションは、このクルマが秘めた明確なスポーツ本能を物語っています。」'
      }
    ]
  },
  {
    _type: 'block',
    _key: 'h2_specs',
    style: 'h2',
    children: [
      {
        _type: 'span',
        _key: 'h2_specs_s',
        text: '2. 主要モデルラインナップ ＆ スペック数値比較表'
      }
    ]
  },
  {
    _type: 'block',
    _key: 'p_specs_desc',
    style: 'normal',
    children: [
      {
        _type: 'span',
        _key: 'p_specs_desc_s',
        text: '新型BMW iX4は、ユーザーのドライビングスタイルや航続距離のニーズに合わせて、3つの魅力的な電動パワートレインを展開します。'
      }
    ]
  },
  {
    _type: 'block',
    _key: 'h2_dimensions',
    style: 'h2',
    children: [
      {
        _type: 'span',
        _key: 'h2_dimensions_s',
        text: '3. 車両主要諸元 ＆ パッケージング（空力・実用性）'
      }
    ]
  },
  {
    _type: 'block',
    _key: 'p_dim_desc',
    style: 'normal',
    children: [
      {
        _type: 'span',
        _key: 'p_dim_desc_s',
        text: 'Cd値0.23という卓越したエアロダイナミクス性能に加え、2,950mmのロングホイールベースとフラットフロア設計により、クーペ特有のエレガントな外観を保ちながらクラス屈指の室内居住性と積載スペースを実現しています。'
      }
    ]
  },
  {
    _type: 'block',
    _key: 'h2_faq',
    style: 'h2',
    children: [
      {
        _type: 'span',
        _key: 'h2_faq_s',
        text: '4. 新型BMW iX4 よくあるご質問（FAQ）'
      }
    ]
  },
  {
    _type: 'block',
    _key: 'p_faq_desc',
    style: 'normal',
    children: [
      {
        _type: 'span',
        _key: 'p_faq_desc_s',
        text: '導入時期、航続距離、充電性能、実用性など、お客様から多く寄せられる質問と公式回答をまとめました。'
      }
    ]
  },
  {
    _type: 'block',
    _key: 'h2_nicole_dealer',
    style: 'h2',
    children: [
      {
        _type: 'span',
        _key: 'h2_nicole_dealer_s',
        text: '5. Nicole BMW 正規ディーラーからのご案内'
      }
    ]
  },
  {
    _type: 'block',
    _key: 'p_nicole_dealer',
    style: 'normal',
    children: [
      {
        _type: 'span',
        _key: 'p_nicole_dealer_s',
        text: 'ニコル・グループ各ショールーム（川崎本社・大田支店・新百合ヶ丘支店・都筑支店等）では、新型BMW iX4の日本導入に向けた最新情報の配信および先行購入相談を承っております。BMWマイスターが常駐する高電圧EV専用サービスファクトリーと、急速充電インフラを完備し、次世代モビリティライフを万全の体制でサポートいたします。'
      }
    ]
  }
];

const postContentJson = JSON.stringify(portableTextContent);

// Clean previous entries if any
db.prepare('DELETE FROM ec_posts WHERE id = ? OR slug = ?').run(postId, postSlug);
db.prepare('DELETE FROM _emdash_fts_posts WHERE id = ?').run(postId);
db.prepare('DELETE FROM content_taxonomies WHERE entry_id = ?').run(postId);

// Insert into ec_posts
const insertPostStmt = db.prepare(`
  INSERT INTO ec_posts (
    id, slug, status, author_id, primary_byline_id, created_at, updated_at, published_at,
    version, locale, translation_group, title, featured_image, content, excerpt, related_location
  ) VALUES (
    ?, ?, 'published', NULL, '01M5V4HMZD2NQACSFPGZZMFHZ6', ?, ?, ?,
    1, 'en', ?, ?, ?, ?, ?, ?
  )
`);

insertPostStmt.run(
  postId,
  postSlug,
  postPublishedAt,
  postPublishedAt,
  postPublishedAt,
  postId,
  postTitle,
  postFeaturedImage,
  postContentJson,
  postExcerpt,
  'nicole-bmw-kawasaki'
);

// Insert into FTS
db.prepare(`
  INSERT INTO _emdash_fts_posts (id, locale, title, content)
  VALUES (?, 'en', ?, ?)
`).run(
  postId,
  postTitle,
  `${postTitle} ${postExcerpt} T0461402EN BMW iX4 Neue Klasse SAC iX4 40 xDrive iX4 50 xDrive iX4 M60 xDrive Panoramic Vision 828km 800V`
);

// Insert into taxonomies: category (Development or design) and tag (nicolebmw)
const catTerm = db.prepare('SELECT id FROM taxonomies WHERE name = ? AND slug = ?').get('category', 'development')
  || db.prepare('SELECT id FROM taxonomies WHERE name = ? LIMIT 1').get('category');

if (catTerm) {
  db.prepare(`
    INSERT INTO content_taxonomies (collection, entry_id, taxonomy_id, status, locale, published_at, created_at)
    VALUES ('posts', ?, ?, 'published', 'en', ?, ?)
  `).run(postId, catTerm.id, postPublishedAt, postPublishedAt);
}

const bmwTag = db.prepare('SELECT id FROM taxonomies WHERE name = ? AND slug = ?').get('tag', 'nicolebmw');
if (bmwTag) {
  db.prepare(`
    INSERT INTO content_taxonomies (collection, entry_id, taxonomy_id, status, locale, published_at, created_at)
    VALUES ('posts', ?, ?, 'published', 'en', ?, ?)
  `).run(postId, bmwTag.id, postPublishedAt, postPublishedAt);
}

console.log('Successfully inserted BMW iX4 post into D1 database:', postId, postSlug);
