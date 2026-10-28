import fs from 'fs';

function updateSlugFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');

  // 1. staticArticlesCatalog に 2027_new_bmw_ix4_neue_klasse を追加
  const ix4CatalogEntry = `	"2027_new_bmw_ix4_neue_klasse": {
		data: {
			title: "【公式発表】新型BMW iX4登場。次世代EV専用『ノイエ・クラッセ』SACが切り拓く航続828kmの新時代",
			excerpt: "BMW公式プレスリリースより完全電動スポーツ・アクティビティ・クーペ『BMW iX4』が世界初公開。Cd値0.23の流麗なファストバック、最大出力612馬力のM60 xDrive、そして最大828kmの航続性能を誇る新世代SAC。",
			featured_image: "/uploads/ix4/key-visual.svg",
			published_at: "2026-10-28T10:00:00.000Z",
			related_location: "nicole-bmw-kawasaki",
			content: [
				{
					_type: "block",
					style: "normal",
					children: [
						{ _type: "span", text: "BMW Groupは、次世代EV専用アーキテクチャ「ノイエ・クラッセ（Neue Klasse）」をベースにした初のスポーツ・アクティビティ・クーペ（SAC）、『新型BMW iX4』を公式発表しました。流麗なファストバック・シルエットと、クラス最高峰の空力性能（Cd値0.23）を高次元で両立。新世代円筒形バッテリーセルと800V超急速充電アーキテクチャを搭載し、一充電での航続距離は最大828km（WLTP）に達します。" }
					]
				},
				{
					_type: "block",
					style: "h2",
					children: [
						{ _type: "span", text: "1. BMW公式プレスリリース引用（Document ID: T0461402EN）" }
					]
				},
				{
					_type: "block",
					style: "blockquote",
					children: [
						{ _type: "span", text: "“Extrovert, unmistakable and fully electric, the new BMW iX4 is the next Neue Klasse model from BMW. Like its Neue Klasse siblings, the new Sports Utility Vehicle in coupé form represents a technological leap forward into a new era. At the same time, the BMW iX4 showcases its own, particularly expressive interpretation of the reduced-to-the-essential Neue Klasse design. Its dynamic looks underscore the car’s clear sporting instincts ...”\\n── BMW Group Official Press Release (T0461402EN)\\n\\n【日本語公式要約】「外向的で、唯一無二、そして完全電動。新型BMW iX4は、BMWが放つ『ノイエ・クラッセ』の次なるマイルストーンです。他のノイエ・クラッセ兄弟車と同様に、このクーペスタイルのスポーツ・ユーティリティ・ビークル（SAC）は新時代への技術的な大躍進を体現しています。同時にBMW iX4は、本質へと研ぎ澄まされたノイエ・クラッセのデザイン言語を、独自の極めてエモーショナルな造形として昇華させました。そのダイナミックなプロポーションは、このクルマが秘めた明確なスポーツ本能を物語っています。」" }
					]
				},
				{
					_type: "block",
					style: "h2",
					children: [
						{ _type: "span", text: "2. 主要モデルラインナップ ＆ パワートレイン比較" }
					]
				},
				{
					_type: "block",
					style: "normal",
					children: [
						{ _type: "span", text: "新型iX4は、ユーザーの航続距離や走行性能ニーズに応える3つのバリエーションを用意。最上位の『iX4 M60 xDrive』は最高出力612馬力・最大トルク875Nmを誇り、0-100km/h加速わずか3.4秒をマークします。一方の『iX4 50 xDrive』は、大容量108.7kWhバッテリーを搭載し、驚異的な最大828kmの航続距離を実現しました。" }
					]
				},
				{
					_type: "block",
					style: "h2",
					children: [
						{ _type: "span", text: "3. 空力性能と実用性の融合：Cd値0.23と広大なキャビン" }
					]
				},
				{
					_type: "block",
					style: "normal",
					children: [
						{ _type: "span", text: "ボディ表面とフラッシュサーフェス化された自動格納ドアハンドル、エアロダイナミックホイール、そしてフロア下のフラットカバーにより、クーペSUVとして異例のCd値0.23を達成。2,950mmのロングホイールベースとEV専用フラットフロアにより、流麗なクーペフォルムでありながら後席のヘッドクリアランスとレッグルームを十分に確保。トランク容量も通常時515Lから最大1,560Lまで拡張可能です。" }
					]
				},
				{
					_type: "block",
					style: "h2",
					children: [
						{ _type: "span", text: "4. Nicole BMW 各ショールームでのご案内" }
					]
				},
				{
					_type: "block",
					style: "normal",
					children: [
						{ _type: "span", text: "2027年春より開始されるグローバルデリバリーに先立ち、Nicole BMW（川崎本社・大田・新百合ヶ丘・都筑等）におきまして、新型BMW iX4の日本導入に関する最新情報の先行ご案内、ならびにプレオーダー優先相談の受付を開始いたします。高電圧EVマイスターが常駐する万全の体制でお迎えいたします。" }
					]
				}
			]
		}
	},`;

  if (!content.includes('2027_new_bmw_ix4_neue_klasse')) {
    content = content.replace('const staticArticlesCatalog: Record<string, any> = {', 'const staticArticlesCatalog: Record<string, any> = {\n' + ix4CatalogEntry);
  }

  // 2. isIX4 の判定追加
  const targetIsLogic = 'const isBMWX5 = slug.includes("bmw_x5") || slug.includes("x5");';
  const newIsLogic = `const isIX4 = slug.includes("ix4");
const isBMWX5 = slug.includes("bmw_x5") || slug.includes("x5");`;
  if (!content.includes('const isIX4 =')) {
    content = content.replace(targetIsLogic, newIsLogic);
    content = content.replace(
      'const isDemoArticle = isBMWX5 || isNeueKlasse || slug === "202608_bmw_kids_mechanic";',
      'const isDemoArticle = isIX4 || isBMWX5 || isNeueKlasse || slug === "202608_bmw_kids_mechanic";'
    );
    content = content.replace(
      'const heroImageUrl = getImageUrl(featuredImage) || (isBMWX5 ?',
      'const heroImageUrl = getImageUrl(featuredImage) || (isIX4 ? "/uploads/ix4/key-visual.svg" : (isBMWX5 ?'
    );
    // 閉じカッコ調整
    content = content.replace(
      ': "/uploads/2026/08/DSC5134.jpg"));',
      ': "/uploads/2026/08/DSC5134.jpg")));'
    );
  }

  // 3. ix4Gallery 定義（全15点：EXTERIOR 10枚 ＋ INTERIOR 5枚）
  const ix4GalleryBlock = `
// 新型BMW iX4 ギャラリー（EXTERIOR 10枚 ＋ インテリア 5枚＝計15枚）
// ルール準拠：余計な見出しやカテゴリプレフィックスを排除し、シンプルなタイトルと解説のみでミニマルに表示
const ix4Gallery = [
	// EXTERIOR (10枚)
	{
		title: "Iconic Glowキドニーグリル ＆ 一体型LEDライト",
		caption: "ノイエ・クラッセの象徴である一体型発光キドニーグリルとスリムLEDヘッドライトシグネチャー。",
		image: "/uploads/ix4/ext-01-front-mask.svg"
	},
	{
		title: "ファストバック・クーペシルエット ＆ ホフマイスター・キンク",
		caption: "流麗なルーフラインと力強いショルダーラインが融合した新世代スポーツ・アクティビティ・クーペの造形。",
		image: "/uploads/ix4/ext-02-side-profile.svg"
	},
	{
		title: "立体LEDリヤライトバー ＆ ダックテールスポイラー",
		caption: "車幅いっぱいに広がる3次元リヤライトバーと、空力性能を高めるインテグレーテッド・ダックテール。",
		image: "/uploads/ix4/ext-03-rear-quarter.svg"
	},
	{
		title: "Cd値0.23を達成したエアロダイナミクス設計",
		caption: "自動格納式フラッシュドアハンドルと整流エアカーテンによるクラストップレベルの空力性能。",
		image: "/uploads/ix4/ext-04-aerodynamics.svg"
	},
	{
		title: "シームレス・フルパノラマ・ガラスルーフ",
		caption: "フロントガラスからリヤまで継ぎ目なく広がる高断熱・UVカット仕様のフルパノラマルーフ。",
		image: "/uploads/ix4/ext-05-glass-roof.svg"
	},
	{
		title: "21インチ軽量エアロダイナミック・アロイホイール",
		caption: "航続距離延伸に貢献する空力最適化デザインと低転がり抵抗パフォーマンスタイヤ。",
		image: "/uploads/ix4/ext-06-wheels.svg"
	},
	{
		title: "iX4 M60 xDrive専用フロントエプロン ＆ Mバッジ",
		caption: "最高出力612馬力を冷却するグロスブラック・ロアインテークとMエンブレム。",
		image: "/uploads/ix4/ext-07-m60-front.svg"
	},
	{
		title: "レーシング直系リヤ・ベンチュリディフューザー（M60）",
		caption: "車体下面の気流を整流し、アウトバーンでの超高速走行安定性を飛躍的に高める専用ディフューザー。",
		image: "/uploads/ix4/ext-08-m60-diffuser.svg"
	},
	{
		title: "ウェルカム・ライティングプロジェクション演出",
		caption: "UWBスマートフォンキーを持ったドライバー接近時にドアミラー下部から美しく広がる光の演出。",
		image: "/uploads/ix4/ext-09-lighting-dance.svg"
	},
	{
		title: "アルプス山岳路での四輪駆動ダイナミック走行テスト",
		caption: "標高2,500mのワインディングで鍛え上げられたデュアルモーターxDriveの圧倒的トラクションと旋回性。",
		image: "/uploads/ix4/ext-10-dynamic-drive.svg"
	},
	// INTERIOR (5枚)
	{
		title: "BMWパノラミック・ビジョン（フロントガラス全幅投影）",
		caption: "フロントガラス下部全幅に車速やルート案内、運転支援状況を高コントラストに投影する次世代HUD。",
		image: "/uploads/ix4/int-01-panoramic-vision.svg"
	},
	{
		title: "ドライバー中心のピュア・ミニマルキャビン",
		caption: "不要な物理スイッチを排し、音声操作とタッチへ統合された現代的ラグジュアリー空間。",
		image: "/uploads/ix4/int-02-cockpit-minimal.svg"
	},
	{
		title: "幾何学的センターディスプレイ ＆ BMW OS X",
		caption: "生成AIアシスタントとゼロレイヤー操作系を備えたパラレログラム形状のセンタータッチスクリーン。",
		image: "/uploads/ix4/int-03-central-display.svg"
	},
	{
		title: "サステナブル・ヴィーガンレザースポーツシート",
		caption: "植物由来素材と海洋リサイクルファブリックを採用したベンチレーション・マッサージ機能付きシート。",
		image: "/uploads/ix4/int-04-seats-sustainable.svg"
	},
	{
		title: "エグゼクティブ後席ラウンジ ＆ 515〜1,560Lラゲッジ",
		caption: "2,950mmのロングホイールベースが生み出す広大な足元空間と、多彩なシートアレンジによる大容量トランク。",
		image: "/uploads/ix4/int-05-rear-lounge.svg"
	}
];
`;

  if (!content.includes('const ix4Gallery =')) {
    content = content.replace('const x5Gallery = [', ix4GalleryBlock + '\nconst x5Gallery = [');
  }

  // currentGallery の更新
  content = content.replace(
    'const currentGallery = isBMWX5 ? x5Gallery : (isNeueKlasse ? neueKlasseGallery : kidsGallery);',
    'const currentGallery = isIX4 ? ix4Gallery : (isBMWX5 ? x5Gallery : (isNeueKlasse ? neueKlasseGallery : kidsGallery));'
  );

  // 4. タイトルセグメント getTitleSegments
  const ix4TitleCheck = `	if (rawTitle.includes("iX4") || rawTitle.includes("BMW iX4")) {
		return [
			{ text: "【公式発表】新型BMW iX4登場。", class: "title-phrase" },
			{ text: "次世代EV専用『ノイエ・クラッセ』SACが切り拓く", class: "title-phrase" },
			{ text: "航続828kmの新時代", class: "title-phrase" }
		];
	}`;

  if (!content.includes('rawTitle.includes("iX4")') && content.includes('function getTitleSegments(rawTitle: string) {')) {
    content = content.replace('function getTitleSegments(rawTitle: string) {', 'function getTitleSegments(rawTitle: string) {\n' + ix4TitleCheck);
  }

  // 5. 本文内のスペック表挿入（isIX4の場合にリッチなモノトーンテーブルを表示）
  const specTableBlock = `
				<!-- 新型iX4専用：主要スペック・諸元表（モノトーン・ミニマルデザイン） -->
				{isIX4 && (
					<section class="ix4-spec-tables-section">
						<div class="spec-table-block">
							<h3 class="spec-table-heading">新型BMW iX4 主要パワートレイン諸元</h3>
							<div class="spec-table-responsive">
								<table class="monotone-spec-table">
									<thead>
										<tr>
											<th>モデル</th>
											<th>駆動方式</th>
											<th>最高出力 / トルク</th>
											<th>バッテリー (Net)</th>
											<th>航続距離 (WLTP)</th>
											<th>0-100km/h加速</th>
											<th>最大急速充電</th>
										</tr>
									</thead>
									<tbody>
										<tr>
											<td class="model-name">BMW iX4 40 xDrive</td>
											<td>前後2モーター 4WD</td>
											<td>275 kW (374 hp) / 540 Nm</td>
											<td>82.6 kWh</td>
											<td>最大 638 km</td>
											<td>5.4 秒</td>
											<td>300 kW (800V)</td>
										</tr>
										<tr class="highlight-row">
											<td class="model-name">BMW iX4 50 xDrive</td>
											<td>前後2モーター 4WD</td>
											<td>345 kW (469 hp) / 670 Nm</td>
											<td>108.7 kWh</td>
											<td class="range-strong">最大 828 km</td>
											<td>4.6 秒</td>
											<td>400 kW (800V)</td>
										</tr>
										<tr>
											<td class="model-name">BMW iX4 M60 xDrive</td>
											<td>M専用前後2モーター 4WD</td>
											<td>450 kW (612 hp) / 875 Nm</td>
											<td>108.7 kWh</td>
											<td>最大 654 km</td>
											<td>3.4 秒</td>
											<td>400 kW (800V)</td>
										</tr>
									</tbody>
								</table>
							</div>
						</div>

						<div class="spec-table-block" style="margin-top: 40px;">
							<h3 class="spec-table-heading">車両ディメンション ＆ 実用性能</h3>
							<div class="spec-table-responsive">
								<table class="monotone-spec-table">
									<thead>
										<tr>
											<th>項目</th>
											<th>数値 / 仕様</th>
											<th>特徴・備考</th>
										</tr>
									</thead>
									<tbody>
										<tr>
											<td class="model-name">全長 × 全幅 × 全高</td>
											<td>4,780 mm × 1,920 mm × 1,620 mm</td>
											<td>流麗なスポーツ・アクティビティ・クーペ（SAC）プロポーション</td>
										</tr>
										<tr>
											<td class="model-name">ホイールベース</td>
											<td>2,950 mm</td>
											<td>EV専用フラットフロア設計により大人がゆったり寛げる後席空間</td>
										</tr>
										<tr>
											<td class="model-name">空気抵抗係数 (Cd値)</td>
											<td>0.23</td>
											<td>自動格納ドアハンドルやフルアンダーカバーによるクラス最高峰の空力</td>
										</tr>
										<tr>
											<td class="model-name">トランク積載容量</td>
											<td>515 L 〜 最大 1,560 L</td>
											<td>40:20:40分割可倒式リヤシートによる高い積載性</td>
										</tr>
										<tr>
											<td class="model-name">10分間急速充電回復量</td>
											<td>約 300 km 以上</td>
											<td>第6世代800V超急速充電アーキテクチャによるストレスフリーな移動</td>
										</tr>
									</tbody>
								</table>
							</div>
						</div>
					</section>
				)}
`;

  if (!content.includes('class="ix4-spec-tables-section"')) {
    content = content.replace(
      '<div class="article-rich-text prose prose-invert">\n\t\t\t\t\t<PortableText value={post.data.content} components={portableTextComponents} />\n\t\t\t\t</div>',
      '<div class="article-rich-text prose prose-invert">\n\t\t\t\t\t<PortableText value={post.data.content} components={portableTextComponents} />\n\t\t\t\t</div>\n' + specTableBlock
    );
  }

  // 6. アコーディオン（FAQ）の追加
  const ix4AccordionBlock = `							{isIX4 ? (
								<>
									<details class="accordion-item" open>
										<summary class="accordion-summary">
											<span>1. BMW iX4の日本発売時期や予約受付はいつからですか？</span>
											<span class="accordion-icon">+</span>
										</summary>
										<div class="accordion-content">
											<p>グローバル市場では2027年3月より順次デリバリーが開始され、日本市場へは2027年内の導入が予定されています。Nicole BMW各ショールーム（川崎本社・大田・新百合ヶ丘・都筑等）にて、最新情報の配信および先行購入相談を承っております。</p>
										</div>
									</details>

									<details class="accordion-item">
										<summary class="accordion-summary">
											<span>2. ガソリン車やマイルドハイブリッド車の設定はありますか？</span>
											<span class="accordion-icon">+</span>
										</summary>
										<div class="accordion-content">
											<p>新型iX4は、次世代EV専用プラットフォーム「ノイエ・クラッセ（Neue Klasse）」に基づいて開発された完全電気自動車（BEV）専用モデルです。内燃機関モデルの設定はなく、ピュアEV専用設計ならではの低重心パッケージングと最大828kmの圧倒的な航続距離を実現しています。</p>
										</div>
									</details>

									<details class="accordion-item">
										<summary class="accordion-summary">
											<span>3. 一充電での航続距離と充電時間はどのくらいですか？</span>
											<span class="accordion-icon">+</span>
										</summary>
										<div class="accordion-content">
											<p>「iX4 50 xDrive」で最大828km（WLTP）、「iX4 40 xDrive」で最大638kmを達成しています。800V高電圧充電システムの採用により、最大300kW〜400kWのDC超急速充電に対応。わずか10分間の充電で約300km以上の航続距離を回復可能です。</p>
										</div>
									</details>

									<details class="accordion-item">
										<summary class="accordion-summary">
											<span>4. クーペフォルムですが、後席の居住性やトランク容量は実用的ですか？</span>
											<span class="accordion-icon">+</span>
										</summary>
										<div class="accordion-content">
											<p>新世代EV専用のフラットフロア構造と2,950mmのロングホイールベースにより、美しいファストバックルーフを描きながらも大人がゆったり乗車できる後席クリアランスを確保しています。トランク容量も通常時515L、後席可倒時最大1,560Lと高い積載力を誇ります。</p>
										</div>
									</details>

									<details class="accordion-item">
										<summary class="accordion-summary">
											<span>5. 「BMW Panoramic Vision」とはどのような機能ですか？</span>
											<span class="accordion-icon">+</span>
										</summary>
										<div class="accordion-content">
											<p>従来のメーターパネルの概念を一新し、フロントガラス下部全幅（ピラーからピラーまで）に走行速度、ナビゲーション、ADAS運転支援情報を高コントラストに直接投影する次世代ヘッドアップディスプレイです。ドライバーは視線を外すことなく直感的な操作が可能です。</p>
										</div>
									</details>
								</>
							) : `;

  if (!content.includes('isIX4 ? (')) {
    content = content.replace('{isBMWX5 ? (', ix4AccordionBlock + '{isBMWX5 ? (');
    content = content.replace(
      '{isBMWX5 ? "新型BMW X5 主要諸元・パワートレイン詳細" :',
      '{isIX4 ? "新型BMW iX4 主要諸元 ＆ よくあるご質問（FAQ）" : (isBMWX5 ? "新型BMW X5 主要諸元・パワートレイン詳細" :'
    );
    // 閉じカッコ調整
    content = content.replace(
      ': "イベント概要・詳細情報")}',
      ': "イベント概要・詳細情報"))}'
    );
  }

  // 7. スタイル（モノトーンスペックテーブルのCSS）を追加
  const tableStyles = `
	/* 新型iX4：モノトーン・スペックテーブル */
	.ix4-spec-tables-section {
		margin: 48px 0;
	}
	.spec-table-heading {
		font-family: var(--font-heading, inherit);
		font-size: 1.25rem;
		font-weight: 600;
		color: #ffffff;
		margin-bottom: 16px;
		letter-spacing: -0.01em;
	}
	.spec-table-responsive {
		width: 100%;
		overflow-x: auto;
		-webkit-overflow-scrolling: touch;
		background: #0f0f13;
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 4px;
	}
	.monotone-spec-table {
		width: 100%;
		border-collapse: collapse;
		font-size: 0.875rem;
		color: #d4d4d8;
		text-align: left;
	}
	.monotone-spec-table th {
		background: #18181f;
		color: #ffffff;
		font-weight: 600;
		padding: 14px 18px;
		border-bottom: 1px solid rgba(255, 255, 255, 0.15);
		white-space: nowrap;
		letter-spacing: 0.03em;
		font-size: 0.8125rem;
		text-transform: uppercase;
	}
	.monotone-spec-table td {
		padding: 14px 18px;
		border-bottom: 1px solid rgba(255, 255, 255, 0.06);
		white-space: nowrap;
	}
	.monotone-spec-table tbody tr:hover {
		background: rgba(255, 255, 255, 0.02);
	}
	.monotone-spec-table .model-name {
		font-weight: 600;
		color: #ffffff;
	}
	.monotone-spec-table .range-strong {
		color: #ffffff;
		font-weight: 700;
	}
	.monotone-spec-table .highlight-row {
		background: rgba(255, 255, 255, 0.03);
	}
`;

  if (!content.includes('.monotone-spec-table')) {
    content = content.replace('</style>', tableStyles + '\n</style>');
  }

  // 8. relatedStories に iX4 を追加
  const ix4StoryItem = `	{
		slug: "2027_new_bmw_ix4_neue_klasse",
		title: "【公式発表】新型BMW iX4登場。次世代EV専用『ノイエ・クラッセ』SACが切り拓く航続828kmの新時代",
		brand: "BMW",
		date: "2026.10.28",
		image: "/uploads/ix4/key-visual.svg",
		url: "/magazine/2027_new_bmw_ix4_neue_klasse/"
	},`;

  if (!content.includes('2027_new_bmw_ix4_neue_klasse') && content.includes('const relatedStories = [')) {
    content = content.replace('const relatedStories = [', 'const relatedStories = [\n' + ix4StoryItem);
  }

  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Successfully updated for iX4:', filePath);
}

updateSlugFile('src/pages/magazine/[slug].astro');
updateSlugFile('src/pages/posts/[slug].astro');
