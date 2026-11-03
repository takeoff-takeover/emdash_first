import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { execFileSync } from 'node:child_process';

const isRemote = process.argv.includes('--remote');
const LOCAL_DB = path.join('.wrangler', 'state', 'v3', 'd1', 'miniflare-D1DatabaseObject',
  'c5f74f54de1b54dfe248af0cae042e755774e9e90fc1e7dc6e84e3d6d7130474.sqlite');

const esc = (v) => (v == null ? 'NULL' : `'${String(v).replace(/'/g, "''")}'`);

// マガジンと同じエディタ中心の並び順（タイトル → アイキャッチ写真 → 本文 → 抜粋 → 補助設定）
const fields = [
  { id: '01M5WCAMPFLD00000000000001', slug: 'title', label: 'タイトル', type: 'string', required: 1, sort_order: 0 },
  { id: '01M5WCAMPFLD00000000000002', slug: 'featured_image', label: 'アイキャッチ写真 (PC用)', type: 'image', sort_order: 1 },
  { id: '01M5WCAMPFLD00000000000003', slug: 'featured_image_sp', label: 'アイキャッチ写真 (スマホ用)', type: 'image', sort_order: 2 },
  { id: '01M5WCAMPFLD00000000000004', slug: 'content', label: '本文', type: 'portableText', sort_order: 3 },
  { id: '01M5WCAMPFLD00000000000005', slug: 'excerpt', label: '抜粋 / リード文', type: 'text', sort_order: 4 },
  { id: '01M5WCAMPFLD00000000000006', slug: 'period_text', label: '開催期間表記 (例: 2026年11月1日(日) 〜 11月30日(月))', type: 'string', sort_order: 5 },
  { id: '01M5WCAMPFLD00000000000007', slug: 'target_locations', label: '対象拠点 (例: Nicole MINI 全拠点 / Nicole BMW 全支店)', type: 'string', sort_order: 6 },
  { id: '01M5WCAMPFLD00000000000008', slug: 'category', label: 'キャンペーン種別', type: 'select', required: 1, sort_order: 7, options: JSON.stringify([
    { label: '新車フェア・試乗会', value: '新車' },
    { label: '認定中古車特選フェア', value: '認定中古車' },
    { label: 'サービス・点検・車検キャンペーン', value: 'サービス' },
    { label: 'イベント・オーナーズ企画', value: 'イベント' }
  ])},
  { id: '01M5WCAMPFLD00000000000009', slug: 'cta_label', label: '予約・申込ボタン表記 (例: フェアの試乗・来場を予約する)', type: 'string', sort_order: 8 },
  { id: '01M5WCAMPFLD00000000000010', slug: 'cta_url', label: '予約・申込ボタン遷移先URL', type: 'string', sort_order: 9 },
];

