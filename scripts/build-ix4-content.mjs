import fs from 'fs';
import path from 'path';
import { DatabaseSync } from 'node:sqlite';

export const ix4Gallery = [
  // EXTERIOR (10点)
  {
    title: "Iconic Glowキドニーグリル ＆ 一体型LEDライト",
    caption: "ノイエ・クラッセの象徴である一体型発光キドニーグリルとスリムLEDヘッドライトシグネチャー。デジタル技術とBMWのアイコンが融合した新世代のフロントマスク。",
    image: "/uploads/ix4/ext-01.jpg"
  },
  {
    title: "ファストバック・クーペシルエット ＆ ホフマイスター・キンク",
    caption: "流麗なルーフラインと力強いショルダーラインが融合した新世代スポーツ・アクティビティ・クーペ（SAC）のプロポーション。Cピラーには象徴的なホフマイスター・キンクを刻む。",
    image: "/uploads/ix4/ext-02.jpg"
  },
  {
    title: "立体LEDリヤライトバー ＆ ダックテールスポイラー",
    caption: "車幅いっぱいに広がる3次元リヤライトバーと、空力性能を高めるインテグレーテッド・ダックテール。彫刻的な造形美と視認性を両立。",
    image: "/uploads/ix4/ext-03.jpg"
  },
  {
    title: "アルプス山岳ワインディングを駆けるiX4 M60 xDrive",
    caption: "標高2,500mを超える過酷なワインディングで鍛え上げられたデュアルモーターxDrive。瞬時に路面を捉えるトラクションと俊敏な旋回性を実証。",
    image: "/uploads/ix4/ext-04.jpg"
  },
  {
    title: "低重心レイアウトがもたらす極上のコーナリングスタンス",
    caption: "フロア下にフラット配置された第6世代バッテリーパックにより、従来のSACを圧倒する低重心と前後重量配分50:50を達成。",
    image: "/uploads/ix4/ext-05.jpg"
  },
  {
    title: "Cd値0.23を達成したエアロダイナミクス・ディテール",
    caption: "自動格納式フラッシュドアハンドル、整流エアカーテン、床下フルアンダーカバーにより、クーペSUVとして異例のCd値0.23をマーク。",
    image: "/uploads/ix4/ext-06.jpg"
  },
  {
    title: "21インチM専用鍛造アロイホイール ＆ スポーツブレーキ",
    caption: "軽量化と空力低減を極限まで両立した21インチ鍛造ホイール。大径ローターと高剛性Mキャリパーが強大な制動力を約束。",
    image: "/uploads/ix4/ext-07.jpg"
  },
  {
    title: "夕暮れのハイウェイを巡航するiX4 50 xDrive",
    caption: "長距離グランドツーリングにおける圧倒的な静粛性と優美な佇まい。航続最大828km（WLTP）がもたらす真の自由。",
    image: "/uploads/ix4/ext-08.jpg"
  },
  {
    title: "空力と機能性を研ぎ澄ましたアンダーフロア設計",
    caption: "気流の乱流を徹底して排除するフラットボトム構造。空気抵抗低減とダウンフォース発生を同時に実現。",
    image: "/uploads/ix4/ext-09.jpg"
  },
  {
    title: "スタジオに佇むiX4 M60 xDriveの彫刻的サーフェス",
    caption: "無駄な装飾ラインを削ぎ落とし、面と光の陰影のみで力強さを表現するノイエ・クラッセの還元主義（Reductionism）デザイン思想。",
    image: "/uploads/ix4/ext-10.jpg"
  },
  // INTERIOR (5点)
  {
    title: "フロントガラス全幅投影「BMW Panoramic Vision」",
    caption: "ドライバーの視線移動を最小限に抑え、フロントガラス下端全幅に走行情報やナビゲーション、ADAS状況を黒地に高コントラストで投影する革新HUD。",
    image: "/uploads/ix4/int-01.jpg"
  },
  {
    title: "幾何学フリーフォーム17.9インチ中央ディスプレイ ＆ OS X",
    caption: "ドライバー側へ自然に傾斜したゼロレイヤー操作系。生成AIアシスタントと直感的なウィジェット配置により、視覚的・触覚的な心地よさを提供。",
    image: "/uploads/ix4/int-02.jpg"
  },
  {
    title: "クリスタルガラス製タッチセレクター ＆ フローティングコンソール",
    caption: "厳選された天然素材と精緻なクリスタルガラスが織りなす現代的クラフトマンシップ。不要な物理スイッチを排した洗練のセンター空間。",
    image: "/uploads/ix4/int-03.jpg"
  },
  {
    title: "海洋リサイクル繊維とヴィーガンレザーのエルゴノミックシート",
    caption: "100%リサイクル可能な素材を使用しながら、至高のホールド感と快適性を両立。ベンチレーションおよびマッサージ機能を内蔵。",
    image: "/uploads/ix4/int-04.jpg"
  },
  {
    title: "2,950mmロングホイールベースが生む広大な後席ラウンジ",
    caption: "クーペシルエットでありながら十分な頭上空間とクラストップレベルの足元スペースを確保。頭上にはUVカットフルパノラマガラスルーフが広がる。",
    image: "/uploads/ix4/int-05.jpg"
  }
];

