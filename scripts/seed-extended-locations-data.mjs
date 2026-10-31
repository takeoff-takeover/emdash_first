// scripts/seed-extended-locations-data.mjs
// 川崎本社、MINI新百合ヶ丘、BMW新百合ヶ丘の詳細データを新個別フィールドに同期
import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';

const DB_PATH = '.wrangler/state/v3/d1/miniflare-D1DatabaseObject/c5f74f54de1b54dfe248af0cae042e755774e9e90fc1e7dc6e84e3d6d7130474.sqlite';

if (!fs.existsSync(DB_PATH)) {
	console.error('Database file not found at:', DB_PATH);
	process.exit(1);
}

const db = new DatabaseSync(DB_PATH);
console.log('[Seed Extended Data] Updating location records with individual fields...');

// 1. 川崎本社（Nicole BMW 本社）
const kawasakiData = {
	title: 'Nicole BMW 本社（川崎）',
	brand: 'BMW',
	facility_type: 'ショールーム ＆ 本社サービス工場',
	postal: '〒212-0005',
	address: '神奈川県川崎市幸区戸手2-5-7',
	tel: '044-511-2000',
	fax: '044-544-0100',
	office_notice: '同敷地内にニコル・グループ川崎本社オフィスを併設しております。一般のお客様向けのショールーム・新車商談・車検点検のご案内は本ショールームおよびサービスセンターにて承っております。',
	google_maps_url: 'https://maps.app.goo.gl/LRAu7RxGhwoWZJLk7',
	featured_image: JSON.stringify({
		src: '/uploads/2026/01/Nicole-BMW-本社.jpg',
		alt: 'Nicole BMW 本社（川崎） 外観'
	}),

	// 外観ギャラリー写真6点
	gallery_image_1: JSON.stringify({ src: '/uploads/2026/01/Nicole-BMW-本社.jpg', alt: 'Nicole BMW 本社 外観' }),
	gallery_caption_1: '国道1号線（第二京浜）沿いに面したNicole BMW 本社外観',
	gallery_image_2: JSON.stringify({ src: '/uploads/2026/01/Nicole-BMW-本社-1.jpg', alt: 'ショールーム内観' }),
	gallery_caption_2: '最新モデルを展示する開放的なメインショールーム',
	gallery_image_3: JSON.stringify({ src: '/uploads/2026/02/BMWサービスセンター.jpg', alt: '本社サービス工場' }),
	gallery_caption_3: 'BMW & MINIの車検・点検に対応する最新整備ベイ',
	gallery_image_4: JSON.stringify({ src: '/uploads/2026/02/NicoleBMW青葉宮前2025.jpg', alt: '展示フロア' }),
	gallery_caption_4: '最新CIに基づいた洗練された車両展示エリア',
	gallery_image_5: JSON.stringify({ src: '/uploads/2026/02/NicoleBMW大田支店2025.jpg', alt: 'オーナーズラウンジ' }),
	gallery_caption_5: '点検や商談の際にご利用いただける静謐なラウンジスペース',
	gallery_image_6: JSON.stringify({ src: '/uploads/2026/02/Nicole-BMW-横浜港北支店.jpg', alt: 'デリバリーエリア' }),
	gallery_caption_6: 'ご納車やお車の引き渡しを行う専用エリア',

	// 新車部門（Sales）
	sales_enabled: '1',
	sales_title: 'ショールーム（新車・試乗・ご商談）',
	sales_subtitle: 'Nicole BMW 本社',
	sales_tel: '044-511-2000',
	sales_hours: '10:00 〜 18:00',
	sales_closed: '水曜日（祝日の場合は営業）',
	sales_desc: '最新BMW全モデルの新車展示・ご試乗に対応。専任のプロダクト・ジーニアスが丁寧にご案内します。150kW超急速EV充電スタンドも完備。',
	sales_cta_label: '試乗・来場予約',
	sales_cta_url: 'https://form.bmw.co.jp/form/showroom/dealer/03110/index.html',

	// 中古車部門（川崎本社は新車・サービスメイン）
	used_enabled: '0',
	used_title: '',
	used_subtitle: '',
	used_tel: '',
	used_hours: '',
	used_closed: '',
	used_desc: '',
	used_cta_label: '',
	used_cta_url: '',

	// サービス部門（Service: BMW/ALPINA/MINI）
	service_enabled: '1',
	service_title: '本社サービスセンター（車検・点検・整備工場）',
	service_subtitle: 'Nicole BMW サービスセンター',
	service_tel: '044-522-1500',
	service_hours: '09:00 〜 18:00',
	service_closed: '水曜日（祝日を除く）',
	service_desc: '最新鋭テスターと専用リフトを備えた大型ワークショップ。BMWに加え、BMW ALPINAおよびMINIの正規車検・点検・重整備もワンストップで承ります。',
	service_cta_label: 'サービス入庫予約',
	service_cta_url: 'https://form.bmw.co.jp/form/service/dealer/03110/index.html',

	// アクセス案内
	access_car: '【東京方面より】国道1号線（第二京浜）を横浜方面へ直進。多摩川大橋を渡り約800m先左側。\n【横浜方面より】国道1号線を東京方面へ直進。「遠藤町」交差点を通過し約200m先右側。',
	access_train: 'JR川崎駅西口北バスターミナルより東急バス（反01系統 五反田駅行）乗車約10分、「戸手一丁目」バス停下車すぐ。',
};