// キャンペーンの標準Portable Textブロック構成（見出し・リード文は通常エディタ、レイアウトは最小限の統合ブロックで表現）
const defaultCampaignPortableText = [
  {
    _type: 'block',
    _key: 'blk_h2_benefits',
    style: 'h2',
    children: [{ _type: 'span', _key: 'sp_h2_b', text: '期間限定の特別プログラム ＆ ご成約特典' }],
  },
  {
    _type: 'column_cards',
    _key: 'blk_benefits_cards',
    columns: 'auto',
    card_style: 'box',
    items: [
      {
        image: '',
        title: '特別低金利プログラム',
        text: '対象モデルに期間限定の特別優遇金利を適用。頭金サポートや据置額設定など、お客様に最適なファイナンシャル・プランをご提案いたします。',
        button_label: '',
        button_url: '',
      },
      {
        image: '',
        title: 'ご来場・ご試乗記念品',
        text: '期間中にWeb事前予約の上、ショールームにご来場・ご試乗いただいたお客様へ、Nicole Group限定オリジナルギフトを進呈いたします。',
        button_label: '',
        button_url: '',
      },
      {
        image: '',
        title: '下取り査定特別優遇',
        text: '現在お乗りの愛車をメーカー・車種問わず高価下取り査定。正規ディーラーならではの安心と透明性をもってお応えいたします。',
        button_label: '',
        button_url: '',
      },
    ],
  },
  {
    _type: 'split_media',
    _key: 'blk_split_zigzag',
    image_position: 'zigzag',
    media_ratio: '50-50',
    items: [
      {
        image: '/uploads/2026/04/mini2P90618119_highRes_sir-paul-smith-und-d-1-scaled-e1779256599764.jpg',
        title: '最新ラインナップを揃えたプライベート試乗',
        text: 'Nicole Group各ショールームでは、厳選された最新モデルの試乗車を常時ご用意。市街地から高速走行まで、実車ならではの走行フィールや先進運転支援システムを専任コンサルタントのエスコートのもと存分にご体感いただけます。',
        button_label: '試乗モデルについて相談する →',
        button_url: '#cmp-booking',
      },
      {
        image: '/uploads/2026/02/24_0206_nicol_kohoku_34664_re_re-e1773743709911-1.jpg',
        title: 'マイスターが支える最高峰の安心と整備品質',
        text: 'ドイツ本国の厳しいトレーニングと認定を受けた熟練メカニックが常駐。最新鋭の専用診断テスターと専用特殊工具を駆使し、お乗りいただくすべての瞬間に揺るぎない歓びと安心をお約束いたします。',
        button_label: 'サービス拠点ネットワークを見る →',
        button_url: '/locations',
      },
    ],
  },
  {
    _type: 'bg_band_start',
    _key: 'blk_band_dark_start',
    color: '#121215',
    end_color: '#1c1d24',
    gradient_type: 'diagonal',
    text_color: 'auto',
  },
  {
    _type: 'block',
    _key: 'blk_h2_features',
    style: 'h2',
    children: [{ _type: 'span', _key: 'sp_h2_f', text: '新世代モデルを彩る 3つの革新フィーチャー' }],
  },
  {
    _type: 'block',
    _key: 'blk_p_features_lead',
    style: 'normal',
    children: [{ _type: 'span', _key: 'sp_p_fl', text: '洗練されたデザインと妥協なき走行性能を両立した、注目のハイライトをご紹介します。' }],
  },
  {
    _type: 'column_cards',
    _key: 'blk_features_3col',
    columns: 'auto',
    card_style: 'box',
    items: [
      {
        image: '/uploads/ix4/int-01.jpg',
        title: '業界初 直径240mm 円形OLEDセンター・ディスプレイ',
        text: '極薄ベゼルと高精細有機ELを採用。ナビゲーション、エンターテインメント、車両設定のすべてを直感的に操作できる未来のコックピット。',
        button_label: '',
        button_url: '',
      },
      {
        image: '/uploads/2026/09/169KV_color_1er-e1789542842388.jpg',
        title: '俊敏さを極めた 進化系ゴーカート・フィーリング',
        text: '低重心設計と高剛性シャシーがもたらす極上の回頭性。意のままにコーナーを駆けぬける純粋なドライビングの歓びを日常に。',
        button_label: '',
        button_url: '',
      },
      {
        image: '/uploads/2026/02/MINI-港北.jpg',
        title: '上質と環境を調和させる 新開発リサイクル・テキスタイル',
        text: '高品質リサイクルポリエステルを用いた温かみのあるダッシュボード編み込み素材。サステナブルでありながら圧倒的なプレミアム感を演出。',
        button_label: '',
        button_url: '',
      },
    ],
  },
  {
    _type: 'bg_band_end',
    _key: 'blk_band_dark_end',
    marker: 'end',
  },
  {
    _type: 'bg_band_start',
    _key: 'blk_band_light_start',
    color: '#f4f4f6',
    end_color: '#e8e8ee',
    gradient_type: 'vertical',
    text_color: 'auto',
  },
  {
    _type: 'block',
    _key: 'blk_h2_editions',
    style: 'h2',
    children: [{ _type: 'span', _key: 'sp_h2_e', text: '選べる2つの特別エディション ＆ パッケージ' }],
  },
  {
    _type: 'block',
    _key: 'blk_p_editions_lead',
    style: 'normal',
    children: [{ _type: 'span', _key: 'sp_p_el', text: 'ライフスタイルに合わせて選べる2つの魅力的な仕様をご用意いたしました。' }],
  },
  {
    _type: 'column_cards',
    _key: 'blk_editions_2col',
    columns: 'auto',
    card_style: 'box',
    items: [
      {
        image: '/uploads/2026/06/1P90515769_highRes_mini-crossover-highl-scaled.jpg',
        title: 'クラシック・パッケージ（都会派エレガンス）',
        text: '洗練されたシルバーのコントラストルーフと専用17インチアロイホイールを装備。シンプルながら品格の漂う都会的なエッセンスを凝縮した特別パッケージです。',
        button_label: '装備内容を問い合わせる →',
        button_url: '#cmp-booking',
      },
      {
        image: '/uploads/2026/05/P90580177_highRes_bmw-m235-xdrive-gran-scaled-e1779344456477.jpg',
        title: 'JCW スポーツ・パッケージ（ダイナミック性能）',
        text: '専用エアロダイナミクス・キット、スポーツサスペンション、パドルシフト付きJCWステアリングを標準装備。レーシングスピリットを日常で解放する最高峰の仕上がり。',
        button_label: '装備内容を問い合わせる →',
        button_url: '#cmp-booking',
      },
    ],
  },
  {
    _type: 'bg_band_end',
    _key: 'blk_band_light_end',
    marker: 'end',
  },
  {
    _type: 'block',
    _key: 'blk_h2_detail',
    style: 'h2',
    children: [{ _type: 'span', _key: 'sp_h2', text: 'キャンペーン詳細 ＆ プログラム概要' }],
  },
  {
    _type: 'block',
    _key: 'blk_p1',
    style: 'normal',
    children: [{
      _type: 'span',
      _key: 'sp_p1',
      text: 'Nicole Group各ショールームでは、皆様の日頃のご愛顧に感謝を込め、最新モデルの魅力を存分にご体感いただける特別なキャンペーンを開催いたしております。'
    }],
  },
  {
    _type: 'block',
    _key: 'blk_p2',
    style: 'normal',
    children: [{
      _type: 'span',
      _key: 'sp_p2',
      text: '卓越した走行性能と最新のデジタル・テクノロジーが融合した新世代ラインナップを豊富に取り揃え、お客様一人ひとりのライフスタイルに寄り添うご提案をお届けします。ゆったりとしたプライベート空間で、心ゆくまでご試乗・ご相談をお楽しみください。'
    }],
  },
  {
    _type: 'slider',
    _key: 'blk_slider_gallery',
    gallery_style: 'filmstrip',
    items: [
      {
        image: '/uploads/2026/08/169P90635275_highRes_mini-family-04-2026-scaled.jpg',
        caption: '開放感あふれるショールーム空間で最新ラインナップをご体感いただけます。',
      },
      {
        image: '/uploads/2026/02/Nicole-BMW-本社.jpg',
        caption: '専任セールス・コンサルタントが丁寧にご案内いたします。',
      },
      {
        image: '/uploads/2026/02/BMW_MINI_BPS_MININEXT新百合ヶ丘2025.jpg',
        caption: '認定中古車から最新EVまで幅広いモデルを展示しております。',
      },
      {
        image: '/uploads/2026/06/cq5dam.web_-e1780380151979.jpg',
        caption: 'プライベートな商談スペースで特別なひとときをお過ごしください。',
      },
    ],
  },
  {
    _type: 'block',
    _key: 'blk_h2_faq',
    style: 'h2',
    children: [{ _type: 'span', _key: 'sp_h2_faq', text: 'よくあるご質問 ＆ ご留意事項' }],
  },
  {
    _type: 'faq',
    _key: 'blk_faq',
    style: 'qa',
    items: [
      {
        question: '試乗は当日の飛び込みでも可能ですか？',
        answer: '当日のご案内も可能ですが、フェア期間中は混雑が予想され、ご希望の試乗車が貸出中の場合もございます。Webフォームより事前予約をいただくことで、スムーズにお乗り比べいただけます。',
      },
      {
        question: '記念品やプレゼントの受け取り条件はありますか？',
        answer: '事前Web予約のうえ、対象ショールームにてご試乗・ご商談アンケートにご協力いただいたお客様を対象とさせていただきます。なお、数量限定につき、無くなり次第終了となりますので予めご了承ください。',
      },
      {
        question: '他社ブランドの車両に乗っていますが、下取りは可能ですか？',
        answer: 'はい、国産車・輸入車を問わず全メーカーのお車を高価下取り査定させていただきます。車検証をお持ちいただければ、ご試乗の間に迅速に無料査定を実施いたします。',
      },
    ],
  },
];

