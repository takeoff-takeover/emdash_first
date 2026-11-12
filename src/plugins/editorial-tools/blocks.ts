export const editorialBlocks = [
	{
		type: "column_cards",
		label: "カラムカード（1〜4列自動・＋で枚数追加）",
		icon: "grid",
		description: "「＋」でカードを何枚でも追加・並び替え可能。枚数に応じて1〜4列に自動調整（写真あり・文字のみ両対応）",
		category: "レイアウト",
		fields: [
			{
				type: "select",
				action_id: "columns",
				label: "【レイアウト設定】1行あたりの列数（折り返し）",
				initial_value: "auto",
				options: [
					{ label: "自動（1枚=1列 / 2・4枚=2列 / 3・5・6枚〜=3列）", value: "auto" },
					{ label: "2列ずつ折り返し（大判カード）", value: "2" },
					{ label: "3列ずつ折り返し（標準カード）", value: "3" },
					{ label: "4列ずつ折り返し（コンパクト一覧）", value: "4" }
				]
			},
			{
				type: "select",
				action_id: "card_style",
				label: "【レイアウト設定】カードのデザイン",
				initial_value: "box",
				options: [
					{ label: "ボックス型（枠線・背景あり：特典やポイント紹介に最適）", value: "box" },
					{ label: "フラット型（枠なし・雑誌風：写真と文章をすっきり見せる）", value: "flat" },
					{ label: "ステップ・番号付き（01 / 02 / 03… を自動表示）", value: "step" }
				]
			},
			{
				type: "repeater",
				action_id: "items",
				label: "【カード一覧】右上の「＋」で何枚でも追加・左の「⠿」ドラッグで順番変更",
				item_label: "カード",
				min_items: 1,
				initial_value: [
					{ image: "", title: "", text: "", button_label: "", button_url: "" },
					{ image: "", title: "", text: "", button_label: "", button_url: "" },
					{ image: "", title: "", text: "", button_label: "", button_url: "" }
				],
				fields: [
					{
						type: "media_picker",
						action_id: "image",
						label: "写真（任意：空欄の場合はテキストカードになります）",
						mime_type_filter: "image/"
					},
					{
						type: "text_input",
						action_id: "title",
						label: "見出し",
						placeholder: "カードの見出しを入力..."
					},
					{
						type: "text_input",
						action_id: "text",
						multiline: true,
						label: "説明文",
						placeholder: "カードの説明テキストを入力..."
					},
					{
						type: "text_input",
						action_id: "button_label",
						label: "ボタン・リンク表示名（任意）",
						placeholder: "例：詳しく見る → / 試乗を予約する →"
					},
					{
						type: "text_input",
						action_id: "button_url",
						label: "ボタン・リンクURL（任意）",
						placeholder: "#cmp-booking"
					}
				]
			}
		]
	},
	{
		type: "split_media",
		label: "左右分割（写真＋文章・比率変更＆交互配置）",
		icon: "columns",
		description: "写真と文章を横並びに配置。比率（50:50 / 60:40 / 40:60）や複数段の自動ジグザグ配置に対応",
		category: "レイアウト",
		fields: [
			{
				type: "select",
				action_id: "image_position",
				label: "【レイアウト設定】写真の配置",
				initial_value: "zigzag",
				options: [
					{ label: "自動で左右交互（1段目:左写真 → 2段目:右写真…）", value: "zigzag" },
					{ label: "左に写真 ／ 右に文章（すべて左写真で統一）", value: "left" },
					{ label: "右に写真 ／ 左に文章（すべて右写真で統一）", value: "right" }
				]
			},
			{
				type: "select",
				action_id: "media_ratio",
				label: "【レイアウト設定】写真と文章の横幅比率（PC表示時）",
				initial_value: "50-50",
				options: [
					{ label: "標準バランス（写真 50% ： 文章 50%）", value: "50-50" },
					{ label: "写真大きめ（写真 60% ： 文章 40%）", value: "60-40" },
					{ label: "写真ワイド（写真 65% ： 文章 35%）", value: "65-35" },
					{ label: "文章広め（写真 40% ： 文章 60%）", value: "40-60" }
				]
			},
			{
				type: "select",
				action_id: "media_fit",
				label: "【写真の収め方】車体全景の欠損防止（トリミング設定）",
				initial_value: "contain",
				options: [
					{ label: "写真全体を表示（車体全景の欠損防止・比率維持・推奨）", value: "contain" },
					{ label: "枠いっぱいにトリミング（ディテール寄り・背景カット用）", value: "cover" }
				]
			},
			{
				type: "repeater",
				action_id: "items",
				label: "【横並びセクション一覧】右上の「＋」で段を追加・ドラッグで順番変更",
				item_label: "セクション",
				min_items: 1,
				initial_value: [
					{ image: "", title: "", text: "", button_label: "", button_url: "" }
				],
				fields: [
					{
						type: "media_picker",
						action_id: "image",
						label: "写真",
						mime_type_filter: "image/"
					},
					{
						type: "text_input",
						action_id: "title",
						label: "見出し",
						placeholder: "例：最新ラインナップを揃えたプライベート試乗"
					},
					{
						type: "text_input",
						action_id: "text",
						multiline: true,
						label: "本文",
						placeholder: "説明文を入力..."
					},
					{
						type: "text_input",
						action_id: "button_label",
						label: "ボタン表示名（任意）",
						placeholder: "例：試乗モデルについて相談する →"
					},
					{
						type: "text_input",
						action_id: "button_url",
						label: "ボタンリンクURL（任意）",
						placeholder: "#cmp-booking"
					}
				]
			}
		]
	},
	{
		type: "bg_band_start",
		label: "▼ 背景エリア（開始：色・グラデーション設定）",
		icon: "sparkles",
		description: "ここから「▲ 背景エリア（終了）」までの見出し・段落・カードを色付き背景やグラデーション帯で囲みます",
		category: "背景・装飾",
		fields: [
			{
				type: "text_input",
				action_id: "color",
				label: "【カラー設定】開始カラー（単色の場合はこの色のみ）",
				initial_value: "#141418",
				placeholder: "#141418"
			},
			{
				type: "text_input",
				action_id: "end_color",
				label: "【カラー設定】終了カラー（開始と違う色にするとグラデーションになります）",
				initial_value: "#141418",
				placeholder: "#141418"
			},
			{
				type: "select",
				action_id: "gradient_type",
				label: "【カラー設定】塗りつぶし・グラデーションの向き",
				initial_value: "vertical",
				options: [
					{ label: "縦グラデーション（上から下へ滑らかに変化 ※同色なら単色）", value: "vertical" },
					{ label: "斜めグラデーション（左上から右下へ立体的に変化）", value: "diagonal" },
					{ label: "中央スポットライト（中央に終了カラーが浮かび上がる演出）", value: "spotlight" },
					{ label: "単色塗りつぶし（開始カラー1色で均一に塗る）", value: "solid" }
				]
			},
			{
				type: "select",
				action_id: "text_color",
				label: "【文字色】背景エリア内の見出し・本文の文字色",
				initial_value: "auto",
				options: [
					{ label: "自動判定（背景の明るさに合わせて白文字／黒文字を自動調整・推奨）", value: "auto" },
					{ label: "白文字に固定（暗い背景用）", value: "light" },
					{ label: "黒文字に固定（明るいグレーや白背景用）", value: "dark" }
				]
			}
		]
	},
	{
		type: "bg_band_end",
		label: "▲ 背景エリア（終了：ここまで背景）",
		icon: "minus",
		description: "「▼ 背景エリア（開始）」で始めた色付き・グラデーション背景をここで閉じます（設定不要）",
		category: "背景・装飾",
		fields: [
			{
				type: "select",
				action_id: "marker",
				label: "【終了マーカー】そのまま「Insert / Save」を押してください",
				initial_value: "end",
				options: [
					{ label: "▲ ここまでを背景エリアにする", value: "end" }
				]
			}
		]
	},
	{
		type: "slider",
		label: "フォトギャラリー（＋で写真追加・説明文付き）",
		icon: "photo",
		description: "「＋」で写真を何枚でも追加・並び替えできるギャラリー（フィルムストリップ ／ タイル一覧）",
		category: "メディア",
		fields: [
			{
				type: "select",
				action_id: "gallery_style",
				label: "【表示設定】ギャラリーの見せ方",
				initial_value: "filmstrip",
				options: [
					{ label: "フィルムストリップ（大判写真＋下に角型サムネイル一覧）", value: "filmstrip" },
					{ label: "フォトグリッド（写真をタイル状に一覧配置）", value: "grid" }
				]
			},
			{
				type: "repeater",
				action_id: "items",
				label: "【写真一覧】右上の「＋」で写真を追加・ドラッグで順番変更",
				item_label: "写真",
				min_items: 1,
				initial_value: [
					{ image: "", caption: "" },
					{ image: "", caption: "" },
					{ image: "", caption: "" }
				],
				fields: [
					{
						type: "media_picker",
						action_id: "image",
						label: "写真ファイル",
						mime_type_filter: "image/"
					},
					{
						type: "text_input",
						action_id: "caption",
						label: "写真の説明文（キャプション・任意）",
						placeholder: "例：流麗なルーフラインと力強いショルダーライン"
					}
				]
			}
		]
	},
	{
		type: "faq",
		label: "開閉リスト（FAQ・詳細スペック統合）",
		icon: "list",
		description: "クリックで開閉するアコーディオン。「＋」で質問やスペック項目を何個でも追加可能",
		category: "レイアウト",
		fields: [
			{
				type: "select",
				action_id: "style",
				label: "【デザイン設定】開閉リストのスタイル",
				initial_value: "qa",
				options: [
					{ label: "Q&Aスタイル（Qマーク付き：よくある質問用）", value: "qa" },
					{ label: "シンプル開閉スタイル（主要諸元・スペック表・利用規約用）", value: "simple" }
				]
			},
			{
				type: "repeater",
				action_id: "items",
				label: "【開閉項目一覧】右上の「＋」で項目を追加・ドラッグで順番変更",
				item_label: "項目",
				min_items: 1,
				initial_value: [
					{ question: "", answer: "" },
					{ question: "", answer: "" }
				],
				fields: [
					{
						type: "text_input",
						action_id: "question",
						label: "見出し / 質問文",
						placeholder: "例：試乗は当日の飛び込みでも可能ですか？ / 主要諸元・スペック"
					},
					{
						type: "text_input",
						action_id: "answer",
						multiline: true,
						label: "開いたときの内容 / 回答文（複数行入力可）",
						placeholder: "開いたときに表示する回答や詳細スペックを入力..."
					}
				]
			}
		]
	},
	{
		type: "notes",
		label: "注釈エリア（文字小・免責事項）",
		icon: "align-left",
		description: "記事末尾などに小さな文字サイズで掲載する注釈・免責事項・補足情報",
		category: "レイアウト",
		fields: [
			{
				type: "text_input",
				action_id: "content",
				multiline: true,
				label: "【注釈】注釈・免責テキスト（複数行入力対応）",
				placeholder: "※掲載の諸元や数値は参考値です。\n※記載の情報は予告なく変更される場合があります。"
			}
		]
	},
	{
		type: "cta",
		label: "CTAボタン（配置・色・リンク自由設定）",
		icon: "bookmark",
		description: "ボタン文言、リンク、配置（左寄せ・中央・幅広）、色（レッド・ダーク・枠線・カスタム）、形状を自由自在に設定できるアクションボタン",
		category: "レイアウト",
		fields: [
			{
				type: "text_input",
				action_id: "label",
				label: "【ボタン文字】ボタン内の表示テキスト（必須）",
				initial_value: "詳細はこちら",
				placeholder: "例：詳細はこちら / 試乗・相談予約をする"
			},
			{
				type: "text_input",
				action_id: "url",
				label: "【リンク先URL】クリック時の遷移先（必須）",
				initial_value: "https://www.nicole.co.jp/contact/?form_type=inquiry",
				placeholder: "https://... または /contact/ などの相対パス"
			},
			{
				type: "text_input",
				action_id: "lead_text",
				multiline: true,
				label: "【上部リード文】ボタンの上部に添える見出し・後押し文（任意）",
				placeholder: "例：正規ディーラーならではの手厚いサポートで、あなたに最適な1台をご案内いたします。"
			},
			{
				type: "text_input",
				action_id: "subtitle",
				label: "【下部注記】ボタン直下のマイクロコピー（※空欄の場合は非表示・枠も出ません）",
				initial_value: "",
				placeholder: "例：※所要時間約2分・当日のご予約も承ります"
			},
			{
				type: "select",
				action_id: "align",
				label: "【配置】ボタンの揃え位置",
				initial_value: "center",
				options: [
					{ label: "中央揃え（区切りや記事末尾の勝負CTAに最適）", value: "center" },
					{ label: "左寄せ（文章の流れのまま自然に誘導）", value: "left" },
					{ label: "右寄せ（補足・次のアクション）", value: "right" },
					{ label: "幅いっぱい（100%ワイド・スマホでも迫力大）", value: "full" }
				]
			},
			{
				type: "select",
				action_id: "style",
				label: "【デザイン・色】ボタンの基本色（任意カラーも選択可）",
				initial_value: "secondary",
				options: [
					{ label: "シックグレー（上品なグレー背景 / 白文字・基本）", value: "secondary" },
					{ label: "シックブラック（黒背景 / 白文字）", value: "black" },
					{ label: "ピュアホワイト（白背景 / 黒文字・高コントラスト）", value: "white" },
					{ label: "アウトライン（上品な白枠線 / 背景透過）", value: "outline" },
					{ label: "アクセントレッド（注目度No.1・最重要CTA推奨）", value: "primary" },
					{ label: "ブランドブルー（BMW / MINIブルー #0066b1）", value: "blue" },
					{ label: "任意カラー（下のカラーコード／カラーピッカーで自由指定）", value: "custom" }
				]
			},
			{
				type: "text_input",
				action_id: "custom_color",
				label: "【任意カラー】カラーコード（スタイルで「任意カラー」を選んだ場合に有効）",
				placeholder: "例：#0066b1（ブルー） / #28a745（グリーン） / #ff6600（オレンジ）"
			},
			{
				type: "select",
				action_id: "shape",
				label: "【形状】ボタンの角丸デザイン",
				initial_value: "rounded",
				options: [
					{ label: "スクエア型（角丸8px：基本・高級感のあるシャープな印象）", value: "rounded" },
					{ label: "ピル型（丸み・ラウンド：現代的でクリックしやすい）", value: "pill" },
					{ label: "完全スクエア（角丸なし・シャープな四角）", value: "square" }
				]
			},
			{
				type: "select",
				action_id: "has_arrow",
				label: "【矢印アイコン】右端のアニメーション矢印表示",
				initial_value: "true",
				options: [
					{ label: "矢印あり（→ ホバーで右へアニメーション）", value: "true" },
					{ label: "矢印なし（テキストのみですっきり）", value: "false" }
				]
			},
			{
				type: "select",
				action_id: "target_blank",
				label: "【リンクの開き方】",
				initial_value: "auto",
				options: [
					{ label: "自動判定（外部URLは新規タブ、サイト内は同一タブ）", value: "auto" },
					{ label: "同じタブで開く（現在のページから移動）", value: "self" },
					{ label: "新しいタブで開く（別ウィンドウで開く）", value: "blank" }
				]
			}
		]
	},
	{
		type: "table",
		label: "スペック比較表（スプレッドシート・CSVコピペ対応）",
		icon: "table",
		description: "ExcelやGoogleスプレッドシートの表をそのままコピー＆ペースト（TSV/CSV）するだけで、スマホ対応の美しいスペック表が作成できます",
		category: "レイアウト",
		fields: [
			{
				type: "text_input",
				action_id: "title",
				label: "【表の見出し】表の上に表示するタイトル（任意）",
				placeholder: "例：MINI「SELECT」シリーズ 全ラインアップ スペック比較"
			},
			{
				type: "text_input",
				action_id: "raw_csv",
				multiline: true,
				label: "【表データ】Excel / スプレッドシートから表をコピーして貼り付け（タブ区切り / CSV）",
				placeholder: "モデル名\tボディタイプ\tサイズ（全長×全幅×全高）\t税込車両価格\t従来比差額目安\nMINI Cooper 3 Door C SELECT\t3ドアハッチバック\t3,875 × 1,745 × 1,455 mm\t3,650,000円〜\t約 -30万〜-40万円\nMINI Cooper 5 Door C SELECT\t5ドアハッチバック\t4,035 × 1,745 × 1,470 mm\t3,770,000円〜\t約 -30万〜-40万円\nMINI Countryman C SELECT\tSUV\t4,445 × 1,845 × 1,640 mm\t4,490,000円〜\t約 -40万〜-50万円"
			},
			{
				type: "text_input",
				action_id: "caption",
				multiline: true,
				label: "【注釈・補足】表の下に表示する注意書き・免責事項（任意）",
				placeholder: "例：※従来モデルとの差額については、オプション等を含めない標準価格より算出しています。"
			}
		]
	}
];
