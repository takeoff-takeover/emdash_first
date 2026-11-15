// scripts/seed-all-companies.mjs
import fs from 'node:fs';
import { execSync } from 'node:child_process';

const companies = [
  {
    id: '01M5WCOMPRACING00000000001',
    slug: 'nicole-racing-japan',
    title: 'ニコル・レーシング・ジャパン合同会社',
    name_en: 'Nicole Racing Japan LLC',
    role_badge: 'ニコル・グループ中枢・シェアードサービス',
    hero_image: JSON.stringify({ src: '/uploads/2026/02/DSC9048.jpg', alt: 'ニコル・レーシング・ジャパン 横浜本社オフィス' }),
    hero_phrase: '1977年創業。ニコル・グループ中枢として全事業会社を支える経営基盤。経理・財務・総務・人事・マーケティング戦略を集約し、グループ全体のガバナンス強化とシナジー最大化を推進しています。',
    about_title: 'グループ中枢としての誇り。半世紀に及ぶ信頼と革新。',
    about_lead: 'グループ各社がお客様への最高峰サービス提供に専念できる強固な経営支援体制を構築',
    about_image: JSON.stringify({ src: '/uploads/2026/02/DSC9048.jpg', alt: 'ニコル・レーシング・ジャパン オフィス' }),
    about_image_caption: '横浜本社オフィス（みなとみらい ブルーアベニュー13F）',
    about_text: 'ニコル・レーシング・ジャパン合同会社は、1977年3月にグループ創業者C.H.ニコ・ローレケによって設立された、ニコル・グループの母体となる企業です。\n\n当初はモータースポーツ用パーツの輸入・販売やレーシングチーム運営を手がけ、その後アルピナ、BMW、MINI、ロールス・ロイス、フェラーリといった世界のプレステージブランドを取り扱う一大ラグジュアリーカーディーラーグループへと発展を遂げました。\n\n現在はグループ中枢機能を担い、各事業会社がお客様へのサービス提供に専念できるよう、強固なバックオフィス機能と戦略的マーケティングを推進しています。',
    highlight_1_num: '1977年',
    highlight_1_label: 'グループ創業母体',
    highlight_2_num: '中枢機能',
    highlight_2_label: 'シェアードサービス集約',
    highlight_3_num: '5社体制',
    highlight_3_label: 'グループ経営基盤を統括',
    award_title: 'グループ創業半世紀の歩み',
    award_badge: '1977年創業',
    award_desc: 'モータースポーツの情熱から始まったニコル・グループは、半世紀近くにわたり日本のお客様へ本物の歓びと感動をお届けし続けています。',
    established: '1977年3月',
    representative: '代表職務執行者 社長 ミヒャエル・ヴィット（Michael Witt）',
    postal: '〒220-0012',
    address: '神奈川県横浜市西区みなとみらい4-4-2 横浜ブルーアベニュー13F',
    tel: '045-228-8360（代表） / FAX：045-228-8361',
    business_desc: 'ニコル・グループ全体の経営戦略立案および経営資源配分\n経理・財務・総務・人事・法務等のシェアードサービス業務\nグループ全体の統合マーケティング戦略の立案・実行\n情報システム（IT）インフラの構築・運用・セキュリティ管理'
  },
  {
    id: '01M5WCOMPALPINA00000000001',
    slug: 'nicole-automobiles',
    title: 'ニコル・オートモビルズ合同会社',
    name_en: 'Nicole Automobiles LLC',
    role_badge: '独国アルピナ社日本総代理店（-2025）/ 特選車・アフターサービス',
    hero_image: JSON.stringify({ src: '/uploads/2026/02/青山ショールーム202603.jpg', alt: 'ニコル 青山ショールーム' }),
    hero_phrase: '1982年設立。アルピナ社日本総代理店として46年間にわたり8,000台におよぶ名車をお届け。2026年以降も在庫車・中古車を中心にニコル世田谷、ニコル青山および全国BMW正規ネットワークを通じて販売・アフターサービスを提供します。',
    about_title: '名車アルピナと紡いだ46年の絆。<br />新たな章へ続く揺るぎないアフターケア。',
    about_lead: '世界最高峰のクラフトマンシップを日本へ。アルピナ・エンスージアストの情熱に寄り添い続けます',
    about_image: JSON.stringify({ src: '/uploads/2026/02/世田谷ショールーム2026.jpg', alt: 'ニコル 世田谷ショールーム' }),
    about_image_caption: 'ニコル 世田谷ショールーム（世田谷通り沿い）',
    about_text: 'ニコル・オートモビルズ合同会社は、1982年に独国ボーフェンジーペン家率いるアルピナ社（ALPINA Burkard Bovensiepen GmbH + Co. KG）の日本総代理店として設立されました。\n\n以来、46年におよぶパートナーシップのもと、8,000台を超えるハンドメイドの名車を日本の選ばれたお客様にお届けしてまいりました。\n\n2025年末のアルピナ商標譲渡完了を経て、2026年以降も在庫車・厳選中古車の販売、ならびに純正部品供給・専門技術者によるアフターサービスを誠心誠意ご提供してまいります。',
    highlight_1_num: '46年間',
    highlight_1_label: 'アルピナ社との公式絆',
    highlight_2_num: '8,000台+',
    highlight_2_label: '日本国内累計納車実績',
    highlight_3_num: '2拠点',
    highlight_3_label: '世田谷・青山の都内旗艦拠点',
    award_title: '世界屈指のアルピナ販売・技術実績',
    award_badge: '日本総代理店 46年',
    award_desc: '独国アルピナ社より世界最大のマーケットとして高く評価され、世界トップクラスの販売実績と高度な技術力を堅持し続けました。',
    established: '1982年1月',
    representative: '代表職務執行者 社長 ミヒャエル・ヴィット（Michael Witt）',
    postal: '〒158-0082',
    address: '東京都世田谷区等々力2-6-1',
    tel: '03-5707-1600（代表） / FAX：03-5707-1601',
    business_desc: 'アルピナ乗用車・厳選認定中古車の販売\nアルピナ純正部品・アクセサリーの輸入・販売\nアルピナ専用設備を備えた指定サービス工場におけるメンテナンス・点検・レストア\n自動車保険代理店業務'
  },
  {
    id: '01M5WCOMPCARS000000000001',
    slug: 'nicole-cars',
    title: 'ニコル・カーズ合同会社',
    name_en: 'Nicole Cars LLC',
    role_badge: 'BMW / MINI 正規ディーラー',
    hero_image: JSON.stringify({ src: '/uploads/2026/01/Nicole-BMW-本社.jpg', alt: 'Nicole BMW 本社（川崎）' }),
    hero_phrase: '1988年設立。東京・神奈川エリアにBMWショールーム5拠点、MINIショールーム3拠点、サービスセンター、認定中古車センターを展開。全国BMW最優秀ディーラー賞7度受賞（全国唯一）、最優秀・優秀賞通算23回獲得の実績を誇ります。',
    about_title: '駆けぬける歓びと、愛されるMINIの世界を。<br />全国唯一「BMW最優秀賞7度受賞」の誇り。',
    about_lead: '東京・神奈川エリアに広がる強固なネットワークと世界水準のサービス力でお応えします',
    about_image: JSON.stringify({ src: '/uploads/2026/02/Nicole-BMW-横浜港北支店.jpg', alt: 'Nicole BMW 横浜港北支店' }),
    about_image_caption: 'Nicole BMW 横浜港北支店（港北ニュータウン中核拠点）',
    about_text: 'ニコル・カーズ合同会社は、1988年にビー・エム・ダブリュー株式会社（BMW JAPAN）の正規ディーラーとして設立されました。\n\n神奈川県川崎市・横浜市ならびに東京都大田区にまたがる広域ネットワークを構築し、BMW新車ショールーム5拠点、MINI新車ショールーム3拠点、BMW/MINI認定中古車センター4拠点、総合サービスセンターを展開しています。\n\n全国BMW正規ディーラーネットワークにおいて、顧客満足度・販売・技術のすべてで最高峰と評価される「最優秀ディーラー賞」を全国唯一7度受賞。通算23回にわたり最優秀・優秀ディーラー賞に輝いています。',
    highlight_1_num: '7度受賞',
    highlight_1_label: '全国BMW最優秀賞（全国唯一）',
    highlight_2_num: '通算23回',
    highlight_2_label: 'BMW最優秀・優秀賞 獲得',
    highlight_3_num: '13拠点',
    highlight_3_label: '東京・神奈川の広域ネットワーク',
    award_title: '全国BMW最優秀ディーラー賞',
    award_badge: '全国唯一 7度受賞（通算23回獲得）',
    award_desc: '全国のBMW正規ディーラーの中で、顧客満足度・新車販売・認定中古車・アフターセールス品質のすべての総合評価において頂点に輝いた実績です。',
    established: '1988年11月',
    representative: '代表職務執行者 社長 ミヒャエル・ヴィット（Michael Witt）',
    postal: '〒212-0005',
    address: '神奈川県川崎市幸区戸手2-5-7',
    tel: '044-511-2000（代表） / FAX：044-541-2400',
    business_desc: 'BMW乗用車の新車販売およびアフターセールス\nMINI乗用車の新車販売およびアフターセールス\nBMW / MINI 認定中古車（BPS / MINI NEXT）の販売・買取\nBMW / MINI 純正部品・アクセサリー・ライフスタイル商品の販売\n指定サービス工場における車検・点検・板金塗装修理\n自動車損害賠償責任保険および任意自動車保険代理店業務'
  },
  {
    id: '01M5WCOMPMOTOR00000000001',
    slug: 'nicole-motorcars',
    title: 'Nicole MotorCars合同会社',
    name_en: 'Nicole MotorCars LLC',
    role_badge: 'ロールス・ロイス・モーター・カーズ正規ディーラー',
    hero_image: JSON.stringify({ src: '/uploads/2026/02/rr_20261008.jpg', alt: 'Rolls-Royce Motor Cars Yokohama' }),
    hero_phrase: '2009年設立。英国ロールス・ロイス・モーター・カーズ正規ディーラー「Rolls-Royce Motor Cars Yokohama」。2024年に最新CIショールームを開設し、「グローバル・ビスポーク・オブ・ザ・イヤー」を受賞。比類なき至高の体験をお届けします。',
    about_title: '至高のラグジュアリーとビスポークの世界。<br />世界が認めたグローバル・アワード受賞ディーラー。',
    about_lead: '横浜みなとみらいを舞台に、お客様一人ひとりの感性を形づくる究極のパーソナライゼーション',
    about_image: JSON.stringify({ src: '/uploads/2026/02/20240119RRYokohama_Photo07-scaled.avif', alt: 'Rolls-Royce Yokohama ビスポークラウンジ' }),
    about_image_caption: 'ロールス・ロイス 最新CIビスポークラウンジ（みなとみらい）',
    about_text: 'Nicole MotorCars合同会社は、2009年に英国ロールス・ロイス・モーター・カーズより神奈川エリアの正規販売代理店として指名を受け設立されました。\n\n2024年には、日本初となる最新コーポレート・アイデンティティ（CI）を導入した新ショールームを横浜みなとみらいにグランドオープン。\n\n同年、全世界の正規ディーラーの中から最も優れたビスポーク（特注仕様）創出実績を讃える「グローバル・ビスポーク・オブ・ザ・イヤー」を受賞するなど、世界最高峰のブランドに相応しい確かな実績と情熱で、選ばれたお客様へ唯一無二の感動をお届けしています。',
    highlight_1_num: '世界一',
    highlight_1_label: 'グローバル・ビスポーク賞受賞',
    highlight_2_num: '最新CI',
    highlight_2_label: '日本初導入ショールーム',
    highlight_3_num: '2009年',
    highlight_3_label: '設立・正規指名',
    award_title: 'グローバル・ビスポーク・ディーラー・オブ・ザ・イヤー',
    award_badge: '世界最高峰アワード受賞（2024）',
    award_desc: '全世界のロールス・ロイス正規ディーラーの中で、最も卓越したビスポーク車両の提案力とクラフトマンシップ、顧客満足度を達成したディーラーに贈られる最高栄誉です。',
    established: '2009年5月',
    representative: '代表職務執行者 社長 ミヒャエル・ヴィット（Michael Witt）',
    postal: '〒220-0012',
    address: '神奈川県横浜市西区みなとみらい4-2-1',
    tel: '045-680-4500（代表） / FAX：045-680-4501',
    business_desc: 'ロールス・ロイス乗用車の新車販売およびビスポークオーダー受注\nロールス・ロイス認定中古車「Provenance（プロヴェナンス）」の販売・査定・買取\nロールス・ロイス純正部品・アクセサリー・コレクションの販売\n正規指定サービス工場における法定点検・整備・コンコースコンディション維持管理\n自動車保険代理店業務'
  }
];