const sql = [];
sql.push(`INSERT OR REPLACE INTO _emdash_collections (
  id, slug, label, label_singular, description, icon, supports, url_pattern, sort_order, title_field
) VALUES (
  '01M5WCAMPAIGN000000000001',
  'campaigns',
  'キャンペーン',
  'キャンペーン記事',
  'BMW・MINI・Ferrari等の正規ディーラー限定キャンペーン・フェア管理コレクション',
  'sparkles',
  '["drafts","revisions","preview","scheduling","search","seo"]',
  '/campaigns/{slug}',
  3,
  'title'
);`);

// 既存の campaigns フィールド定義を一度クリアし、マガジンと同じ順序で再登録
sql.push(`DELETE FROM _emdash_fields WHERE collection_id = '01M5WCAMPAIGN000000000001';`);
for (const f of fields) {
  const columnType = f.type === 'portableText' ? 'JSON' : 'TEXT';
  sql.push(`INSERT INTO _emdash_fields (id, collection_id, slug, label, type, column_type, required, sort_order, options) VALUES (${esc(f.id)}, '01M5WCAMPAIGN000000000001', ${esc(f.slug)}, ${esc(f.label)}, ${esc(f.type)}, '${columnType}', ${f.required || 0}, ${f.sort_order}, ${esc(f.options || null)});`);
}

