import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { DatabaseSync, backup } from 'node:sqlite';

// Local editorial content only. No remote synchronization or deployment.
const slug = 'bmw-mini-rolls-royce-ferrari-resale-guide';
let n = 0;
const key = () => `resale-${++n}`;
const p = (text, style = 'normal') => ({ _type: 'block', _key: key(), style, markDefs: [], children: [{ _type: 'span', _key: key(), text, marks: [] }] });
const h = text => p(text, 'h2');
const list = text => ({ ...p(text), listItem: 'bullet', level: 1 });
const cards = items => ({ _type: 'editorial-tools:column_cards', _key: key(), columns: '3', card_style: 'box', items });
const table = rows => ({ _type: 'table', _key: key(), hasHeaderRow: true, rows: rows.map((row, r) => ({ _type: 'tableRow', _key: key(), cells: row.map(text => ({ _type: 'tableCell', _key: key(), isHeader: r === 0, colspan: 1, rowspan: 1, content: [{ _type: 'span', _key: key(), text, marks: [] }] })) })) });
const link = (text, href) => ({ ...p(text), markDefs: [{ _type: 'link', _key: 'source', href }], children: [{ _type: 'span', _key: key(), text, marks: ['source'] }] });
const photos = {
  bmw: '/wp-content/uploads/2026/10/169P90638677_highRes_bmw-740-xdrive-04-20-scaled-e1791451337890-1536x747.jpg',
  mini: '/wp-content/uploads/2026/08/169P90635275_highRes_mini-family-04-2026-1536x864.jpg',
  rolls: '/wp-content/uploads/2026/08/Rolls-Royce-Cullinan-Series-II-Captain-Finished-in-Monteverde-Image-9-2025-scaled-e1787725475530.jpg',
  ferrari: '/wp-content/uploads/2026/08/DSC2894-scaled.jpg',
};
for (const file of Object.values(photos)) if (!fs.existsSync(`public${file}`)) throw new Error(`Missing photo: ${file}`);
const faq = [
  ['査定を受けたら、必ず売らなければいけませんか？', '査定は価値や条件を確認する段階です。売却契約への同意とは分けて考えましょう。ただし、申込書や電子署名の内容は必ず確認してください。査定料・出張料の有無も事前に確認すると安心です。'],
  ['ローンや残価設定型ローンが残っていても相談できますか？', 'まず残債と車検証上の所有者を確認してください。売却にはローン会社などの手続きや所有権解除が必要になる場合があります。売却額が一括返済額を下回る場合は、差額の精算方法を契約前に相談しましょう。残価保証の条件と、買取・下取りの条件も別々に比較してください。'],
  ['委託販売なら買取より必ず高く売れますか？', '必ず高くなるとは限りません。売出価格から手数料や合意した整備・保管費などを差し引き、手取り額で比較します。成約時期も確約されないため、待っている間の費用や相場変動を含めて検討してください。'],
  ['委託販売中も車に乗れますか？売れなかったらどうなりますか？', '預かり展示か、手元で保管する方式かによって異なります。走行距離の上限、保険、事故時の責任を確認しましょう。売れない場合の返却日、返却費用、販売継続・買取への切替条件も、最初に書面で決めておきます。'],
  ['傷を直したり、車検を通したりしてから査定した方が得ですか？', '費用をかけた分だけ査定額が上がるとは限りません。先に現状のまま査定を受け、修理・車検費用と査定差額を比較するのが合理的です。安全に関わる不具合は使用を控え、修復歴や不具合は正確に伝えてください。'],
  ['何月に売るのが一番お得ですか？', '全車共通の正解はありません。需要期でも、その車の在庫、仕様、年式、状態で条件は変わります。車検・保証の期限、今後の走行距離、次の車の納期を確認し、同じ引渡条件で見積もりを比較しましょう。'],
  ['契約した後でも、自由にキャンセルできますか？', '車の売却は原則としてクーリング・オフの対象外です。解除できる時期や費用は契約内容によって異なります。「とりあえず署名」は避け、契約の成立時点、キャンセル条件、引渡後の減額条件を確認しましょう。トラブル時はJPUCなどの相談窓口を利用できます。'],
  ['査定の相談時は何を伝えればよいですか？', 'ブランド・車種・グレード、初度登録年月、走行距離、車検満了日、希望売却時期、ローンの有無を伝えてください。外装・内装・傷の写真、整備記録、オプション一覧があると条件を確認しやすくなります。お問い合わせ欄には「買取・査定希望」または「委託販売も比較したい」と記入してください。'],
].map(([question, answer]) => ({ question, answer }));