const extImagesNewline = ix4Gallery.slice(1, 10).map(g => g.image).join('\n');
const extCaptionsNewline = ix4Gallery.slice(0, 10).map(g => g.caption).join('\n');

const intImagesNewline = ix4Gallery.slice(11).map(g => g.image).join('\n');
const intCaptionsNewline = ix4Gallery.slice(10).map(g => g.caption).join('\n');

export const ix4PortableText = [
  {
    _type: 'block',
    _key: 'h2_01',
    style: 'h2',
    children: [{ _type: 'span', _key: 's01', text: '【世界初公開】ノイエ・クラッセが切り拓く新世代スポーツ・アクティビティ・クーペ「新型BMW iX4」' }]
  },
  {
    _type: 'block',
    _key: 'p_01',
    style: 'normal',
    children: [{ _type: 'span', _key: 's02', text: 'BMWグループは、完全電動の新世代アーキテクチャ「ノイエ・クラッセ（Neue Klasse）」をベースとした初のスポーツ・アクティビティ・クーペ（SAC）、『新型BMW iX4（The all-new BMW iX4）』を世界初公開しました。2008年に初代X6が世に送り出したSACという革新のカテゴリーを、完全電動の未来へ向けて昇華させた記念碑的モデルです。' }]
  },
  {
    _type: 'block',
    _key: 'p_02',
    style: 'normal',
    children: [{ _type: 'span', _key: 's03', text: 'BMW AG取締役会長オリバー・ツィプセは公式発表に際し、「ノイエ・クラッセは単なる新モデル群ではなく、BMWのドライビング・プレジャー、デザイン、デジタル技術、そして持続可能性のすべてを根底から再定義するプロジェクトです。新型BMW iX4は、そのエモーショナルなクーペ美学と最先端の第6世代eDriveテクノロジーを結実させた、走る歓びの新時代を告げる存在です」と語りました。' }]
  },
  {
    _type: 'slider',
    _key: 'slider_exterior',
    id: '/uploads/ix4/ext-01.jpg',
    images: extImagesNewline,
    captions: extCaptionsNewline
  },
  {
    _type: 'table',
    _key: 'table_specs',
    rows: [
      {
        _type: 'tableRow',
        _key: 'tr_h',
        cells: [
          { _type: 'tableCell', _key: 'th_0', content: [{ _type: 'span', _key: 'c0', text: 'モデル名' }], isHeader: true },
          { _type: 'tableCell', _key: 'th_1', content: [{ _type: 'span', _key: 'c1', text: '駆動方式' }], isHeader: true },
          { _type: 'tableCell', _key: 'th_2', content: [{ _type: 'span', _key: 'c2', text: '最高出力' }], isHeader: true },
          { _type: 'tableCell', _key: 'th_3', content: [{ _type: 'span', _key: 'c3', text: '最大トルク' }], isHeader: true },
          { _type: 'tableCell', _key: 'th_4', content: [{ _type: 'span', _key: 'c4', text: '0-100km/h加速' }], isHeader: true },
          { _type: 'tableCell', _key: 'th_5', content: [{ _type: 'span', _key: 'c5', text: '航続距離 (WLTP)' }], isHeader: true }
        ]
      },
      {
        _type: 'tableRow',
        _key: 'tr_1',
        cells: [
          { _type: 'tableCell', _key: 'td_10', content: [{ _type: 'span', _key: 'c10', text: 'iX4 40 xDrive' }], isHeader: false },
          { _type: 'tableCell', _key: 'td_11', content: [{ _type: 'span', _key: 'c11', text: '四輪駆動 (Gen6 eDrive)' }], isHeader: false },
          { _type: 'tableCell', _key: 'td_12', content: [{ _type: 'span', _key: 'c12', text: '275 kW / 374 hp' }], isHeader: false },
          { _type: 'tableCell', _key: 'td_13', content: [{ _type: 'span', _key: 'c13', text: '520 Nm' }], isHeader: false },
          { _type: 'tableCell', _key: 'td_14', content: [{ _type: 'span', _key: 'c14', text: '5.6 秒' }], isHeader: false },
          { _type: 'tableCell', _key: 'td_15', content: [{ _type: 'span', _key: 'c15', text: '最大 638 km' }], isHeader: false }
        ]
      },
      {
        _type: 'tableRow',
        _key: 'tr_2',
        cells: [
          { _type: 'tableCell', _key: 'td_20', content: [{ _type: 'span', _key: 'c20', text: 'iX4 50 xDrive' }], isHeader: false },
          { _type: 'tableCell', _key: 'td_21', content: [{ _type: 'span', _key: 'c21', text: '四輪駆動 (Gen6 eDrive)' }], isHeader: false },
          { _type: 'tableCell', _key: 'td_22', content: [{ _type: 'span', _key: 'c22', text: '345 kW / 469 hp' }], isHeader: false },
          { _type: 'tableCell', _key: 'td_23', content: [{ _type: 'span', _key: 'c23', text: '645 Nm' }], isHeader: false },
          { _type: 'tableCell', _key: 'td_24', content: [{ _type: 'span', _key: 'c24', text: '4.9 秒' }], isHeader: false },
          { _type: 'tableCell', _key: 'td_25', content: [{ _type: 'span', _key: 'c25', text: '最大 828 km' }], isHeader: false }
        ]
      },
      {
        _type: 'tableRow',
        _key: 'tr_3',
        cells: [
          { _type: 'tableCell', _key: 'td_30', content: [{ _type: 'span', _key: 'c30', text: 'iX4 M60 xDrive' }], isHeader: false },
          { _type: 'tableCell', _key: 'td_31', content: [{ _type: 'span', _key: 'c31', text: 'MパフォーマンスAWD' }], isHeader: false },
          { _type: 'tableCell', _key: 'td_32', content: [{ _type: 'span', _key: 'c32', text: '450 kW / 612 hp' }], isHeader: false },
          { _type: 'tableCell', _key: 'td_33', content: [{ _type: 'span', _key: 'c33', text: '875 Nm' }], isHeader: false },
          { _type: 'tableCell', _key: 'td_34', content: [{ _type: 'span', _key: 'c34', text: '3.4 秒' }], isHeader: false },
          { _type: 'tableCell', _key: 'td_35', content: [{ _type: 'span', _key: 'c35', text: '最大 654 km' }], isHeader: false }
        ]
      }
    ],
    hasHeaderRow: true
  },
  {
    _type: 'slider',
    _key: 'slider_interior',
    id: '/uploads/ix4/int-01.jpg',
    images: intImagesNewline,
    captions: intCaptionsNewline
  },
  {
    _type: 'block',
    _key: 'h2_design',
    style: 'h2',
    children: [{ _type: 'span', _key: 's04', text: 'Cd値0.23を達成した空力美学：研ぎ澄まされたファストバック・シルエット' }]
  },
  {
    _type: 'block',
    _key: 'p_design_1',
    style: 'normal',
    children: [{ _type: 'span', _key: 's05', text: '新型BMW iX4のエクステリアは、無駄な装飾ラインを極限まで削ぎ落とした「還元主義（Reductionism）」の造形美を追求しています。フロントマスクでは、BMWの象徴であるキドニーグリルとヘッドライトがシームレスな発光デジタルサーフェスとして一体化。昼夜を問わず圧倒的なプレステージを放つ「Iconic Glow」発光シグネチャーが、街中で一目でそれと分かる個性を放ちます。' }]
  },
  {
    _type: 'block',
    _key: 'p_design_2',
    style: 'normal',
    children: [{ _type: 'span', _key: 's06', text: 'サイドセクションは、2,950mmのロングホイールベースと前後の短いオーバーハングにより、アスリートのような引き締まった黄金比プロポーションを描きます。ボディパネルと完全に面一になる自動格納式フラッシュドアハンドル、風の流れを緻密にコントロールするエアロダイナミックアロイホイール、そして車体下面をフルフラットに覆うアンダーカバーの採用により、クーペSUVセグメント屈指の空気抵抗係数（Cd値0.23）を達成しました。' }]
  },
  {
    _type: 'block',
    _key: 'p_design_3',
    style: 'normal',
    children: [{ _type: 'span', _key: 's07', text: 'リヤエンドには、車幅いっぱいに水平展開する立体的な3D LEDライトバーと、トランク後端に美しく統合されたインテグレーテッド・ダックテールスポイラーを装備。高速走行時のリヤ揚力を抑えつつ、BMW伝統の力強く張り出したリヤフェンダー（ショルダー）が、低重心で路面に吸い付くようなワイド＆ローのスタンスを強調します。' }]
  },
  {
    _type: 'block',
    _key: 'h2_interior',
    style: 'h2',
    children: [{ _type: 'span', _key: 's08', text: '革新のコックピット思想「BMW パノラミック・ビジョン」と「OS X」' }]
  },
  {
    _type: 'block',
    _key: 'p_interior_1',
    style: 'normal',
    children: [{ _type: 'span', _key: 's09', text: 'インテリアに足を踏み入れると、従来の自動車のコックピット概念を覆すピュアでクリーンなラウンジ空間が広がります。その中核を担うのが、量産車初となる革新の投影技術「BMW Panoramic Vision（BMWパノラミック・ビジョン）」です。フロントガラス下端の全幅にわたり、黒地に高コントラストの走行情報、ナビゲーション、ADASステータスをシームレスに直接投影。ドライバーは視線を路面から逸らすことなく、必要な情報を直感的に把握できます。' }]
  },
  {
    _type: 'block',
    _key: 'p_interior_2',
    style: 'normal',
    children: [{ _type: 'span', _key: 's10', text: 'センターコンソール中央には、ドライバー側へ自然に傾斜した幾何学的フリーフォームの「17.9インチ Central Display」を配置。Android Open Source Project（AOSP）をベースに開発された最新「BMW Operating System X」が稼働し、階層を潜ることなく目的の機能に直接アクセスできる「ゼロレイヤー思想」を徹底。さらに車載生成AIアシスタントが日常会話のような自然言語での対話を可能にし、ナビ設定やエアコン調整、走行モード変更を声だけで完結させます。' }]
  },
  {
    _type: 'block',
    _key: 'p_interior_3',
    style: 'normal',
    children: [{ _type: 'span', _key: 's11', text: 'キャビンを包むマテリアルには、循環型経済（サーキュラーエコノミー）の思想を具現化。海洋プラスチックから再生されたファブリックと、上質な手触りを持つ植物由来のヴィーガンレザーを惜しみなく使用。頭上には高断熱・UVカットコーティングが施されたフルパノラマガラスルーフが広がり、夜間にはアンビエントライトがガラスの輪郭を優美にライトアップします。クーペでありながら後席のヘッドクリアランスとレッグルームは極めて広大で、トランク容量は515Lから後席格納時1,560Lまで拡張可能です。' }]
  },
  {
    _type: 'block',
    _key: 'h2_edrive',
    style: 'h2',
    children: [{ _type: 'span', _key: 's12', text: '第6世代BMW eDriveテクノロジー：最大828kmの航続距離と800V超急速充電' }]
  },
  {
    _type: 'block',
    _key: 'p_edrive_1',
    style: 'normal',
    children: [{ _type: 'span', _key: 's13', text: 'ノイエ・クラッセの真骨頂は、パワートレインの心臓部である「第6世代（Gen6）BMW eDrive」にあります。従来の角形セルから一新された大径円筒形リチウムイオンバッテリーセルを採用し、セルレベルでのエネルギー密度は20%向上、充電速度は30%高速化されました。ラインナップ中核の「iX4 50 xDrive」には正味容量108.7kWhの超大容量パックを搭載し、WLTP欧州テストサイクルにおいてSACとして驚異的な最大828kmの一充電航続距離をマークします。' }]
  },
  {
    _type: 'block',
    _key: 'p_edrive_2',
    style: 'normal',
    children: [{ _type: 'span', _key: 's14', text: '充電インフラ技術においても劇的な飛躍を遂げました。車両電圧を従来の400Vから「800V高電圧システム」へと刷新し、最大400kWのDC超急速充電に対応。これにより、バッテリー残量10%から80%までの充電がわずか21分で完了します。高速道路のサービスエリアでわずか10分間の急速充電を行うだけで、最大300km〜400km分の航続距離を瞬時に回復。内燃機関車の給油時間と遜色のないストレスフリーな長距離グランドツーリングを実現しました。' }]
  },
  {
    _type: 'block',
    _key: 'p_edrive_3',
    style: 'normal',
    children: [{ _type: 'span', _key: 's15', text: 'さらに「Plug & Charge」規格に完全対応し、充電ケーブルを車両に接続するだけで自動的に認証・決済が完了。将来的には自宅やグリッドへ電力を供給できる双方向充電技術（V2H / V2G）にも対応し、動く蓄電池としてのスマートなエネルギーマネジメントを担います。' }]
  },
  {
    _type: 'accordion',
    _key: 'acc_specs',
    id: '主要諸元・技術スペック：第6世代eDrive & 800Vシステム詳細',
    content: `プラットフォーム：BMW Neue Klasse 専用BEVアーキテクチャ
パワートレイン：第6世代（Gen6）BMW eDrive 高効率電気モーター（前後アクスル搭載デュアルモーターAWD）
高電圧システム：800V超高電圧アーキテクチャ（最大400kW DC超急速充電対応）
バッテリー技術：新世代大径円筒形リチウムイオンセル（正味容量：40 xDrive 82.6kWh / 50 xDrive & M60 108.7kWh）
急速充電性能：10分間の充電で最大300〜400km分を急速回復（10%→80%充電時間：約21分）
空気抵抗係数：Cd値 0.23（自動格納フラッシュドアハンドル、床下フルカバー、エアロホイール装着時）
車両寸法（欧州参考値）：全長 4,785mm × 全幅 1,910mm × 全高 1,605mm、ホイールベース 2,950mm
荷室容量：通常時 515L / リヤシート格納時 最大 1,560L（フロントフランク容量：45L）`
  },
  {
    _type: 'block',
    _key: 'h2_m60',
    style: 'h2',
    children: [{ _type: 'span', _key: 's16', text: '最強モデル「BMW iX4 M60 xDrive」：最高出力612馬力・0-100km/h加速3.4秒' }]
  },
  {
    _type: 'block',
    _key: 'p_m60_1',
    style: 'normal',
    children: [{ _type: 'span', _key: 's17', text: 'ドライビングプレジャーの頂点を極めるモデルとして用意されるのが、BMW M社が開発を手掛けたハイパフォーマンスフラッグシップ『BMW iX4 M60 xDrive』です。前後に配置されたM専用高出力モーターが合計で450kW（612hp）の強大なパワーと、瞬時に立ち上がる875Nmの最大トルクを発生。アクセルを踏み込んだ瞬間、巨体であることを完全に忘れさせる強烈なGとともに、0-100km/h加速わずか3.4秒というスーパースポーツ領域の加速性能を誇ります。' }]
  },
  {
    _type: 'block',
    _key: 'p_m60_2',
    style: 'normal',
    children: [{ _type: 'span', _key: 's18', text: 'その超絶的なパフォーマンスを完璧に手なずけるのが、新開発の中央統合演算ユニット「Heart of Joy（ハート・オブ・ジョイ）」です。従来のECUに比べ最大10倍の演算処理速度を誇り、パワートレイン、トルクベクタリング、電子制御ダンパー、4輪ブレーキシステムを1つの超高速ブレインで一元制御。ドライバーがステアリングを切るミリ秒単位の挙動を先読みし、一切の遅れなく四輪の駆動力を最適配分。タイトなワインディングにおいても、まるでレールの上をトレースするかのような異次元の旋回感覚をもたらします。' }]
  },
  {
    _type: 'block',
    _key: 'p_m60_3',
    style: 'normal',
    children: [{ _type: 'span', _key: 's19', text: 'M60専用装備として、グロスブラック仕上げのアグレッシブなフロントロアエプロン、レーシング技術からフィードバックされたリヤ・ベンチュリディフューザー、Mスポーツステアリングホイール、専用チューニングのアダプティブMサスペンション・プロフェッショナルを標準装備。街中での洗練された極上の乗り心地と、サーキット走行にも耐えうる圧倒的なダイナミクスを両立しています。' }]
  },
  {
    _type: 'accordion',
    _key: 'acc_lineup',
    id: 'モデルバリエーション：iX4 40 / 50 / M60 xDrive 主要装備比較',
    content: `■ BMW iX4 40 xDrive：
日常の快適性と洗練された効率性を追求したエントリーAWD。システム出力275kW（374hp）、82.6kWhバッテリー、航続最大638km。19インチエアロホイール、BMW Panoramic Vision標準装備。

■ BMW iX4 50 xDrive：
最大828kmの圧倒的航続距離を誇るグランドツーリング・マスター。システム出力345kW（469hp）、108.7kWhバッテリー、0-100km/h加速4.9秒。20インチホイール、スカイラウンジパノラマルーフ、Harman Kardonサラウンドサウンドシステム標準装備。

■ BMW iX4 M60 xDrive：
サーキット直系のダイナミクスを宿すMハイパフォーマンスモデル。システム出力450kW（612hp）、最大トルク875Nm、0-100km/h加速3.4秒。M専用エクステリア、21インチ鍛造ホイール、アダプティブMサスペンションプロ、アクティブスタビライザー、Bowers & Wilkinsダイヤモンドサラウンドシステム標準装備。`
  },
  {
    _type: 'block',
    _key: 'h2_factory',
    style: 'h2',
    children: [{ _type: 'span', _key: 's20', text: 'ハンガリー・デブレツェン新工場で紡がれる「iFACTORY」の環境哲学' }]
  },
  {
    _type: 'block',
    _key: 'p_factory_1',
    style: 'normal',
    children: [{ _type: 'span', _key: 's21', text: '新型BMW iX4は、BMWグループが20億ユーロ以上を投じて建設した最先端の製造拠点「ハンガリー・デブレツェン工場（BMW Group Plant Debrecen）」にて量産されます。この工場は、自動車業界初となる「化石燃料を一切使用しない完全ゼロエミッション自動車製造プラント」として設計されました。' }]
  },
  {
    _type: 'block',
    _key: 'p_factory_2',
    style: 'normal',
    children: [{ _type: 'span', _key: 's22', text: '工場内で消費される電力は100%再生可能エネルギー（太陽光・地熱等）によって賄われ、サプライチェーン全体においても二酸化炭素排出を極限まで削減。製造工程で使用されるアルミニウムの50%以上、プラスチックの30%以上に二次（リサイクル）原料が用いられており、走行時だけでなく「生まれる瞬間から廃車・リサイクルに至る全ライフサイクル」において真の持続可能性を体現しています。' }]
  },
  {
    _type: 'faq',
    _key: 'faq_ix4',
    title: 'よくあるご質問（FAQ）',
    content: `Q1: 新型BMW iX4の日本国内での充電インフラ対応はどうなりますか？
A1: 日本国内で普及が進む急速充電規格（CHAdeMO 150kW器以上）および最新の高出力充電スタンドに完全対応します。自宅充電用のAC普通充電器（最大9.6kW / 200V）にも対応し、夜間のタイマー充電により毎朝満充電で出発いただけます。

Q2: 一充電で実際にどれくらいの距離を走れますか？
A2: 「iX4 50 xDrive」の欧州WLTPモード値は最大828kmを誇ります。日本の高速道路や市街地を組み合わせた実用走行（エアコン稼働時）でも、600km〜700km前後の無充電走行が可能と見込まれており、東京〜大阪間（約500km）を途中充電なしで快適に走破できるポテンシャルを持っています。

Q3: クーペフォルムですが、後席の居住性やトランクの使い勝手はどうですか？
A3: EV専用のノイエ・クラッセ・アーキテクチャにより、エンジンやセンタートンネルが存在しない完全フラットフロアを実現。2,950mmのロングホイールベースの恩恵で、大人4名が足を伸ばしてゆったりとくつろげる足元スペースを確保しています。トランク容量も通常時515L、ゴルフバッグ3セットの積載が可能です。

Q4: 日本での国の補助金（CEV補助金）や税制優遇は対象になりますか？
A4: はい。完全ゼロエミッション電気自動車（BEV）であるため、経済産業省のCEV補助金（クリーンエネルギー自動車導入促進補助金）の交付対象となる予定です。また、自動車税の環境性能割（非課税）および重量税の免税措置など、手厚い税制優遇を受けられます。

Q5: 日本市場への導入時期と先行スケジュールの見通しは？
A5: 2026年後半より順次欧州での生産が立ち上がり、日本市場への正式導入およびデリバリーは2027年春頃を予定しています。最新の公式技術資料や詳細装備スペックは順次アナウンスされる見通しです。`
  }
];