// 既存キャンペーンの content が空の場合は標準Portable Textブロック一式を格納、featured_image も {src, alt} 形式に統一
const contentJson = JSON.stringify(defaultCampaignPortableText);
sql.push(`UPDATE ec_campaigns SET content = ${esc(contentJson)};`);
sql.push(`UPDATE ec_campaigns SET featured_image = REPLACE(featured_image, '/uploads/2026/02/DSC2293-scaled.avif', '/uploads/2026/02/Nicole-BMW-本社.jpg');`);
sql.push(`UPDATE ec_campaigns SET featured_image = REPLACE(featured_image, '/uploads/2026/02/0H9A1397.jpg', '/uploads/2026/02/24_0206_nicol_kohoku_34664_re_re-e1773743709911-1.jpg');`);
sql.push(`UPDATE ec_campaigns SET featured_image = json_object('src', featured_image, 'alt', title) WHERE coalesce(featured_image, '') <> '' AND featured_image NOT LIKE '{%';`);
sql.push(`UPDATE ec_campaigns SET live_revision_id = NULL, draft_revision_id = NULL;`);
// ec_magazine 側の同名レコードにも同じ content を反映
sql.push(`UPDATE ec_magazine SET content = ${esc(contentJson)}, live_revision_id = NULL, draft_revision_id = NULL WHERE slug = 'mini-new-generation-debut-fair';`);

const tempFilePath = path.join(os.tmpdir(), 'sync_campaigns_meta.sql');
fs.writeFileSync(tempFilePath, sql.join('\n') + '\n', 'utf8');

if (isRemote) {
  execFileSync('npx', ['wrangler', 'd1', 'execute', 'my-emdash-site', '--remote', `--file=${tempFilePath}`, '-y'], { stdio: 'inherit' });
} else {
  execFileSync('sqlite3', [LOCAL_DB, `.read ${tempFilePath}`], { stdio: 'inherit' });
}
fs.unlinkSync(tempFilePath);
console.log(`✅ Campaigns schema & Portable Text content synced (${isRemote ? 'remote' : 'local'})`);
