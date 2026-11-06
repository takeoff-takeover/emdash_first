import fs from 'node:fs';
import { spawnSync } from 'node:child_process';

// Local CMS only. Keep the source payload in version control for reproduction.
const base = 'http://localhost:4321';
const slug = 'bmw-alpina-nardo-high-speed-testing';
const source = 'https://newsroom.bmwgroup.com/global/first-bmw-alpina-production-model-undergoes-high-speed-testing-in-nardo-italy/';
const assets = [
  ['863', '6ef8f8d3-544d-4872-ba81-e472ccbad96b', 'ナルドのテストコースを走る、カモフラージュ姿のBMW ALPINA。'],
  ['868', '1c426321-9df1-4dac-8b6d-f3425c0cd68a', '広い高速テストコースで、車両全体の調和を確かめる。'],
  ['864', '7e693935-77bf-478b-bdf6-b7ccff24eed2', '開発車両を正面から捉えた一枚。ボディはまだ偽装に覆われている。'],
  ['867', '1fe2f7e0-2c94-49cb-902b-b701f8be4d06', '高速域での落ち着いた走りを追求するBMW ALPINAのテスト車両。'],
  ['866', '414db035-1971-4d4b-9894-c6ae92c1fde9', 'サイドから見た開発車両。ナルドで走行テストを重ねる。'],
];
const image = n => `/uploads/bmw-alpina-nardo/DI26_000480${n}.jpg`;
let key = 0;
const block = (text, style = 'normal') => ({ _type: 'block', _key: `alpina-${++key}`, style, markDefs: [], children: [{ _type: 'span', _key: `span-${key}`, text, marks: [] }] });
const data = {
  title: 'BMW ALPINA、ナルドで300km/h超の高速テスト。初の量産モデルが見せる新章',
  excerpt: '2026年11月3日、BMW Groupが開発の様子を公開。速さと快適性を両立するBMW ALPINA初の量産モデルが、イタリア・ナルドの高速コースを駆け抜けました。',
  featured_image: { src: image('863'), alt: assets[0][2] },
  layout: '2col',
  content: [
    block('速さと快適性を、ひとつの走りに', 'h2'),
    block('BMW Groupは2026年11月3日、BMW ALPINA初の量産モデルの高速テストを公開しました。舞台は南イタリア・ナルドの全長12.6kmのコース。偽装姿の開発車両が300km/hを超えて加速する様子を紹介しています。'),
    { _type: 'editorial-tools:slider', _key: 'alpina-nardo-gallery', id: image('863'), images: assets.slice(1).map(([n]) => image(n)).join('\n'), captions: assets.map(a => a[2]).join('\n'), gallery_style: 'filmstrip' },
    block('最高速だけでは語れない、ALPINAの流儀', 'h2'),
    block('掲げるのは「Speed, not Sport」。V8エンジンの力強さに、快適な足回りと空力性能を調和させ、高速域でも自然で安定した走りを目指します。長距離を余裕をもって移動するための性能です。'),
    block('伝統のディテールを、次の時代へ', 'h2'),
    block('20本スポークの軽合金ホイールには専用タイヤを組み合わせ、タイヤ内部の追加フォーム層で快適性と精度を追求。楕円形の4本出しテールパイプも継承します。エンジンと変速機の制御を専用に調整し、滑らかな力の引き出し方を磨いています。'),
    block('今回の発表は開発段階の紹介です。正式なモデル名や日本での発売時期・価格は、このリリースでは公表されていません。'),
    block('出典・写真', 'h2'),
    { _type: 'block', _key: 'alpina-source', style: 'normal', markDefs: [{ _type: 'link', _key: 'source-link', href: source }], children: [{ _type: 'span', _key: 'source-text', text: 'BMW Group公式発表：初のBMW ALPINA量産モデル、ナルドで高速テスト（2026年11月3日）', marks: ['source-link'] }] },
    block('本文は公式発表をもとに日本語で要約・編集。写真：BMW Group。報道・編集用途で提供された公式写真を使用しています。'),
  ],
};
fs.writeFileSync('seed/article-bmw-alpina-nardo.json', JSON.stringify(data, null, 2) + '\n');
fs.writeFileSync('public/uploads/bmw-alpina-nardo/sources.json', JSON.stringify({ source, releaseDate: '2026-11-03', credit: 'BMW Group', usage: 'For editorial media use only.', images: assets.map(([n, uuid, alt]) => ({ file: `DI26_000480${n}.jpg`, alt, source: `https://content.presspage.com/uploads/3228/${uuid}/DI26_000480${n}.jpg?10000` })) }, null, 2) + '\n');
const cli = (...args) => {
  const result = spawnSync(process.execPath, ['node_modules/emdash/dist/cli/index.mjs', ...args, '--url', base, '--json'], { encoding: 'utf8' });
  if (result.status !== 0) throw Error(result.stderr || result.stdout);
  return JSON.parse(result.stdout);
};
const existing = cli('content', 'list', 'magazine', '--limit', '100');
const prior = existing.items.find(item => item.slug === slug);
// A retry only completes taxonomy assignment; it never overwrites article edits.
const created = prior || cli('content', 'create', 'magazine', '--file', 'seed/article-bmw-alpina-nardo.json', '--slug', slug);
const id = created.id || created.item?.id;
if (!id) throw Error('Missing created entry ID');
const auth = await fetch(`${base}/_emdash/api/auth/dev-bypass`);
if (!auth.ok) throw Error('Local dev authentication failed');
const cookie = auth.headers.getSetCookie().map(c => c.split(';')[0]).join('; ');
for (const [taxonomy, term] of [['brand', 'term_brand_alpina'], ['category', 'term_mag_cars']]) {
  const response = await fetch(`${base}/_emdash/api/content/magazine/${id}/terms/${taxonomy}`, { method: 'POST', headers: { Cookie: cookie, 'Content-Type': 'application/json', 'X-EmDash-Request': '1', Origin: base }, body: JSON.stringify({ termIds: [term] }) });
  if (!response.ok) throw Error(`Taxonomy assignment failed: ${await response.text()}`);
}
console.log(JSON.stringify({ id, slug, url: `${base}/magazine/${slug}/`, status: created.status }));
