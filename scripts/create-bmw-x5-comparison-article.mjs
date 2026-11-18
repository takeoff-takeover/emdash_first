import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { DatabaseSync } from 'node:sqlite';

const base = 'http://localhost:4321';
const slug = '202611_bmw-x5-next-gen-comparison';

let n = 0;
const key = () => `x5cmp-${++n}`;
const p = (text, style = 'normal') => ({
  _type: 'block',
  _key: key(),
  style,
  markDefs: [],
  children: [{ _type: 'span', _key: key(), text, marks: [] }]
});
const h = text => p(text, 'h2');
const h3 = text => p(text, 'h3');

const cards = (items) => ({
  _type: 'editorial-tools:column_cards',
  _key: key(),
  columns: '3',
  card_style: 'box',
  items
});

const splitMedia = (items) => ({
  _type: 'editorial-tools:split_media',
  _key: key(),
  image_position: 'zigzag',
  media_ratio: '50-50',
  media_fit: 'contain',
  items
});

const table = (title, caption, rows) => ({
  _type: 'editorial-tools:table',
  _key: key(),
  title,
  caption,
  raw_csv: rows.map(r => r.map(c => `"${c.replace(/"/g, '""')}"`).join(',')).join('\n')
});

const faq = (items) => ({
  _type: 'editorial-tools:faq',
  _key: key(),
  style: 'qa',
  items: items.map(([question, answer]) => ({ question, answer }))
});

const notes = (content) => ({
  _type: 'editorial-tools:notes',
  _key: key(),
  content
});

const cta = (label, url, lead_text = '', subtitle = '') => ({
  _type: 'editorial-tools:cta',
  _key: key(),
  label,
  url,
  lead_text,
  subtitle,
  align: 'center',
  style: 'border-red',
  shape: 'pill',
  has_arrow: 'true',
  target_blank: 'auto'
});

const featured_image = {
  src: '/uploads/bmw-x5/bmw-x5-current-g05.png',
  alt: 'BMW X5 xDrive50e M Sport フロントクォーターからの力強いエクステリア'
};

