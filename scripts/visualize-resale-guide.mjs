import fs from 'node:fs';
import { spawnSync } from 'node:child_process';
import { DatabaseSync, backup } from 'node:sqlite';

const root = 'public/uploads/resale-guide';
fs.mkdirSync(root, { recursive: true });
const paths = {
  exchange: '<path d="M5 8h21m-5-5 5 5-5 5M27 24H6m5-5-5 5 5 5"/>',
  wallet: '<rect x="4" y="8" width="24" height="18" rx="3"/><path d="M24 8V5H8v3M28 14h-8v7h8"/><path d="M23 17h1"/>',
  store: '<path d="M5 13v15h22V13M3 13l3-8h20l3 8M3 13c0 4 6 4 6 0 0 4 7 4 7 0 0 4 7 4 7 0 0 4 6 4 6 0M12 28V18h8v10"/>',
  calendar: '<rect x="4" y="6" width="24" height="23" rx="3"/><path d="M10 3v6M22 3v6M4 13h24m-17 8 3 3 7-7"/>',
  car: '<path d="M4 22v-8l4-8h16l4 8v8M4 14h24M8 22v5M24 22v5M7 19h3M22 19h3M4 23h24"/>',
  clock: '<circle cx="16" cy="16" r="12"/><path d="M16 8v9l6 4"/>',
  folder: '<path d="M3 10V6h10l3 4h13v17H3zM3 14h26"/>',
  key: '<circle cx="11" cy="11" r="7"/><path d="m16 16 13 13m-7-7 3-3m-7-1 3-3"/>',
};
for (const [name, body] of Object.entries(paths)) fs.writeFileSync(`${root}/${name}.svg`, `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="none" stroke="#fff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${body}</svg>`);
const current = JSON.parse(fs.readFileSync('scratch/resale-current.json','utf8'));
const original = current.data.content;
const before = JSON.stringify(original).length;
let k = 0;
const p = (text, style = 'normal') => ({ _type:'block', _key:`visual-${++k}`, style, markDefs:[], children:[{_type:'span',_key:`span-${k}`,text,marks:[]}] });
const h = text => p(text,'h2');
const html = markup => ({_type:'htmlBlock',_key:`diagram-${++k}`,html:markup});
const icon = name => `<img class="resale-icon" src="/uploads/resale-guide/${name}.svg" alt="" loading="lazy" />`;
const visualCards = items => html(`<section class="resale-visual cms-col-cards"><div class="cms-col-cards__grid">${items.map(([name,title,text])=>`<article class="cms-col-card"><div class="cms-col-card__body">${icon(name)}<h3>${title}</h3><p>${text}</p></div></article>`).join('')}</div></section>`);
const find = type => original.find(x=>x._type===type);
const brands = find('editorial-tools:split_media');
brands.items[0].text = 'グレード・駆動方式・メーカーオプションを一覧に。整備履歴、純正部品、電動車の診断情報や保証条件も確認しましょう。';
brands.items[1].text = 'ボディとルーフの色、限定仕様、装備を整理。オプション費用がそのまま査定額に戻るわけではないため、条件を比較します。';
brands.items[2].text = 'ビスポーク（個別仕立ての仕様）と整備履歴を資料で伝えましょう。委託販売では、保管環境や試乗・保険の管理も確認します。';
brands.items[3].text = 'オプション、整備記録、キー・付属品をそろえます。委託販売なら、手取りの目標額と価格を見直す時期も決めましょう。';
const faq = find('editorial-tools:faq');
const notes = [
  {question:'委託販売の契約前チェック',answer:'販売期間と未成約時の返却・延長・買取への切替条件／値下げへの事前同意／成約時・未成約時・解約時の費用／保管場所と試乗の範囲／事故・盗難時の保険と責任／振込期限と名義変更の完了確認。この6点を書面で確認しましょう。'},
  {question:'査定前にそろえる資料・伝える情報',answer:'整備記録簿、保証書、オプション明細、スペアキー、取扱説明書を準備。初度登録年月、走行距離、車検満了日、希望引渡日、修復歴や不具合、ローン残高と車検証の所有者を確認してください。高額な補修は、査定差額を聞いてから判断しましょう。'},
  {question:'引渡しと精算のチェック',answer:'税金やリサイクル預託金の扱い、振込期限、名義変更の完了確認、保険の変更・解約を相談します。ナビの登録住所や連携アプリの個人情報、ETCカードの取り忘れにも注意してください。'},
];
const cta = original.at(-1);
cta.items[0].text = 'フォームの内容欄に「買取・査定希望」とご記入ください。ブランド・車種・走行距離・希望時期をお知らせいただくとスムーズです。委託販売の比較もご相談いただけます。対応可否・条件は担当者からご案内します。';
const content = [
  p('愛車を手放すなら、「手元に残る金額」「入金の時期」「次の車までの移動」をセットで考えましょう。3つの売り方を図で比べ、あなたに合う方法を選びます。'),
  h('あなたに合う売り方は？'),
  html(`<section class="resale-visual">${[
    ['exchange','下取り','愛車','購入する販売店','次の車の代金へ','乗り換えをまとめたい方に。納車日と引渡日も一緒に調整。'],
    ['wallet','買取','愛車','買取店','代金を受け取る','売却・入金の予定を立てたい方に。支払期限を契約で確認。'],
    ['store','委託販売','販売店に依頼','買い手が決まる','成約後に精算','時間に余裕がある方に。費用を引いた手取り額で比較。'],
  ].map(([i,t,a,b,c,d])=>`<article class="resale-flow-row">${icon(i)}<div><h3>${t}</h3><div class="resale-flow-path"><span>${a}</span><span>→</span><span>${b}</span><span>→</span><span>${c}</span></div><p>${d}</p></div></article>`).join('')}</section>`),
  p('査定は「いくらで、どんな条件で売れるか」を確認すること。売却契約とは別の段階です。写真による概算と実車確認後の金額は変わる場合があります。'),
  h('委託販売は「手取り」で比べる'),
  html('<figure class="resale-visual"><dl class="resale-equation"><div><dt>成約価格</dt><dd>880万円</dd></div><div class="resale-symbol">−</div><div><dt>手数料・諸費用</dt><dd>55万円</dd></div><div class="resale-symbol">＝</div><div><dt>残債精算前の受取額</dt><dd>825万円</dd></div></dl><figcaption>計算方法を示す架空例です。手数料44万円＋諸費用11万円を税込で仮定。当社の料金・査定額・実績ではありません。</figcaption></figure>'),
  p('買取800万円の提示があれば、差額は25万円。この差と「売れるまでの期間・追加費用・相場変動」を比べます。税金などの精算条件をそろえ、ローンがある場合は一括返済額も差し引きましょう。'),
  p('委託販売は高値や成約を保証する方法ではありません。「いくら以上を目指すか」と「いつまで待つか」を先に決めると、迷いにくくなります。'),
  h('ブランドごとに、ここを伝える'),
  p('BMW・MINIでも委託販売を比較できる場合があります。ロールス・ロイス・フェラーリでは、仕様の価値を買い手に伝える選択肢としても検討しましょう。対応可否は販売店・車両ごとに確認してください。'),
  brands,
  { _type:'editorial-tools:notes',_key:'photo-note',content:'ブランド写真はイメージです。掲載車両の買取・委託販売の募集を示すものではありません。' },
  h('売り時は、3つの予定から逆算'),
  visualCards([
    ['calendar','車検・保証の前','更新費用をかける前に査定。費用と、乗り続ける価値を比較します。'],
    ['car','次の車の納車前','引渡日と納車日を調整。遅延時の再査定や移動費も確認。'],
    ['clock','乗る機会が減ったとき','駐車場・保険・整備費を整理。待つ間の負担も判断材料に。'],
    ['store','委託販売は早めに','売却期限から逆算。売れない場合の切替時期も決めておきます。'],
  ]),
  p('「何月なら必ず高く売れる」という正解はありません。需要・在庫・仕様・状態で変わるため、同じ引渡条件で現在の見積もりを比較しましょう。'),
  h('査定前は「そろえる・伝える」が大切'),
  html('<figure class="resale-visual"><img class="resale-prep-image" src="/uploads/resale-guide/appraisal-preparation.png" alt="車のキー、書類ケース、ペンを並べた査定準備のイメージ" width="1536" height="1024" loading="lazy" /><figcaption>査定前の準備を表現したAI生成イメージ</figcaption></figure>'),
  visualCards([
    ['folder','資料をそろえる','整備記録・保証書・装備の明細。愛車の履歴が伝わる資料を準備。'],
    ['key','キーと付属品を確認','スペアキー・取扱説明書・純正部品。残っているものをまとめます。'],
    ['car','状態を正確に伝える','修復歴・不具合・改造箇所を共有。高額な補修は査定後に検討。'],
    ['calendar','引渡条件をそろえる','希望時期・走行距離・見積もり期限をそろえて比較します。'],
  ]),
  h('契約・準備の詳しいチェック'),
  {_type:'editorial-tools:faq',_key:'resale-checks',style:'simple',items:notes},
  h('よくある質問'),faq,
  h('参考情報'),
  ...original.filter(x=>x._type==='block' && x.markDefs?.some(d=>d._type==='link')),
  {_type:'editorial-tools:notes',_key:'guide-note',content:'2026年11月6日確認。取扱可否・査定額・費用・税金などの精算・必要書類は車両と契約条件により異なります。各ブランドの委託販売の市場比率を示す記事ではありません。'},
  h('愛車の価値と、売り方を相談する'),cta,
];
const data={content,layout:'2col',excerpt:'下取り・買取・委託販売の違いを図で比較。BMW・MINI・ロールス・ロイス・フェラーリの査定ポイント、手取り額、売り時をアイコンと写真でわかりやすく解説します。'};
fs.writeFileSync('scratch/resale-visual-update.json',JSON.stringify(data,null,2));
console.log(JSON.stringify({before,after:JSON.stringify(content).length,blocks:content.length}));
if (!process.argv.includes('--apply')) process.exit(0);
const db=new DatabaseSync('.wrangler/state/v3/d1/miniflare-D1DatabaseObject/'+fs.readFileSync('seed/db-filename.txt','utf8').trim());
await backup(db,`scratch/before-resale-visual-${Date.now()}.sqlite`);
const result=spawnSync(process.execPath,['node_modules/emdash/dist/cli/index.mjs','content','update','magazine',current.id,'--rev',current._rev,'--file','scratch/resale-visual-update.json','--url','http://127.0.0.1:4321','--json'],{encoding:'utf8',maxBuffer:5*1024*1024});
if(result.status!==0)throw Error(result.stderr||result.stdout);
const updated=JSON.parse(result.stdout);
await backup(db,'seed/backup.sqlite');db.close();
console.log(JSON.stringify({status:updated.status,layout:updated.data.layout,blocks:updated.data.content.length}));
