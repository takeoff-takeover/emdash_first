import fs from 'node:fs';
import { spawnSync } from 'node:child_process';

const base = 'http://localhost:4321';
const slug = '202611_ferrari-testarossa';

let n = 0;
const key = () => `ft-${++n}`;
const p = (text, style = 'normal') => ({
  _type: 'block',
  _key: key(),
  style,
  markDefs: [],
  children: [{ _type: 'span', _key: key(), text, marks: [] }]
});
const h = text => p(text, 'h2');
const h3 = text => p(text, 'h3');
const cards = items => ({
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
  items
});
const table = (rows) => ({
  _type: 'editorial-tools:table',
  _key: key(),
  title: 'フェラーリ・テスタロッサ 主要諸元・比較表',
  caption: '※数値は欧州仕様カタログ値に基づく代表値です。',
  raw_csv: rows.map(r => r.join(',')).join('\n')
});
const faq = (items) => ({
  _type: 'editorial-tools:faq',
  _key: key(),
  style: 'accordion',
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
  style: 'accent-b',
  shape: 'pill',
  has_arrow: 'true',
  target_blank: 'auto'
});

const featured_image = {
  src: '/uploads/ferrari-testarossa/testarossa-front-quarter.jpg',
  alt: 'フェラーリ・テスタロッサ フロントクォーターからの流麗な全景'
};