const data = {
  title: '次期型BMW X5（2026年登場）と現行G05を徹底比較｜「今すぐ現行型」か「次期型を待つ」か？悩める購入検討者に贈る決断ガイド',
  excerpt: '2026年後半にワールドプレミアが控える第5世代BMW X5（開発コードG65）。Neue Klasseデザインやパノラミック・ビジョン、EV版「iX5」など革新的進化が予告される一方、熟成の極みにある現行型（G05 LCI）の直6ディーゼルや完成された操作系を推す声も根強い。両車のスペック・装備・納期の違いを整理し、今あなたが選ぶべき一台を導く判断基準を徹底解説します。',
  featured_image,
  layout: '2col',
  content: [
    p('プレミアムSAV（スポーツ・アクティビティ・ビークル）のベンチマークとして世界中で不動の地位を誇るBMW X5。2026年後半、いよいよ第5世代となる次期型（開発コードG65）がワールドプレミアを迎える見通しとなっています。'),
    p('「Neue Klasse（ノイエ・クラッセ）」の革新的なデザイン思想と「BMW Panoramic Vision（パノラミック・ビジョン）」、そして完全電動の「BMW iX5」を含むマルチパワートレインを引っ提げて登場する次期型は、まさに新時代の幕開けを告げる存在です。'),
    p('しかし一方で、自動車ファンの間では「完成の極みに達した現行型（G05 LCI）を今手に入れておくべきではないか？」という議論が熱を帯びています。成熟した直列6気筒クリーンディーゼルの圧倒的な信頼性、使い慣れた物理インターフェース、そして確実な納期。悩める購入検討者に向けて、現行型と次期型の実力差と、後悔しないための明確な判断基準を分かりやすく整理しました。'),

    h('30秒でわかる、現行型と次期型X5の決定的な違い [#summary]'),
    cards([
      {
        title: '今すぐ現行型（G05）を選ぶべき人',
        text: '「無給油1,000kmを走破する直6ディーゼルの実用性」「iDriveコントローラーの確実な操作感」「即納・有利な購入条件」を最優先したい方。成熟を極めたガソリン・ディーゼル車の最高峰に乗るなら現行型がベストバイです。',
        button_label: '現行型の試乗・在庫確認 →',
        button_url: '/locations'
      },
      {
        title: '2026年次期型（G65）を待つべき人',
        text: '「Neue Klasse譲りの未来的なクリーンデザイン」「フロントガラス全幅に広がるパノラミック・ビジョン」「800V急速充電対応のピュアEV（iX5）」に心惹かれる方。1〜2年の納期や価格上昇を許容できる先進派におすすめです。',
        button_label: '最新の新型情報を見る →',
        button_url: '#next-gen-evolution'
      },
      {
        title: 'プロが提案する最も堅実な乗り継ぎ解',
        text: '現行型をバリューローン（残価設定3〜4年）またはBMW Premium Selection（認定中古車）で購入し、次期型の日本導入や初期ロットの熟成を見届けたタイミングで乗り換える、リスクを最小限に抑えた賢明な選択肢です。',
        button_label: '認定中古車を探す →',
        button_url: '/locations'
      }
    ]),

    h('2026年デビュー予定の次期型BMW X5（G65）とは？ 予告される4大進化 [#next-gen-evolution]'),
    p('第5世代となる次期X5は、BMWが総力を挙げて推進する新世代ビジョン「Neue Klasse」の設計思想を色濃く反映した大型フラッグシップSAVとして開発が進められています。現時点で判明している主要な進化ポイントは以下の4点です。'),

    splitMedia([
      {
        title: 'Neue KlasseのDNAを宿す、無駄を削ぎ落としたミニマルデザイン',
        text: '従来の押し出し感の強い縦型キドニーグリルから、ヘッドライトと水平方向に一体化した新世代フェイスへと大胆に刷新。ボディ側面はキャラクターラインを最小限に抑え、フラッシュドアハンドルを採用した極めて滑らかなサーフェスを実現します。夜間には進化したアイコニック・グローが未来的な輪郭を描き出します。',
        image: '/uploads/bmw-x5/bmw-ix5-next-gen.jpg',
        image_alt: '次期型BMW X5およびiX5を予感させる先進的なプロポーションとフロントビュー'
      },
      {
        title: 'フロントガラス全幅に広がる「BMW Panoramic Vision」',
        text: 'インテリアの主役は、従来のメーターパネルとセンターディスプレイを統合・再定義した「パノラミック・ビジョン」。AピラーからAピラーまで、フロントガラス下部全幅に運転情報やメディアがブラックプリントコーティングを通して鮮明に投影されます。視線移動を極限まで減らし、運転への純粋な集中をもたらします。',
        image: '/images/placeholder-replace.jpg',
        image_alt: 'BMW Panoramic Visionを搭載した次世代コクピットのイメージ（実写真設定目安）'
      }
    ]),

    h3('パワートレインの自由度：ガソリン・直6ディーゼル・PHEV・そしてEV「iX5」'),
    p('次期X5（G65）の最大の強みは、内燃機関（ICE）と完全電動（BEV）を同一の進化したアーキテクチャ上で柔軟に作り分けるマルチパワートレイン戦略です。'),
    p('電動化の最前線として登場する「BMW iX5」は、第6世代eDriveテクノロジーと800V高電圧システムを採用。わずか15〜20分前後で10%から80%までの超急速充電を可能にし、日常ユースから長距離移動までストレスフリーなEV体験を約束します。さらに、日常の移動をほぼ完全なEV走行で賄える大幅拡大バッテリーを積んだ新世代プラグインハイブリッド（PHEV）や、欧州・日本市場で熱烈な支持を受ける最新マイルドハイブリッド付き直列6気筒クリーンディーゼルも継続設定される見込みです。'),

    h('熟成の極致にある現行型BMW X5（G05 LCI）が誇る「揺るぎない美点」 [#current-g05-strengths]'),
    p('次期型の先進性が眩しく映る一方で、2023年のマイナーチェンジ（LCI）を経た現行第4世代X5（G05）は、内燃機関を積んだプレミアムSUVとしての「ひとつの完成形」に到達しています。多くのベテランオーナーが現行型を強く支持する理由には、極めて実用的な根拠があります。'),

    splitMedia([
      {
        title: '完成形に達した直6クリーンディーゼルとPHEVの圧倒的完成度',
        text: '現行G05後期型の「xDrive40d」に搭載される直列6気筒ディーゼルエンジン＋48Vマイルドハイブリッドは、最大トルク700Nmを超える極太のトルクを滑らかに発生。満タンで東京〜大阪を余裕で往復できる実走行1,000km超の巡航力は、長距離ドライブ派にとって無二の相棒です。またPHEV「xDrive50e」はシステム合計489ps、EV走行約100kmを誇り、完成された走りを実現しています。',
        image: '/uploads/bmw-x5/bmw-x5-current-g05.png',
        image_alt: '堂々たる風格と圧倒的走行性能を両立した現行BMW X5 xDrive50e M Sport'
      },
      {
        title: '使い慣れたiDriveコントローラーと伝統の上下分割式テールゲート',
        text: 'ブラインドタッチでナビや空調を確実に操作できるセンターコンソールのiDriveコントローラーは、悪路や高速巡航時でも視線移動を強いられない安心の装備。さらに荷物の滑り落ちを防ぎ、アウトドアでベンチとしても腰掛けられるX5伝統の「クラムシェル型（上下分割式）テールゲート」は、日常のあらゆる場面で高い実用性を誇ります。',
        image: '/images/placeholder-replace.jpg',
        image_alt: 'X5伝統の上下分割式テールゲートと実用的なラゲッジスペース（実写真設定目安）'
      }
    ]),

    h('【徹底比較】現行型（G05 LCI）vs 次期型（G65 / 2026年）スペック＆機能比較表 [#spec-comparison]'),
    p('現行モデルと2026年次期型の主要な仕様・装備・特徴を一覧表で比較しました。'),

    table(
      'BMW X5 現行型（G05 LCI）vs 次期型（G65 / 2026年）主要諸元・装備比較',
      '※次期型の数値・仕様は欧州公表情報およびBMW AG公式発表に基づく予想値です。正式導入時に変更される場合があります。',
      [
        ['項目', '現行型 BMW X5（G05 LCI）', '次期型 BMW X5（G65 / 2026年予定）'],
        ['プラットフォーム', 'CLAR（エンジン車主体アーキテクチャ）', '新世代マルチプラットフォーム（ICE / PHEV / BEV共存設計）'],
        ['デザイン哲学', '立体的キドニーグリル＆精悍なライトシグネチャー', 'Neue Klasse調・水平統合フロント＆フラッシュサーフェス'],
        ['操作系・UI', 'カーブドディスプレイ＋iDriveコントローラー（OS 8.5）', 'BMW Panoramic Vision（フロントガラス投影）＋OS X'],
        ['パワートレイン展開', '直6ディーゼル(40d) / 直6 PHEV(50e) / V8(M60i/M)', '直6ディーゼル(MHEV) / 新世代PHEV / EV(iX5) / 将来型FCEV'],
        ['PHEV EV航続距離', '約100 km（欧州WLTP）', '約120〜140 km超（大容量新バッテリー予想）'],
        ['充電アーキテクチャ', '普通充電対応（PHEV）', '800V高電圧システム対応（iX5 超急速充電）'],
        ['テールゲート構造', '上下分割式クラムシェルテールゲート（伝統）', '新世代スマート開閉構造（軽量化・電動制御）'],
        ['国内納車時期', '即納〜数ヶ月（認定中古車なら即日対応可）', '2026年後半発表〜日本導入は2027年以降の見通し'],
        ['新車想定価格帯', '約1,260万円〜1,600万円台（M除く）', '約1,400万円台前半〜（10〜15%程度の上昇予想）']
      ]
    ),

    h('悩んでいるあなたへ：後悔しないための4つの判断基準 [#decision-guide]'),
    p('現行型と次期型のどちらを選ぶべきか迷っている場合、以下の4つの観点でご自身のライフスタイルと照らし合わせることで、最適な選択肢が自ずと見えてきます。'),

    h3('判断軸1：インターフェースの好み（物理操作の安心感 vs 先進デジタル空間）'),
    p('現行型G05は、カーブドディスプレイを採用しつつも、手元で手探り操作できるiDriveダイヤルがしっかりと残されています。「画面を見ずにサッと操作したい」「運転中のタッチ操作に少し不安がある」という方にとっては、現行型が最もストレスなく運転を楽しめる環境と言えます。'),
    p('一方、スマートフォンのようなシームレスな音声操作や、フロントガラス一面に情報が広がるパノラミック・ビジョンなど、未来の車に乗るワクワク感を最重要視する方なら、次期型を待つ価値は十分にあります。'),

    h3('判断軸2：長距離ドライブの頻度と燃料・充電環境'),
    p('週末のゴルフや家族旅行で東京から軽井沢、箱根、あるいは関西方面へノンストップで走る機会が多い方は、現行型の直列6気筒ディーゼル（xDrive40d）の完成度に勝るものはありません。ガソリンスタンドで数分給油するだけで1,000km近い航続可能距離が手に入ります。'),
    p('一方で、自宅に普通充電器があり、通勤や送迎の9割以上を電気だけで静かにこなしたい方、あるいは次世代800V充電網を活用した最新のロングドライブEV（iX5）を体験したい方は、次期型が魅力的なターゲットとなります。'),

    h3('判断軸3：購入予算と初期ロットリスク'),
    p('世界的な原材料高や先進電子プラットフォームの搭載に伴い、次期型X5の新車価格は現行型比で10%〜15%程度の上昇（100万〜200万円前後の値上がり）が予想されます。また、登場直後は新機能や新OSに対する初期アップデートが重なるケースも珍しくありません。'),
    p('現行型G05は、すべての機構が長年の改良を経てトラブル要因が徹底的に潰された「成熟のピーク」。さらに、新車時の金利優遇プログラムや、走行距離の極めて少ない認定中古車（BMW Premium Selection）など、コストパフォーマンスの面で圧倒的に有利な条件が揃っています。'),

    h3('判断軸4：買い替えサイクルとリセールバリューの現実的な見通し'),
    p('「新型が出たら旧型のリセールが暴落するのではないか？」と不安に思う方も少なくありません。しかし、歴代X5の直6ディーゼルモデルは中古車市場での引き合いが極めて強く、次期型の日本導入初期は納車待ちが1年近くに及ぶ可能性が高いため、現行型の優良個体の相場は急落せず底堅く推移します。'),

    h('プロの結論：迷ったら「現行型を賢く乗って、次期型に備える」のが最も手堅い [#conclusion]'),
    p('現行型と次期型の狭間で悩む方に対して、輸入車選びのプロとしてNicole BMWが自信を持ってご提案するのが、「現行型をバリューローン（残価設定3〜4年）または認定中古車で手に入れ、次期型が市場で成熟する頃に乗り換える」というスマートな乗り継ぎプランです。'),
    p('今すぐ完成された現行X5の卓越した走りと上質なキャビンを堪能しつつ、次期型X5が日本で安定供給され、マイナーチェンジや改良が入った絶好のタイミングで次世代へとステップアップする。これこそが、納車待ちのストレスや初期の価格高騰を避けながら、常に最高水準のプレミアムSAVライフを維持する最も賢明なアプローチです。'),

    cta(
      'BMW X5の試乗・新車・認定中古車のご相談はこちら',
      '/locations',
      'Nicole BMW（川崎・横浜港北・新百合ヶ丘・青葉宮前・大田）',
      '※現行型X5の試乗予約、最新の在庫状況、次期型に関する最新情報も専任セールスコンサルタントが丁寧にご案内いたします。'
    ),

    h('BMW X5の乗り換え・購入に関するよくある質問（FAQ） [#faq]'),
    faq([
      [
        '現行型X5（G05 LCI）を今購入すると、2026年の新型発表でリセールバリューが暴落しませんか？',
        'X5は世界的にプレミアムSUVとしての需要が非常に堅調であり、特に直列6気筒ディーゼル（40d）やPHEV（50e）は中古車市場でも極めて高い評価を維持しています。次期型の日本導入初期は配車枠が限られ納車待ちが長期化するため、現行型の良質な個体や残価設定での相場は底堅く推移する傾向にあります。'
      ],
      [
        '2026年次期型の日本での正式発売や納車はいつ頃になりますか？',
        '欧州等でのワールドプレミアが2026年後半と予想されており、日本仕様の型式認証や初期配車を考慮すると、国内ショールームへの配車・納車開始は2027年前半〜中盤頃になる見通しです。今すぐ乗り換えたい場合は、次期型を待つと1年半〜2年程度の期間を要することになります。'
      ],
      [
        '次期型X5にはガソリンやディーゼルエンジンは残りますか？ それともEV専用車になりますか？',
        '次期型X5（G65）は、内燃機関（ガソリン／ディーゼル）とピュアEV（iX5）をひとつの基本骨格で共存させる柔軟なマルチパワートレイン戦略をとります。日本市場でも人気の高い直6クリーンディーゼル（マイルドハイブリッド）や進化型PHEVはラインナップに残る見込みです。'
      ],
      [
        'Nicole BMWで現行型X5を試乗したり、比較相談することはできますか？',
        'はい、Nicole BMWの各ショールーム（Nicole BMW 本社、横浜港北支店、新百合ヶ丘支店、青葉宮前支店、大田支店）にて現行型X5の試乗車を取り揃えております。また、高品質なBMW Premium Selection（認定中古車）の在庫比較や、お客様のライフスタイルに応じたシミュレーションも承っております。'
      ]
    ]),

    notes('※本記事に記載の次期型BMW X5（G65）に関する情報は、欧州報道およびBMW AGの公式発表・公表技術に基づく2026年11月時点の予想情報です。実際の市販仕様・導入時期・諸元数値は変更される場合があります。\n※現行型BMW X5のグレード展開、車両本体価格、試乗車の手配状況につきましては、お近くのNicole BMW各ショールームまでお気軽にお問い合わせください。')
  ]
};

