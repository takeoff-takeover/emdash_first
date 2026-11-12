import fs from "fs";

const raw = fs.readFileSync("seed/current_article_blocks.json", "utf8");
const blocks = JSON.parse(raw);

console.log("Original block count:", blocks.length);

// テキストを一切変更せず、ブロックエディタのツール（アコーディオン、ステップカード、2列比較カード、注釈、CTA強弱）へ再編成する
const newBlocks = [];

for (let i = 0; i < blocks.length; i++) {
  const b = blocks[i];

  // 1. 冒頭のCTA（画像上）: 控えめな「シックダーク」に変更
  if (b._key === "cta_2") {
    newBlocks.push({
      _type: "editorial-tools:cta",
      _key: "cta_intro",
      label: b.label || "試乗・相談予約をする",
      url: b.url || "https://www.nicole.co.jp/contact/?form_type=inquiry",
      subtitle: b.subtitle || "Nicole MINI 各ショールームにて随時受付中",
      style: "secondary", // 冒頭は落ち着いたシックダーク
      align: "center",
      shape: "pill",
      has_arrow: "true"
    });
    continue;
  }

  // 2. 「30秒でわかること」セクション
  if (b._type === "block" && b.style === "h2" && (b.children || []).some(c => c.text === "30秒でわかること")) {
    newBlocks.push(b); // H2 "30秒でわかること" そのまま

    // 続く4つの箇条書きを取得
    const bullet1 = (blocks[i + 1]?.children || []).map(c => c.text).join("");
    const bullet2 = (blocks[i + 2]?.children || []).map(c => c.text).join("");
    const bullet3 = (blocks[i + 3]?.children || []).map(c => c.text).join("");
    const bullet4 = (blocks[i + 4]?.children || []).map(c => c.text).join("");

    // 4つの要点を、テキストそのまま 2列×2行の「カラムカード（ボックス型）」で雑誌風に整理
    newBlocks.push({
      _type: "editorial-tools:column_cards",
      _key: "summary_cards",
      columns: "2",
      card_style: "box",
      items: [
        {
          title: "① 本質を妥協なく標準搭載",
          text: bullet1,
          button_label: "",
          button_url: ""
        },
        {
          title: "② 400万円を切るプライス（365万円〜）",
          text: bullet2,
          button_label: "",
          button_url: ""
        },
        {
          title: "③ 維持費の不安を解消（個別オプション対応）",
          text: bullet3,
          button_label: "",
          button_url: ""
        },
        {
          title: "④ 国産上級グレードと同等の最も賢い選択",
          text: bullet4,
          button_label: "",
          button_url: ""
        }
      ]
    });

    i += 4; // 箇条書き4つをスキップ
    continue;
  }

  // 3. 「MINI「SELECT」でスマートに引き算された装備仕様と判断ポイント」セクション
  // H3が3つ＋判断ポイントが連なる部分を開閉アコーディオンに変換
  if (b._type === "block" && b.style === "h2" && (b.children || []).some(c => c.text.includes("引き算された装備仕様と判断ポイント"))) {
    newBlocks.push(b); // H2 そのまま
    // 導入文（「SELECT」シリーズが全車種で圧倒的なバリューを誇るのには...）
    i++;
    if (blocks[i]) newBlocks.push(blocks[i]);

    // 続く①〜③の装備と判断ポイントをアコーディオンに集約
    // ① 先進表示: [i+1]=H3, [i+2]=本文, [i+3]=判断ポイント見出し, [i+4]=判断ポイント本文, [i+5]=CTA
    // ② ヘッドライト: [i+6]=H3, [i+7]=本文, [i+8]=判断ポイント見出し, [i+9]=判断ポイント本文
    // ③ メインテナンス: [i+10]=H3, [i+11]=重要注意点見出し, [i+12]=本文, [i+13]=判断ポイント
    const item1_q = "① 先進表示・インテリア演出機能（エクスペリエンスモード・ヘッドアップディスプレイ）について";
    const item1_a = "ダッシュボード中央のディスプレイ演出を切り替える「MINIエクスペリエンスモード」や、フロントガラスにナビ情報を投影する「ヘッドアップディスプレイ」が標準装備から外されています（※カントリーマン SELECTではヘッドアップディスプレイやアダプティブLEDも標準維持されるなど、車種に応じた最適なパッケージが用意されています）。\n\n【判断ポイント】\nダッシュボード中央の先進的な「円形センター・ディスプレイ」の圧倒的な見やすさを誇るため、日常の利便性で困ることはありません。実際の走行映像に案内を重ねる「AR機能付きMINIナビゲーション」やスマホ連携（CarPlay等）も標準装備されています。ぜひ試乗にてご体感ください。";

    const item2_q = "② ヘッドライトがシンプルな「円形LEDヘッドライト」に変更";
    const item2_a = "3ドア／5ドアのMINI SELECTでは、コーナリング等、進路を自動追従して照らす「アダプティブ機能」に代わり、より洗練されたシンプルな円形LEDヘッドライトに変更されています（※カントリーマン SELECTではアダプティブLEDが標準維持されます）。\n\n【判断ポイント】\nシンプルなLEDヘッドライトであっても、夜間ドライブに十分すぎる明るさと視認性が確保されているため、街乗り中心であれば全く問題ありません。";

    const item3_q = "③ メインテナンスプラン「MINI TENDER LOVING CARE」の無償付帯対象外";
    const item3_a = "【最も重要な注意点】\n新車購入から3年間の点検やオイル交換が無償になる「MINI TLC.スタンダードパック」が標準装備から外されています。\n\n【判断ポイント】\nショールームでの商談時に、有償オプションとして「MINI TLC」を個別追加することが可能です。将来のメインテナンス費用をフラットに保ちたい方は、購入時に営業担当へ相談するのがスマートです。";

    newBlocks.push({
      _type: "editorial-tools:faq",
      _key: "spec_accordion",
      style: "simple", // シンプルなアコーディオン
      items: [
        { _key: "spec_1", question: item1_q, answer: item1_a },
        { _key: "spec_2", question: item2_q, answer: item2_a },
        { _key: "spec_3", question: item3_q, answer: item3_a }
      ]
    });

    // ここで控えめなCTA（シックダーク・左寄せまたは中央）を1つ挟む
    newBlocks.push({
      _type: "editorial-tools:cta",
      _key: "cta_mid_specs",
      label: "Nicole ショールームで実車を確かめる",
      url: "https://www.nicole.co.jp/contact/?form_type=inquiry",
      subtitle: "各店舗の展示車・試乗車状況をお気軽にお問い合わせください",
      style: "secondary",
      align: "center",
      shape: "pill",
      has_arrow: "true"
    });

    // 元のブロック群をスキップ（iを写真の手前まで進める）
    // key-71-tuxdx（H2「【乗り換えるべき真実】...」）の手前の写真群の前まで進める
    while (i + 1 < blocks.length && blocks[i + 1]._key !== "key-67-wfrp5") {
      i++;
    }
    continue;
  }

  // 4. 「【乗り換えるべき真実】国産同価格帯を凌駕する、MINI SELECT全体の本質と魅力」セクション
  // ①〜③の魅力を「01〜03 ステップカード」に変換
  if (b._type === "block" && b.style === "h2" && (b.children || []).some(c => c.text.includes("国産同価格帯を凌駕する"))) {
    newBlocks.push(b); // H2 そのまま
    // 導入文
    i++;
    if (blocks[i]) newBlocks.push(blocks[i]);

    // ① 円形センター・ディスプレイ
    const m1_title = "世界初の「円形センター・ディスプレイ」と最先端デジタル体験";
    const m1_text = "全SELECTモデルのダッシュボード中央に君臨する直径240mmの「円形センター・ディスプレイ」は、最新デジタルテクノロジーの象徴です。音声アシスタント「Hey MINI」やスマホ連携、実際の映像に矢印を重ねる「AR機能付きMINIナビゲーション」が全車標準装備され、国産車では味わえない先進的な車内空間を提供します。";

    // ② ゴーカート・フィーリング
    const m2_title = "一度味わうと病みつきになる「ゴーカート・フィーリング」";
    const m2_text = "1.5L直列3気筒ターボエンジン＋7速DCT（ダブルクラッチトランスミッション）や48Vマイルドハイブリッド（カントリーマン）によるダイレクトな加速と、高剛性シャシー＆ステアリングを切った瞬間にクイックに曲がるハンドリングは、まさに「ゴーカート」そのもの。一般的な国産コンパクトカーやSUVでは決して味わえない、運転するたびに胸が躍るドライビングプレジャーがここにあります。";

    // ③ 安全支援
    const m3_title = "最高水準の「ドライビング・アシスタント＆パーキング・アシスタント」";
    const m3_text = "衝突回避・被害軽減ブレーキやレーンキープアシスト、アクティブ・クルーズ・コントロール（ACC）に加え、自動で駐車操作を行ってくれる「パーキング・アシスタント」までもが全車標準装備されています。エントリーモデルであっても安全性と運転支援機能は上位グレードと完全に同等です。";

    newBlocks.push({
      _type: "editorial-tools:column_cards",
      _key: "merit_step_cards",
      columns: "3",
      card_style: "step", // 01 / 02 / 03 の番号付きステップカード
      items: [
        { title: m1_title, text: m1_text, button_label: "", button_url: "" },
        { title: m2_title, text: m2_text, button_label: "", button_url: "" },
        { title: m3_title, text: m3_text, button_label: "", button_url: "" }
      ]
    });

    // 元のH3や通常段落、CTA（cta_42）をスキップして、H2「MINI「SELECT」シリーズ 全ラインアップ」の手前まで進める
    while (i + 1 < blocks.length && blocks[i + 1]._key !== "key-91-ty0at") {
      i++;
    }
    continue;
  }

  // 5. スペック一覧表直後のCTA: 上品な「アウトライン」スタイルに変更
  if (b._key === "cta_49") {
    newBlocks.push({
      _type: "editorial-tools:cta",
      _key: "cta_after_table",
      label: "各モデルの試乗・相談予約をする",
      url: b.url || "https://www.nicole.co.jp/contact/?form_type=inquiry",
      subtitle: "サイズ感や乗り心地の比較など、お気軽にご相談ください",
      style: "outline", // 上品な白枠線
      align: "center",
      shape: "rounded", // 高級感あるスクエア角丸
      has_arrow: "true"
    });
    continue;
  }

  // 6. 「診断：国産車からMINI「SELECT」に乗り換えて満足できる人・後悔する人」セクション
  // 左右2列の比較カードに変換
  if (b._type === "block" && b.style === "h2" && (b.children || []).some(c => c.text.includes("満足できる人・後悔する人"))) {
    newBlocks.push(b); // H2 そのまま

    const fit_title = "SELECTを選んで「大満足」できる人";
    const fit_text = "・「ヤリスやヴェゼル、CX-30などの国産上級グレードと同じ300万〜400万円台の予算で、プレミアムなMINIに乗り換えたい」という方\n\n・車内の派手なライティング演出やヘッドアップディスプレイは不要で、痛快な走り・アイコニックなデザイン・円形センター・ディスプレイがあれば十分と思える方\n\n・毎日の通勤やドライブを「ただの移動」から「楽しい時間」に変えたい方";

    const unfit_title = "SELECTを選ぶと「後悔」する人";
    const unfit_text = "・ボディカラーとルーフカラーを何十通りもの組み合わせからツートンカラーで自由自在にカスタムオーダーしたい方（クーパーSELECTはルーフ同色等シンプル仕様）\n\n・夜間の車内演出プロジェクション（エクスペリエンスモード）に一目惚れしている方";

    newBlocks.push({
      _type: "editorial-tools:column_cards",
      _key: "fit_check_cards",
      columns: "2",
      card_style: "box",
      items: [
        {
          title: "◯ " + fit_title,
          text: fit_text,
          button_label: "",
          button_url: ""
        },
        {
          title: "△ " + unfit_title,
          text: unfit_text,
          button_label: "",
          button_url: ""
        }
      ]
    });

    // 元の箇条書き群をスキップして、FAQの手前まで進める
    while (i + 1 < blocks.length && blocks[i + 1]._key !== "key-256-ktpif") {
      i++;
    }
    continue;
  }

  // 7. 記事末尾の勝負CTA（まとめの後）: リード文＋アクセントレッド＋注記のフルリッチCTAに強化
  if (b._key === "cta_72") {
    newBlocks.push({
      _type: "editorial-tools:cta",
      _key: "cta_final_hero",
      label: "ショールームでMINI「SELECT」を体感する",
      url: "https://www.nicole.co.jp/contact/?form_type=inquiry",
      lead_text: "全国MINI最優秀・優秀ディーラー賞 通算3度受賞のNicole MINIが、あなたに最適な1台をご案内いたします。",
      subtitle: "※所要時間約2分・当日のご予約や試乗・在庫確認も承ります",
      style: "primary", // 最高優先度のアクセントレッド
      align: "center",
      shape: "pill",
      has_arrow: "true"
    });
    continue;
  }

  // 8. 記事最下部の「本記事について」（注記・免責文）: editorial-tools:notes に格納
  if (b._type === "block" && (b.children || []).some(c => c.text && c.text.includes("本記事について"))) {
    const rawContent = (b.children || []).map(c => c.text).join("");
    newBlocks.push({
      _type: "editorial-tools:notes",
      _key: "article_disclaimer_notes",
      content: rawContent
    });
    continue;
  }

  // それ以外のブロック（画像、見出し、FAQ、テーブル等）はそのまま追加
  newBlocks.push(b);
}

console.log("New block count:", newBlocks.length);
fs.writeFileSync("seed/new_article_blocks.json", JSON.stringify(newBlocks, null, 2), "utf8");
console.log("Saved to seed/new_article_blocks.json");