// 2. MINI 新百合ヶ丘 / MINI NEXT 新百合ヶ丘（新車・認定中古車・サービスの混合拠点）
const miniShinyurigaokaData = {
	title: 'MINI 新百合ヶ丘 / MINI NEXT 新百合ヶ丘',
	brand: 'MINI',
	facility_type: '新車・MINI NEXT認定中古車・サービス連携',
	postal: '〒215-0023',
	address: '神奈川県川崎市麻生区片平1-5-11',
	tel: '044-959-3032',
	fax: '044-959-3033',
	office_notice: '',
	google_maps_url: 'https://maps.google.com/?q=MINI+新百合ヶ丘+神奈川県川崎市麻生区片平1-5-11',
	featured_image: JSON.stringify({
		src: '/uploads/2026/02/NicoleBMW新百合ヶ丘2025-2-1024x682.jpg',
		alt: 'MINI 新百合ヶ丘 / MINI NEXT 新百合ヶ丘 外観'
	}),

	// 外観ギャラリー写真6点
	gallery_image_1: JSON.stringify({ src: '/uploads/2026/02/NicoleBMW新百合ヶ丘2025-2-1024x682.jpg', alt: 'MINI新百合ヶ丘 外観' }),
	gallery_caption_1: '新百合ヶ丘の開放的な景観に映えるMINI最新CIショールーム外観',
	gallery_image_2: JSON.stringify({ src: '/uploads/2026/02/NicoleBMW新百合ヶ丘2025-1024x682.jpg', alt: 'MINI NEXT展示場' }),
	gallery_caption_2: '厳選された高品質なMINI認定中古車が並ぶMINI NEXT専用展示コーナー',
	gallery_image_3: JSON.stringify({ src: '/uploads/2026/02/BMW_MINI_BPS_MININEXT新百合ヶ丘2025-1024x682.jpg', alt: '新百合ヶ丘総合パーク全景' }),
	gallery_caption_3: 'BMWとMINIの新車・中古車が集結する広大な総合パーク全景',
	gallery_image_4: JSON.stringify({ src: '/uploads/2026/02/MINI-横浜都筑.jpg', alt: 'ショールーム展示' }),
	gallery_caption_4: 'カラフルで個性あふれる最新MINIモデルの展示フロア',
	gallery_image_5: JSON.stringify({ src: '/uploads/2026/02/MINI-港北.jpg', alt: '商談ラウンジ' }),
	gallery_caption_5: 'リラックスして愛車のカスタマイズをご相談いただけるラウンジスペース',
	gallery_image_6: JSON.stringify({ src: '/uploads/2026/02/BMWサービスセンター.jpg', alt: 'サービスベイ' }),
	gallery_caption_6: '専用診断機による精密な点検を実施する認証サービスファクトリー',

	// 新車部門（Sales）
	sales_enabled: '1',
	sales_title: 'MINI 新車ショールーム',
	sales_subtitle: 'MINI 新百合ヶ丘',
	sales_tel: '044-959-3032',
	sales_hours: '10:00 〜 18:00',
	sales_closed: '火曜日・水曜日（祝日を除く）',
	sales_desc: '最新世代MINIファミリーの各モデルを常時展示。多彩なボディカラーやインテリアトリムを実際にご覧いただけます。',
	sales_cta_label: 'MINI試乗予約',
	sales_cta_url: 'https://secure-p2.mini.jp/mini/jsf/testdrive/index.jsf',

	// 中古車部門（Used）
	used_enabled: '1',
	used_title: 'MINI 認定中古車（MINI NEXT 新百合ヶ丘）',
	used_subtitle: 'MINI NEXT 新百合ヶ丘',
	used_tel: '044-396-0180',
	used_hours: '10:00 〜 18:00',
	used_closed: '火曜日・水曜日（祝日を除く）',
	used_desc: '厳格な納車前点検と手厚い保証が付帯した安心のMINI認定中古車を豊富に展示。ライフスタイルに合わせた1台をご提案します。',
	used_cta_label: 'MINI認定中古車を見る',
	used_cta_url: 'https://www.carsensor.net/shop/kanagawa/204859005/',

	// サービス部門（Service）
	service_enabled: '1',
	service_title: 'MINI サービス・車検点検ファクトリー',
	service_subtitle: 'Nicole BMW 新百合ヶ丘支店',
	service_tel: '044-959-3032',
	service_hours: '10:00 〜 18:00（サービス受付 17:30まで）',
	service_closed: '火曜日・水曜日（祝日を除く）',
	service_desc: '敷地内併設の整備工場にてMINI専門メカニックが車検・定期点検・修理に対応。純正パーツを使用した確実な整備をお約束します。',
	service_cta_label: 'MINIサービス予約',
	service_cta_url: 'https://secure-p2.mini.jp/mini/jsf/service/index.jsf',

	// 同一敷地内リンク
	related_hub_title: 'Nicole BMW 新百合ヶ丘支店',
	related_hub_url: '/location/nicole-bmw-shinyurigaoka/',
	related_hub_desc: '同敷地内にNicole BMW 新車ショールームおよびBMW Premium Selection認定中古車センターを併設しております。BMWをご覧のお客様はこちらをご確認ください。',

	// アクセス案内
	access_car: '世田谷通り（津久井道）を町田・相模原方面へ直進。「片平2丁目」交差点至近、右手に見える複合拠点へお入りください。',
	access_train: '小田急小田原線・多摩線「新百合ヶ丘駅」北口より徒歩約15分、または小田急多摩線「五月台駅」より徒歩約8分。',
};