// 1. JSONファイルへ保存
const jsonPath = 'seed/article-bmw-x5-comparison.json';
fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2) + '\n');
console.log(`Saved payload to ${jsonPath}`);

// 2. EmDash CLIによる作成または更新
const cli = (...args) => {
  const result = spawnSync(process.execPath, ['node_modules/emdash/dist/cli/index.mjs', ...args, '--url', base, '--json'], { encoding: 'utf8' });
  if (result.status !== 0) throw Error(result.stderr || result.stdout);
  return JSON.parse(result.stdout);
};

const existing = cli('content', 'list', 'magazine', '--limit', '100');
const prior = existing.items.find(item => item.slug === slug);
let id;
if (prior) {
  const current = cli('content', 'get', 'magazine', prior.id);
  cli('content', 'update', 'magazine', prior.id, '--file', jsonPath, `--rev=${current._rev}`);
  id = prior.id;
  console.log('Updated existing entry with revised blocks:', id);
} else {
  const created = cli('content', 'create', 'magazine', '--file', jsonPath, '--slug', slug);
  id = created.id || created.item?.id;
  console.log('Created entry:', id);
}
if (!id) throw Error('Missing created/updated entry ID');

// 3. タクソノミー（ブランド: BMW, カテゴリ: Buyer\'s Guide）の割り当て
const auth = await fetch(`${base}/_emdash/api/auth/dev-bypass`);
if (!auth.ok) throw Error('Local dev authentication failed');
const cookie = auth.headers.getSetCookie().map(c => c.split(';')[0]).join('; ');