const content = [
  p('大切に乗ってきた一台を手放すとき、見るべきなのは査定額だけではありません。「いつまでに手放したいか」「手元にいくら残るか」「次の車までどう移動するか」。この3つをそろえると、納得できる売り方が見えてきます。'),
  p('BMW・MINI、そしてロールス・ロイス・フェラーリの売却を考える方へ。下取り・買取の基本から、委託販売という選択肢、売り時、査定前の準備まで、初めての方にもわかる言葉でまとめました。'),
  h('まずは、あなたに合う売り方を選ぶ'),
  cards([
    { title: '乗り換えをまとめて進めたい', text: '下取りを軸に比較。購入と売却の窓口をまとめ、次の車の納車日と引渡日を相談します。' },
    { title: '売却・入金の予定を立てたい', text: '買取を軸に比較。購入の予定がなくても検討でき、契約時に引渡日と支払期限を確認できます。' },
    { title: '時間をかけて条件を探りたい', text: '委託販売も比較。販売店に買い手探しを任せ、手取り額と待てる期間を先に決めます。' },
  ]),
  h('査定・下取り・買取・委託販売は、何が違う？'),
  p('査定は、車の状態や市場での需要を確認し、価格や取引条件を提示すること。売却方法そのものではありません。写真や申告情報による概算と、実車確認後の金額は異なる場合があります。'),
  table([
    ['方法', 'お金の受け取り方', '向いている希望', '先に確認すること'],
    ['下取り', '購入代金に充当するのが一般的', '乗り換えを一緒に進めたい', '値引きと下取額の内訳、引渡日'],
    ['買取', '販売店などが買い取り、契約の支払期限までに精算', '売却日や入金予定を決めたい', '最終買取額、費用、支払期限'],
    ['委託販売', '買い手との成約後、契約に従って精算', '期間に余裕があり、条件を相談したい', '手取り額、手数料、期限、未成約時の扱い'],
  ]),
  p('下取りは「次の車にいくら払うか」、買取は「いつ、いくら受け取るか」、委託販売は「いくら残り、どのくらい待てるか」が判断の中心です。委託販売の売出価格を、買取額とそのまま比べないことが大切です。'),
  h('図で整理する、車とお金の流れ'),
  cards([
    { title: '下取り', text: 'あなた → 購入先の販売店へ車を引き渡す\n下取額 → 次の車の購入代金に充当\n購入と売却を一緒に調整します。' },
    { title: '買取', text: 'あなた → 買取先へ車を引き渡す\n買取先 → あなたへ代金を支払う\nその後の再販売は買取先が進めます。' },
    { title: '委託販売', text: 'あなた → 販売店に買い手探しを依頼\n買い手が決まる → 契約に沿って代金を精算\n手数料などを差し引いた金額を受け取ります。' },
  ]),
  h('ブランド別に、査定で伝えたいポイント'),
  p('同じ車種でも、仕様や履歴で評価は変わります。BMW・MINIでも委託販売を比較できる場合があります。ロールス・ロイス・フェラーリでは、仕様の価値を買い手に丁寧に伝える方法として委託販売も検討したい選択肢です。いずれも取扱可否や条件は車両・販売店ごとに確認してください。'),
  { _type: 'editorial-tools:split_media', _key: key(), image_position: 'zigzag', media_ratio: '50-50', items: [
    { image: { src: photos.bmw, alt: 'BMW 7シリーズのエクステリア' }, title: 'BMW｜グレードと装備を正確に伝える', text: 'MモデルやM Sport、駆動方式、メーカーオプションなどを整理しましょう。整備履歴と純正部品の有無も確認材料です。電動車は、バッテリーの診断情報や保証の残り・継承条件を確認します。買取・下取りに加え、仕様に合う買い手を探す委託販売も相談できます。' },
    { image: { src: photos.mini, alt: 'MINIの車両ラインアップ' }, title: 'MINI｜個性を装備の一覧にする', text: 'ボディタイプ、グレード、ボディとルーフの色、限定仕様、装備内容をまとめます。好みが反映されやすい仕様でも、オプション費用がそのまま売却価格に戻るわけではありません。買い手との相性を考え、売却期間に余裕があれば委託販売も比較しましょう。' },
    { image: { src: photos.rolls, alt: 'ロールス・ロイス カリナン シリーズIIのエクステリア' }, title: 'ロールス・ロイス｜ビスポークと履歴を丁寧に', text: 'ビスポーク（個別仕立ての仕様）、内外装の組み合わせ、整備履歴などを資料で伝えます。委託販売を検討する際は、販売実績だけでなく、保管環境、試乗の管理、保険や事故時の責任まで確認しましょう。希少な仕様でも、成約価格や期間が保証されるわけではありません。' },
    { image: { src: photos.ferrari, alt: 'フェラーリ認定中古車紹介に使用された車両写真' }, title: 'フェラーリ｜仕様・付属品・整備履歴をそろえる', text: 'メーカーオプション、整備記録、保証・メンテナンスプログラムの残りと継承条件、キーや付属品を確認します。委託販売では希望価格だけでなく、反響を見て価格を見直す時期も決めましょう。モデルごとの需要を踏まえ、買取の確定条件と並べて検討します。' },
  ] },
  p('写真は各ブランドのイメージです。掲載車両の買取・委託販売の募集や、査定額の保証を示すものではありません。'),
  h('委託販売は「売出価格」より「手取り額」で比べる'),
  p('委託販売では、販売店が提示する店頭価格の全額を受け取れるわけではありません。手数料の計算方法、消費税の扱い、整備・広告・保管・陸送費など、誰が何を負担するかを見積書でそろえましょう。'),
  table([
    ['比較項目', '買取の例', '委託販売の例'],
    ['提示される価格', '買取額 800万円', '成約価格 880万円'],
    ['差し引く費用', 'ここでは0円と仮定', '手数料44万円＋合意した諸費用11万円'],
    ['残債精算前の受取額', '800万円', '825万円'],
    ['比較のポイント', '引渡日・支払期限を確認', '差額25万円と、待つ期間・追加費用を比較'],
  ]),
  p('上記は計算方法を説明するための架空例です。当社の査定額・手数料率・販売実績ではありません。費用は税込の仮定で、税金やリサイクル預託金などの精算条件は同じものとして比較しています。ローンがある場合、実際の振込額は一括返済額などを差し引いて確認します。'),
  p('販売が長引けば、保管費用や相場の変動で差額が縮むこともあります。「この金額以上を目指す」「この日までに売れなければ再検討する」という2つの基準を決めておくと判断しやすくなります。'),
  h('委託販売を頼む前に、書面で確認したいこと'),
  list('販売期間と終了方法：いつまで販売し、未成約なら返却・延長・買取への切替をどうするか。'),
  list('価格変更の権限：値下げや商談条件の変更に、所有者の事前同意が必要か。'),
  list('費用と手取り：成約時・未成約時・途中解約時に発生する費用の一覧と、支払時期。'),
  list('保管・使用・保険：預かる場所、試乗や移動の範囲、事故・盗難・破損時の責任と補償。'),
  list('成約後の精算：代金回収の確認、振込期限、名義変更の完了確認、引渡後の不具合への対応。'),
  h('いつ売るのがベスト？予定と費用から逆算する'),
  p('「春なら必ず高い」「走行距離が節目を越えたら一気に下がる」といった一律の判断は避けましょう。市場の需要と在庫に加え、一台ごとの状態や仕様で条件は変わります。まず現在の査定条件を知り、待つことで増える費用と比べるのが出発点です。'),
  cards([
    { title: '車検・保証の期限が近い', text: '更新前に一度査定を。車検や保証延長にかかる費用と、乗り続ける価値を比較します。期限前なら必ず高くなるという意味ではありません。' },
    { title: '次の車の納車が見えてきた', text: '納車日と引渡日をそろえて相談。査定額の有効期限、納車が遅れた場合の再査定や代車・レンタカーの費用も確認します。' },
    { title: '乗る機会が減ってきた', text: '駐車場、保険、整備など、待っている間の負担を整理。希望価格だけを追わず、手元に残る金額と生活の予定で判断します。' },
  ]),
  p('委託販売は買い手が決まるまでの時間も必要です。引越しや納車など動かせない期限がある場合は早めに相談し、締切が近づいたときの方針も決めておきましょう。'),
  h('査定前にできる、無駄な出費を抑える準備'),
  list('整備記録簿、保証書、オプション明細、スペアキー、取扱説明書など、手元にある資料と付属品をまとめる。'),
  list('洗車と車内の清掃をして状態を確認しやすくする。高額な補修やコーティングは、査定差額を確認してから判断する。'),
  list('修復歴、不具合、警告灯、交換・改造した箇所は把握している範囲で正確に伝える。純正部品があれば一緒に相談する。'),
  list('車検証の所有者・使用者、ローン残高、希望の引渡日を確認する。必要書類は名義や住所変更の有無によって異なるため、個別に案内を受ける。'),
  list('比較する見積もりは、引渡日・走行距離・付属品・有効期限をそろえる。下取額と購入車の値引きを分け、最終的な支払総額・受取額を見る。'),
  p('引渡しが決まったら、ナビの登録住所や連携アプリ、車内の個人情報、ETCカードなどを確認してください。自動車税・リサイクル預託金などの扱い、保険の変更・解約、名義変更の完了確認も忘れずに相談しましょう。'),
  h('よくある質問'),
  { _type: 'editorial-tools:faq', _key: key(), style: 'qa', items: faq },
  h('契約前の確認に役立つ参考情報'),
  link('JPUC｜車売却消費者相談室（売却・契約トラブルの相談案内）', 'https://www.jpuc.or.jp/trouble/'),
  link('JPUC｜契約後に修復歴が判明した場合の減額・契約解除に関する相談事例', 'https://www.jpuc.or.jp/consultation/article/641844d8adfd3972e40ac572/'),
  link('伊勢市｜中古車の売買契約とキャンセルについて', 'https://www.city.ise.mie.jp/kurashi/soudan/syouhiseikatsu/1011011/1011057.html'),
  p('2026年11月6日確認。この記事は売却方法を比較するための一般的なガイドです。実際の取扱可否、査定額、手数料、税金などの精算、必要書類は車両と契約条件により異なります。BMW・MINI・ロールス・ロイス・フェラーリの委託販売の市場比率を示すものではありません。'),
  h('愛車の価値と、あなたに合う売り方を相談する'),
  { _type: 'editorial-tools:column_cards', _key: key(), columns: '1', card_style: 'box', items: [{ title: '買取・査定のご相談', text: '売却時期が決まっていなくても、まずは現在の条件を確認しましょう。お問い合わせフォームでブランド・車種・走行距離・希望時期を伝え、内容欄に「買取・査定希望」とご記入ください。委託販売との比較をご希望の場合は、その旨もお知らせください。対応可否や必要な情報は担当者からご案内します。', button_label: '買取・査定を依頼する', button_url: '/contact/?brand=nicole&form_type=inquiry#formrun-wrapper' }] },
];
const data = {
  title: 'BMW・MINI・ロールス・ロイス・フェラーリの下取り・買取ガイド｜査定・売却・委託販売の違いと売り時',
  excerpt: '下取り・買取・委託販売はどう違う？BMW・MINI・ロールス・ロイス・フェラーリの売却方法を、比較表と流れ図、ブランド別の写真、8つのFAQで解説。手取り額・売り時・査定前の準備までわかります。',
  featured_image: { src: photos.bmw, alt: '下取り・買取ガイドのイメージとして掲載したBMW 7シリーズ', provider: 'external' },
  layout: '2col', content,
};
fs.mkdirSync('scratch', { recursive: true });
fs.writeFileSync('scratch/resale-guide.json', JSON.stringify(data, null, 2));
if (!process.argv.includes('--apply')) { console.log(`Prepared ${content.length} editable blocks and ${faq.length} FAQs`); process.exit(0); }
const filename = fs.readFileSync('seed/db-filename.txt', 'utf8').trim();
if (path.basename(filename) !== filename) throw new Error('Invalid DB filename');
const db = new DatabaseSync(path.join('.wrangler/state/v3/d1/miniflare-D1DatabaseObject', filename));
if (db.prepare('SELECT id FROM ec_magazine WHERE slug=?').get(slug)) throw new Error('Article exists; read its current revision before editing');
await backup(db, `scratch/before-resale-guide-${Date.now()}.sqlite`);
const result = spawnSync(process.execPath, ['node_modules/emdash/dist/cli/index.mjs', 'content', 'create', 'magazine', '--file', 'scratch/resale-guide.json', '--slug', slug, '--url', 'http://127.0.0.1:4321', '--json'], { encoding: 'utf8', maxBuffer: 5 * 1024 * 1024 });
if (result.status !== 0) throw new Error(result.stderr || result.stdout);
const created = JSON.parse(result.stdout);
const now = new Date().toISOString();
for (const term of ['term_mag_buyers_guide', 'term_brand_bmw', 'term_brand_mini', 'term_brand_rolls-royce', 'term_brand_ferrari']) {
  db.prepare("INSERT OR REPLACE INTO content_taxonomies (collection,entry_id,taxonomy_id,status,locale,published_at,created_at) VALUES ('magazine',?,?,'published','en',?,?)").run(created.id, term, now, now);
}
await backup(db, 'seed/backup.sqlite');
db.close();
console.log(JSON.stringify({ id: created.id, slug, blocks: content.length, faqs: faq.length }));