// 3. Nicole BMW 新百合ヶ丘支店（BMW新車・BPS認定中古車・サービスの混合拠点）
const bmwShinyurigaokaData = {
	title: 'Nicole BMW 新百合ヶ丘支店',
	brand: 'BMW',
	facility_type: '新車ショールーム・BMW認定中古車・サービス工場',
	postal: '〒215-0023',
	address: '神奈川県川崎市麻生区片平1-5-11',
	tel: '044-959-1400',
	fax: '044-959-1401',
	office_notice: '',
	google_maps_url: 'https://maps.google.com/?q=Nicole+BMW+新百合ヶ丘支店+神奈川県川崎市麻生区片平1-5-11',
	featured_image: JSON.stringify({
		src: '/uploads/2026/02/BMW_MINI_BPS_MININEXT新百合ヶ丘2025-1-1024x682.jpg',
		alt: 'Nicole BMW 新百合ヶ丘支店 外観'
	}),

	// 外観ギャラリー写真6点
	gallery_image_1: JSON.stringify({ src: '/uploads/2026/02/BMW_MINI_BPS_MININEXT新百合ヶ丘2025-1-1024x682.jpg', alt: 'BMW新百合ヶ丘 外観' }),
	gallery_caption_1: '新百合ヶ丘の広大な敷地に広がるBMW正規ショールーム外観',
	gallery_image_2: JSON.stringify({ src: '/uploads/2026/02/BMW_MINI_BPS_MININEXT新百合ヶ丘2025-1024x682.jpg', alt: 'BPS認定中古車展示場' }),
	gallery_caption_2: '厳格な検査基準をクリアしたBMW認定中古車が並ぶ屋外展示エリア',
	gallery_image_3: JSON.stringify({ src: '/uploads/2026/02/NicoleBMW新百合ヶ丘2025-2-1024x682.jpg', alt: 'MINI併設エリア' }),
	gallery_caption_3: '同敷地内で一体展開するMINI新百合ヶ丘ショールーム',
	gallery_image_4: JSON.stringify({ src: '/uploads/2026/02/1000019794.jpg', alt: 'メインショールーム内観' }),
	gallery_caption_4: '最新のBMWモデルを心ゆくまでご覧いただける明るい展示空間',
	gallery_image_5: JSON.stringify({ src: '/uploads/2026/02/1000019793.jpg', alt: 'コンサルティングエリア' }),
	gallery_caption_5: 'お客様一人ひとりに合わせたご提案を行う商談ラウンジ',
	gallery_image_6: JSON.stringify({ src: '/uploads/2026/02/BMWサービスセンター.jpg', alt: '最新サービス工場' }),
	gallery_caption_6: 'BMW専任テクニシャンが常駐する最新鋭のワークショップ',

	// 新車部門（Sales）
	sales_enabled: '1',
	sales_title: 'BMW 新車ショールーム',
	sales_subtitle: 'Nicole BMW 新百合ヶ丘支店',
	sales_tel: '044-959-1400',
	sales_hours: '10:00 〜 18:00',
	sales_closed: '火曜日・水曜日（祝日を除く）',
	sales_desc: '最新BMW全モデルの新車展示・ご試乗に対応。ゆったりとした空間で専任コンサルタントがライフスタイルに最適な一台をご提案します。',
	sales_cta_label: '試乗・来場予約',
	sales_cta_url: 'https://form.bmw.co.jp/form/showroom/dealer/03110/index.html',

	// 中古車部門（Used）
	used_enabled: '1',
	used_title: 'BMW Premium Selection 新百合ヶ丘（認定中古車）',
	used_subtitle: 'BMW Premium Selection 新百合ヶ丘',
	used_tel: '044-396-0180',
	used_hours: '10:00 〜 18:00',
	used_closed: '火曜日・水曜日（祝日を除く）',
	used_desc: '360度点検と充実の保証が付帯したBMW認定中古車を常時多数展示。最新モデルから希少グレードまで幅広く取り揃えています。',
	used_cta_label: '認定中古車を見る',
	used_cta_url: 'https://www.carsensor.net/shop/kanagawa/204859005/',

	// サービス部門（Service: BMW/ALPINA/MINI）
	service_enabled: '1',
	service_title: 'BMW / MINI サービスファクトリー',
	service_subtitle: 'Nicole BMW 新百合ヶ丘支店',
	service_tel: '044-959-1400',
	service_hours: '10:00 〜 18:00（サービス受付 17:30まで）',
	service_closed: '火曜日・水曜日（祝日を除く）',
	service_desc: '最新のテスター機器を完備し、BMW、BMW ALPINA、MINIの車検・点検・整備に対応。安心の正規ディーラークオリティをお届けします。',
	service_cta_label: 'サービス入庫予約',
	service_cta_url: 'https://form.bmw.co.jp/form/service/dealer/03110/index.html',

	// 同一敷地内リンク
	related_hub_title: 'MINI 新百合ヶ丘 / MINI NEXT 新百合ヶ丘',
	related_hub_url: '/location/mini-shinyurigaoka/',
	related_hub_desc: '同敷地内にMINI正規新車ショールームおよびMINI NEXT認定中古車センターを併設しております。MINIをご覧のお客様はこちらをご確認ください。',

	// アクセス案内
	access_car: '世田谷通り（津久井道）を町田・相模原方面へ直進。「片平2丁目」交差点至近、右手に見える複合拠点へお入りください。',
	access_train: '小田急小田原線・多摩線「新百合ヶ丘駅」北口より徒歩約15分、または小田急多摩線「五月台駅」より徒歩約8分。',
};

function updateLocation(slug, data) {
	const keys = Object.keys(data);
	const setClauses = keys.map(k => `"${k}" = ?`).join(', ');
	const values = keys.map(k => data[k]);
	values.push(slug);

	const sql = `UPDATE ec_locations SET ${setClauses}, updated_at = datetime('now') WHERE slug = ?`;
	const result = db.prepare(sql).run(...values);
	console.log(`Updated ${slug}: ${result.changes} row(s) affected.`);
}

updateLocation('nicole-bmw-kawasaki', kawasakiData);
updateLocation('mini-shinyurigaoka', miniShinyurigaokaData);
updateLocation('nicole-bmw-shinyurigaoka', bmwShinyurigaokaData);

console.log('[Seed Extended Data] All 3 hubs successfully updated in D1 database.');