// D1データベース更新
const d1Dir = '.wrangler/state/v3/d1/miniflare-D1DatabaseObject';
const files = fs.readdirSync(d1Dir);
const dbFile = files.find(f => f.endsWith('.sqlite') && !f.includes('metadata') && !f.includes('bak'));
if (dbFile) {
  const db = new DatabaseSync(path.join(d1Dir, dbFile));
  const postSlug = '2027_new_bmw_ix4_neue_klasse';
  const postTitle = '【公式発表】新型BMW iX4登場。次世代EV専用『ノイエ・クラッセ』SACが切り拓く航続828kmの新時代';
  const postExcerpt = 'BMW公式プレスリリースより完全電動スポーツ・アクティビティ・クーペ『BMW iX4』が世界初公開。Cd値0.23の流麗なファストバック、最大出力612馬力のM60 xDrive、そして最大828kmの航続性能を誇る新世代SAC。';
  const postFeaturedImage = JSON.stringify({
    id: '',
    provider: 'external',
    src: '/uploads/ix4/key-visual.jpg'
  });
  const postContentStr = JSON.stringify(ix4PortableText);

  const stmt = db.prepare(`
    UPDATE ec_posts 
    SET title = ?, excerpt = ?, featured_image = ?, content = ?, related_location = NULL, updated_at = ?
    WHERE slug = ?
  `);
  stmt.run(postTitle, postExcerpt, postFeaturedImage, postContentStr, new Date().toISOString(), postSlug);
  console.log('Updated D1 ec_posts with new filmstrip captions for iX4');
}