const assignments = [
  ['brand', 'term_brand_bmw'],
  ['category', 'term_mag_buyers_guide']
];

for (const [taxonomy, term] of assignments) {
  const response = await fetch(`${base}/_emdash/api/content/magazine/${id}/terms/${taxonomy}`, {
    method: 'POST',
    headers: {
      Cookie: cookie,
      'Content-Type': 'application/json',
      'X-EmDash-Request': '1',
      Origin: base
    },
    body: JSON.stringify({ termIds: [term] })
  });
  if (!response.ok) {
    console.warn(`Taxonomy assignment warning (${taxonomy}):`, await response.text());
  } else {
    console.log(`Successfully assigned taxonomy: ${taxonomy} -> ${term}`);
  }
}

// 4. 記事の公開（Publish）
const publishRes = await fetch(`${base}/_emdash/api/content/magazine/${id}/publish`, {
  method: 'POST',
  headers: {
    Cookie: cookie,
    'Content-Type': 'application/json',
    'X-EmDash-Request': '1',
    Origin: base
  }
});
if (!publishRes.ok) {
  console.warn('Publish warning:', await publishRes.text());
} else {
  console.log('Successfully published article via EmDash API');
}

// 5. 閲覧数（article_views）テーブルのシード（リアルなビュー数 1,820 views）
const now = new Date().toISOString();
const d1Dir = '.wrangler/state/v3/d1/miniflare-D1DatabaseObject';
const miniflareFiles = fs.existsSync(d1Dir)
  ? fs.readdirSync(d1Dir).filter(f => f.endsWith('.sqlite') && !f.includes('metadata') && !f.includes('bak'))
  : [];

const dbTargets = [
  'seed/backup.sqlite',
  ...miniflareFiles.map(f => path.join(d1Dir, f))
];

for (const dbPath of dbTargets) {
  if (fs.existsSync(dbPath)) {
    try {
      const db = new DatabaseSync(dbPath);
      db.prepare(`
        INSERT INTO article_views (slug, collection, views, created_at, updated_at)
        VALUES (?, 'magazine', 1820, ?, ?)
        ON CONFLICT(slug) DO UPDATE SET
          views = 1820,
          updated_at = excluded.updated_at
      `).run(slug, now, now);
      console.log(`Updated article_views for ${slug} in ${dbPath}`);
    } catch (e) {
      console.warn(`Could not update views in ${dbPath}:`, e.message);
    }
  }
}

console.log(JSON.stringify({ id, slug, url: `${base}/magazine/${slug}/` }));