const data = {
  title: 'フェラーリ・テスタロッサの官能と現在地｜180度V12が奏でる咆哮と、今こそ味わうべき理由',
  excerpt: '1984年のパリ・サロンでの衝撃的なデビューから40余年。自然吸気180度V12エンジン、ピニンファリーナによるサイドストレーキ、5速ゲート式マニュアル。電子制御のないピュアな対話を愉しむ、今こそ試乗・再評価すべき理由を徹底解説。',
  featured_image,
  layout: '2col',
  content: [
    p('スーパーカーの歴史において、「テスタロッサ（Testarossa）」ほど鮮烈な記憶を刻み込んだモデルは他に存在しません。1984年のパリ・サロンでベールを脱いだ瞬間から、その革新的なフォルムと圧倒的な存在感は世界中の自動車ファンを魅了し続けました。'),
    p('ハイブリッドシステムやダウンサイジングターボ、高度な電子制御が当たり前となった現代において、なぜ今、あえてこのクラシック・フェラーリに触れ、ステアリングを握るべきなのでしょうか。その答えは、現代の車では決して得られない「人と機械の濃密な対話」にあります。'),
    
    h('30秒でわかる、今テスタロッサに乗るべき3つの理由'),
    cards([
      {
        title: '180度V12の官能的な咆哮',
        text: '自然吸気4.9L 180度V型12気筒エンジンが放つ、澄み切った高周波サウンドと澱みのないスロットルレスポンス。'
      },
      {
        title: 'ピニンファリーナの不朽の造形',
        text: 'サイドラジエーターを冷却するための大胆なサイドストレーキと、全幅1,976mmのワイド＆ローな圧倒的プロポーション。'
      },
      {
        title: '正規クラシケの安心と資産価値',
        text: 'Nicole Competizioneによる正規クラシケ認定や熟練メカニックの動態保存環境が支える、一生モノの信頼性。'
      }
    ]),

    h('唯一無二の心臓部：180度V型12気筒「テスタロッサ（赤い頭）」の系譜'),
    p('車名の「テスタロッサ」はイタリア語で「赤い頭（Testa Rossa）」を意味します。これは1950年代の伝説的レーシングカー「250テスタロッサ」に由来し、シリンダーヘッドカバーが鮮やかな赤色に塗装されていることにちなんでいます。'),
    p('ミッドシップに搭載される「Tipo F113A」エンジンは、バンク角180度のV型12気筒DOHC 48バルブ、総排気量4,942cc。最高出力390ps/6,300rpm、最大トルク490Nm/4,500rpmを誇ります。低重心化を徹底したこのレイアウトは、低回転域の豊かなトルク感と、4,000rpmを超えてからレブリミットまで突き抜けるような伸びやかな加速フィールをもたらします。'),
    
    splitMedia([
      {
        title: '真紅のヘッドカバーと精緻なメカニズム',
        text: 'リアフードを持ち上げると現れる、巨大なアルミ製インテークマニホールドと伝統の真紅に染められたシリンダーヘッド。余計なカバーで覆い隠されない剥き出しの機械美は、眺めているだけで胸が高鳴ります。',
        image: '/uploads/ferrari-testarossa/testarossa-engine-bay.jpg',
        image_alt: 'フェラーリ・テスタロッサの180度V12エンジンルーム'
      }
    ]),

    h('ピニンファリーナの美学：空力と法規が生んだサイドストレーキ'),
    p('テスタロッサを象徴する最大の特徴が、左右ドアからリアフェンダーにかけて刻まれた美しい5本のルーバー（サイドストレーキ）です。デザインを手掛けたのは名門ピニンファリーナのチーフデザイナー、レオナルド・フィオラヴァンティ率いるチームでした。'),
    p('前作512BBではフロントに配置されていたラジエーターを、テスタロッサではエンジンの両サイドへと移設。これによりフロントの荷室空間を確保するとともに、キャビン内の熱気配管を排除して居住性を飛躍的に向上させました。当時の各国の法規（大型開口部への異物侵入防止）を満たしつつ、効率的な吸気冷却とダウンフォースを両立させたデザイン的回答が、このサイドフィンだったのです。'),

    splitMedia([
      {
        title: '全幅1,976mmのワイド＆ロープロポーション',
        text: 'フロントフェンダーからリアエンドに向かって大胆に広がるウェッジシェイプ。リトラクタブルヘッドライトを格納した低いノーズと、リアグリルいっぱいに広がる水平スリットが織りなす造形美は、どの角度から見ても完璧な調和を保っています。',
        image: '/uploads/ferrari-testarossa/testarossa-side-profile.jpg',
        image_alt: 'サイドストレーキとワイドなリアフェンダーが際立つテスタロッサのサイドプロポーション'
      }
    ]),

    h('現代車では決して味わえない「人と機械の濃厚な対話」'),
    p('ドアを開けて低いコックピットに滑り込むと、そこには華美な液晶ディスプレイやステアリングスイッチは一切ありません。ドライバーの視界に入るのは、視認性に優れたオレンジ色の指針を持つアナログメーターと、贅沢なコノリーレザー、そしてセンターコンソールに鎮座するクローム仕上げのシフトゲートです。'),
    p('アシストのない重厚なステアリングを握り、左足でしっかりとした手応えのクラッチペダルを踏み込む。1速が左手前に配置された「ドッグレッグパターン」のシフトレバーを操作すると、「カチリ」と金属同士が精密に噛み合う心地よい感触が掌に伝わります。スロットル開度と自らの神経が直結したような純粋なコントロール感は、電子制御デバイスで守られた最新のスーパースポーツでは二度と味わえない貴重な体験です。'),

    splitMedia([
      {
        title: 'オープンゲートが生み出す至高のシフトフィール',
        text: 'アルミ削り出しのオープンゲートと磨かれたシフトノブ。1速から2速、3速へとシフトアップするたびに響く澄んだ金属音は、ドライバーと車が一体になる儀式そのものです。',
        image: '/uploads/ferrari-testarossa/testarossa-cockpit.jpg',
        image_alt: 'フェラーリ・テスタロッサのコクピットと伝統のシフトゲート'
      }
    ]),

    h('主要諸元・スペック比較'),
    p('テスタロッサの基本スペックを、後継モデルである512 TRと比較して整理しました。'),
    table([
      ['項目', 'テスタロッサ（前期型）', '512 TR（発展型）'],
      ['エンジン型式', 'Tipo F113A（180度V12 DOHC 48V）', 'Tipo F113D（180度V12 DOHC 48V）'],
      ['総排気量', '4942 cc', '4943 cc'],
      ['最高出力', '390 ps / 6300 rpm', '428 ps / 6750 rpm'],
      ['最大トルク', '490 Nm / 4500 rpm', '491 Nm / 5500 rpm'],
      ['トランスミッション', '5速マニュアル（ドッグレッグ）', '5速マニュアル'],
      ['全長×全幅×全高', '4485 × 1976 × 1130 mm', '4480 × 1976 × 1135 mm'],
      ['車両乾燥重量', '約1506 kg', '約1473 kg'],
      ['0-100km/h加速', '5.8 秒', '4.8 秒'],
      ['最高速度', '290 km/h', '314 km/h']
    ]),

    h('名車テスタロッサとの付き合い方：Nicole Competizioneによる安心の維持管理'),
    p('製造から40年近くが経過したクラシック・フェラーリを所有・試乗するにあたり、最も重要なのは「確かな整備履歴」と「正規ディーラーの技術力」です。'),
    p('Nicoleグループの「Nicole Competizione（ニコル・コンペティツィオーネ）」は、フェラーリ正規ディーラーとして、新車・認定中古車の取り扱いはもちろん、歴代名車の価値を後世に継承する「Ferrari Classiche（フェラーリ・クラシケ）」の認定取得や高度なレストア・動態保存をサポートしています。'),
    p('定期的なエンジン降ろしを伴うタイミングベルト交換、Kジェトロニック燃料噴射システムの精密調律、水回り・ゴム類の予防整備など、熟練の専任テクニシャンが純正パーツを用いて最高水準のコンディションを保ちます。'),

    cta(
      'フェラーリ認定中古車・試乗・クラシケのご相談はこちら',
      '/corporate/nicole-competizione',
      'Nicole Competizione（フェラーリ正規ディーラー）',
      '※フェラーリ・クラシケ認定取得や専任メカニックによる動態保存のご相談も承ります。'
    ),

    h('フェラーリ・テスタロッサに関するよくある質問（FAQ）'),
    faq([
      [
        '前期型・中期型・後期型の主な違いは何ですか？',
        '最も分かりやすい識別点はバックミラーとホイールです。1984年〜1986年の最初期型は運転席側のAピラー中間部だけに付く「モノスペッキオ（一本ミラー）」とセンターロック式「モノダード（センターロックホイール）」を採用しています。1987年以降は左右のAピラー付け根にツインミラーが配置され、1988年半ばからは一般的な5穴ボルトホイールに変更されました。'
      ],
      [
        '日常ユースや長距離ドライブでの快適性はどうですか？',
        'テスタロッサは純粋なスパルタンレーサーではなく、大陸を快適に横断する「グランツーリスモ」としての性格も強く持っています。ラジエーターのサイド移設によりフロントには実用的なトランクスペースがあり、エアコンやパワーウィンドウも装備されています。高速道路での直進安定性は現代でも極めて高く、ロングツーリングも快適にこなせます。'
      ],
      [
        '購入や試乗を検討する際、どこを確認すべきですか？',
        'タイミングベルトの交換履歴（通常3〜5年または規定走行距離ごと）、水回りホース類・クーリングファンの作動状況、エアコンのコンディション、そしてNicole Competizione等の正規ディーラーまたは専門店での継続的な点検整備記録簿の有無を必ずご確認ください。'
      ]
    ]),

    notes('※諸元数値は当時の欧州仕様カタログに基づく参考値です。\n※掲載写真は報道・編集用途およびクリエイティブ・コモンズ（Wikimedia Commons: Calreyn88, Mr.choppers, nakhon100, Luc106）に基づき適切にクレジット管理されたものを使用しています。\n※車両の在庫状況や試乗・メンテナンスのご相談は、正規ディーラー「Nicole Competizione」までお気軽にお問い合わせください。')
  ]
};

fs.writeFileSync('seed/article-ferrari-testarossa.json', JSON.stringify(data, null, 2) + '\n');
console.log('Saved payload to seed/article-ferrari-testarossa.json');

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
  cli('content', 'update', 'magazine', prior.id, '--file', 'seed/article-ferrari-testarossa.json', `--rev=${current._rev}`);
  id = prior.id;
  console.log('Updated existing entry with revised blocks:', id);
} else {
  const created = cli('content', 'create', 'magazine', '--file', 'seed/article-ferrari-testarossa.json', '--slug', slug);
  id = created.id || created.item?.id;
  console.log('Created entry:', id);
}
if (!id) throw Error('Missing created/updated entry ID');

// Now assign taxonomies via API
const auth = await fetch(`${base}/_emdash/api/auth/dev-bypass`);
if (!auth.ok) throw Error('Local dev authentication failed');
const cookie = auth.headers.getSetCookie().map(c => c.split(';')[0]).join('; ');

for (const [taxonomy, term] of [['brand', 'term_brand_ferrari'], ['category', 'term_mag_cars']]) {
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

// Publish the article via API
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

console.log(JSON.stringify({ id, slug, url: `${base}/magazine/${slug}/` }));