let sql = '';
companies.forEach(c => {
  sql += `INSERT OR REPLACE INTO ec_companies (
    id, slug, status, title, name_en, role_badge, hero_image, hero_phrase,
    about_title, about_lead, about_image, about_image_caption, about_text,
    highlight_1_num, highlight_1_label, highlight_2_num, highlight_2_label, highlight_3_num, highlight_3_label,
    award_title, award_badge, award_desc, established, representative, postal, address, tel, business_desc, content
  ) VALUES (
    '${c.id}',
    '${c.slug}',
    'published',
    '${c.title}',
    '${c.name_en}',
    '${c.role_badge}',
    '${c.hero_image.replace(/'/g, "''")}',
    '${c.hero_phrase.replace(/'/g, "''")}',
    '${c.about_title.replace(/'/g, "''")}',
    '${c.about_lead.replace(/'/g, "''")}',
    '${c.about_image.replace(/'/g, "''")}',
    '${c.about_image_caption.replace(/'/g, "''")}',
    '${c.about_text.replace(/'/g, "''")}',
    '${c.highlight_1_num}',
    '${c.highlight_1_label}',
    '${c.highlight_2_num}',
    '${c.highlight_2_label}',
    '${c.highlight_3_num}',
    '${c.highlight_3_label}',
    '${c.award_title.replace(/'/g, "''")}',
    '${c.award_badge.replace(/'/g, "''")}',
    '${c.award_desc.replace(/'/g, "''")}',
    '${c.established}',
    '${c.representative.replace(/'/g, "''")}',
    '${c.postal}',
    '${c.address.replace(/'/g, "''")}',
    '${c.tel.replace(/'/g, "''")}',
    '${c.business_desc.replace(/'/g, "''")}',
    '[]'
  );\n`;
});

fs.writeFileSync('/tmp/insert_all_companies.sql', sql);
execSync('npx wrangler d1 execute my-emdash-site --local --file=/tmp/insert_all_companies.sql', { stdio: 'inherit' });
console.log('✓ All 4 other companies inserted into ec_companies.');

// seed.json にも 4 社を追加
const seedPath = 'seed/seed.json';
const seed = JSON.parse(fs.readFileSync(seedPath, 'utf-8'));
companies.forEach(c => {
  const existingIdx = seed.content.companies.findIndex(x => x.slug === c.slug);
  const entry = {
    id: c.id,
    slug: c.slug,
    status: 'published',
    published_at: new Date().toISOString(),
    data: {
      title: c.title,
      name_en: c.name_en,
      role_badge: c.role_badge,
      hero_image: JSON.parse(c.hero_image),
      hero_phrase: c.hero_phrase,
      about_title: c.about_title,
      about_lead: c.about_lead,
      about_image: JSON.parse(c.about_image),
      about_image_caption: c.about_image_caption,
      about_text: c.about_text,
      highlight_1_num: c.highlight_1_num,
      highlight_1_label: c.highlight_1_label,
      highlight_2_num: c.highlight_2_num,
      highlight_2_label: c.highlight_2_label,
      highlight_3_num: c.highlight_3_num,
      highlight_3_label: c.highlight_3_label,
      award_title: c.award_title,
      award_badge: c.award_badge,
      award_desc: c.award_desc,
      established: c.established,
      representative: c.representative,
      postal: c.postal,
      address: c.address,
      tel: c.tel,
      business_desc: c.business_desc,
      content: []
    }
  };
  if (existingIdx >= 0) seed.content.companies[existingIdx] = entry;
  else seed.content.companies.push(entry);
});

fs.writeFileSync(seedPath, JSON.stringify(seed, null, 2));
console.log('✓ All 5 companies saved to seed/seed.json.');
