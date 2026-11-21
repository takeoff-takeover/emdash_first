This is an EmDash site -- a CMS built on Astro with a full admin UI.

## Commands

```bash
npm run dev              # Start the Astro dev server
npm run db:backup        # Backup D1 database to seed/backup.sqlite
npm run db:restore --force # Restore D1 database from seed/backup.sqlite
npm run typecheck        # Typecheck TypeScript
npx emdash types         # Regenerate TypeScript types from a running site
```

The admin UI is at `http://localhost:4321/_emdash/admin` (Direct bypass login: `http://localhost:4321/_emdash/api/auth/dev-bypass?redirect=/_emdash/admin`).

## Key Files

| File                     | Purpose                                                                            |
| ------------------------ | ---------------------------------------------------------------------------------- |
| `astro.config.mjs`       | Astro config with `emdash()` integration, database, and storage                    |
| `src/live.config.ts`     | EmDash loader registration (boilerplate -- don't modify)                           |
| `seed/seed.json`         | Schema definition + demo content (collections, fields, taxonomies, menus, widgets) |
| `emdash-env.d.ts`        | Generated types for collections (auto-regenerated on dev server start)             |
| `src/layouts/Base.astro` | Base layout with EmDash wiring (menus, search, page contributions)                 |
| `src/pages/`             | Astro pages -- all server-rendered                                                 |

## Skills

Agent skills are in `.agents/skills/`. Load them when working on specific tasks:

- **building-emdash-site** -- Querying content, rendering Portable Text, schema design, seed files, site features (menus, widgets, search, SEO, comments, bylines). Start here.
- **creating-plugins** -- Building EmDash plugins with hooks, storage, admin UI, API routes, and Portable Text block types.
- **emdash-cli** -- CLI commands for content management, seeding, type generation, and visual editing flow.
- **dev-setup** -- 「準備して」「開発準備して」等の開始合図でGit最新同期・DB復元・ローカル起動・URL案内を一括実行するスキル。
- **handover-wrapup** -- 「明日のための準備して」「引き継ぎ」「まとめて」等の終了合図でDBバックアップ・引き継ぎ書作成・GitHub同期を一括実行するスキル。
- **seo-geo-audit** -- 見た目を維持したままHTML構造、JSON-LD、alt属性、AI検索（GEO）最適化を点検・適用するスキル。

## Documentation

The EmDash docs are available as an MCP server at `https://docs.emdashcms.com/mcp`. When you need to verify an API, hook, config option, field type, or pattern, call `search_docs` against the live documentation rather than relying on training-data recall. The docs reflect current behaviour; assumptions may not.

This template ships with `.mcp.json`, `.cursor/mcp.json`, and `.vscode/mcp.json` so Claude Code, Cursor, and VS Code auto-discover the docs server. Other tools (OpenCode, Windsurf, etc.) need a manual one-time setup -- see [docs.emdashcms.com/docs-mcp](https://docs.emdashcms.com/docs-mcp).

## Rules

- All content pages must be server-rendered (`output: "server"`). No `getStaticPaths()` for CMS content.
- Image fields are objects (`{ src, alt }`), not strings. Use `<Image image={...} />` from `"emdash/ui"`.
- `entry.id` is the slug (for URLs). `entry.data.id` is the database ULID (for API calls like `getEntryTerms`).
- When Astro's cache is enabled, pass content-query hints to `Astro.cache.set(cacheHint)`. Use the `WithCacheHint` variants for site settings, menus, taxonomies, and widget areas rendered by cached routes.
- Taxonomy names in queries must match the seed's `"name"` field exactly (e.g., `"category"` not `"categories"`).
- **Design principles (デザイン基本原則)**:
  1. *モノトーン基調＋アクセントレッド*: 「黒・白・グレー」を基調とし、日常テキストや通常の装飾に赤色を乱用しない。「赤色（アクセントレッド）」は最重要CTAや勝負所のハイライトのみに限定。発光・ボケ感のあるグロー影（カラーハロー）は厳禁とし、ソリッドな真紅枠（Dark Chassis / Style B）または薄型サテンマット（Satin Crimson / Style C）を公式仕様とする。
  2. *品格のある自然なテキスト（不要な装飾の排除）*: 「SPECIAL BENEFITS」等のAI特有の英字ラベルや、ギャラリーの「PHOTO GALLERY」「全○点」「【エクステリア】」等の冗長な宣伝文句は入れず、シンプルで品格ある日本語表現にする。
  3. *最適な幅・余白と情報密度*: 無理に画面いっぱいに広げて無駄な余白を作らず、コンテンツに応じた幅を選択する。スマートフォン表示でも要素が無駄に縦延びせず、左右バランス良く密度の高い洗練されたレイアウトにする。
  4. *車両写真のトリミング厳禁（全景カットの欠損禁止）*: 車の写真が中途半端に切れるようなトリミングやレイアウトは厳禁。意図的なディテール寄り（エンブレム、ライト、ホイール等のクローズアップ）はOKだが、車体の8割など全景が写っているのにバンパーやタイヤ、ルーフ、前後端が切れてしまうトリミング・レイアウトは絶対に避けること。車両全体像を見せる写真は、車体全体が美しく完全に収まるようアスペクト比・レイアウト（`object-fit: contain` や全幅表示など）を設計すること。
  5. *写真前提の説明と「No Image」プレースホルダー原則*: ヘッドライト、内装ディスプレイ、シート質感、ホイールなどの「写真があって初めて成立する解説」では、写真配置を前提としたレイアウト（左右分割ブロック `split_media` や写真カード等）を優先採用すること。執筆・生成時点で該当写真がない場合でもテキストのみに後退させず、必ず `NO IMAGE` プレースホルダー画像（`/images/no-image.svg`）を配置してブロックを完成させること。これにより人間が後から管理画面で実写真を手動差し替えする目安とする。
  6. *モバイル・タブレット表示の厳格点検とテーブル横スクロール廃止（カード自動変形原則）*: 全てのコンテンツ・ブロックは必ずスマホ（375px〜768px）およびタブレット（768px〜1024px）でも崩れがないか点検すること。テーブル（スペック表・価格一覧）は横スクロールを強要せず、1024px以下で美しいスペックカード一覧（`<dl><dt><dd>` 構造、タブレットでは2列グリッド、スマホでは1列縦並び）に自動変形させること。項目名が二重に表示される疑似要素ハック（`::before { content: attr(data-label); }`）は厳禁とし、カード形式で左右すっきり配置して1文字ごとの縦折れや横スクロール・端の見切れを完全に排除すること。
  7. *見出しの自然な文節改行ルール（言葉の途中のぶつ切り改行禁止）*: 記事タイトル（H1）、大見出し（H2）、中見出し（H3）、小見出し（H4）、カードタイトル等において、言葉・単語の途中（例: 「メリッ/ト」「注/意点」等）で文字が不自然に泣き別れ改行される現象は厳禁。CSSの `word-break: auto-phrase !important; line-break: strict !important;` を全見出しに徹底適用するとともに、記事タイトルでは意味のまとまり（句・文節・助詞の切れ目）ごとに `<span class="title-phrase">`（`display: inline-block`）で自然に改行する構造を担保すること。
  8. *見出しセクション・ブロック間のゆったりした余白設計（トピック境界の明確化とカード内余白保護）*: 「見出しから次の見出しが始まるまで」をひとつの完結したコンテンツブロックとして捉え、ブロック間のスペースを日常の段落間（約28px）や要素内マージンよりも意図的に広く確保すること。大見出し（H2）の前は `clamp(80px, 8.5vw, 116px)`、中見出し（H3）の前は `clamp(56px, 6vw, 76px)` のゆったりとしたマージンを設け、新しいトピック・章が始まったことが直感的に伝わる品格あるブリージングスペース（呼吸感）を担保すること（連続する見出し間は詰める）。【厳格禁止】この大余白は本文直下のセクション見出し（「30秒でわかること」等）のみに限定し、カード内部や各種ブロック内部の見出しには絶対に波及・適用させないこと（カード内のデザインバランスと情報密度を崩さない）。
  9. *背景・枠線なしカード（flat）の写真前提原則とテキストカードのボックス化保護*: 背景や枠線のないフラットカード（`card_style: "flat"`）は、写真がある場合のみ許可。テキストのみ（`.is-text-only`）のカードは文字が空間に浮いて視認性・境界が曖昧になるため、必ず背景パネルと境界線を持ったボックス型（`card_style: "box"` または `"step"`）として表現すること。コンポーネント側でも写真が1枚もない場合は自動的にボックス型へフォールバックする安全保護ロジックを担保すること。
  10. *見出しなき箱・カードブロックの連続スタック禁止（トピック境界と順序付けの厳格化）*: 見出しや適切な文脈（リード文）を挟まずに、異なるスタイルや目的のカードグループ（箱）を2段連続で直結して並べることは厳禁。話題の切り替わりには必ず小見出し（H3等）と導入文を設け、思考の区切りを明確にすること。また、時系列や手順ではない並列要素に無意味にステップ番号（`step`）を付与せず、並列要素は統一したボックス型（`box`）で整理すること。
  11. *コンバージョン導線のCTAブロック化と記事末尾の集約原則*: 「○○について相談する」「商談予約をする」等のアクション導線や重要リンクは、本文中の生テキストやインラインリンクで放置せず、必ず正規のCTAブロック（`cta`）としてボタン化すること。記事末尾の注釈・免責事項はバラバラに放置せず単一の `notes` ブロックに美しく集約し、ハードコードされた関連記事や手動リンク群は削除してCMSの正規導線・CTAに統一すること。
  12. *臨機応変なタイトル中央揃えと全体の重量・統一感バランス原則*: ページ内のセクションにおいて、左右対称に広がるグリッドカード群、統計表、アコーディオン、全幅テーブルなどのように「全体または一部が中央・左右均等に寄るレイアウト」が存在する場合、教条的に左揃えに固執せず、臨機応変にセクションタイトル・サブタイトルを中央揃え（センター配置）にすること。左右分割の非対称ブロック（代表メッセージ等）は自然な左揃えを維持しつつ、左右対称ブロックは中央揃えにするなど、ページ全体としての重量バランス（視覚的重心）、統一感ある美しさを最優先に判断すること。
  13. *注記・補足の縦線（左ボーダー）および安易な箱化・背景色変更の禁止（脱AI装飾原則）*: 注釈（※印など）、補足、リード文等の横・左側に配置する縦線（`border-left`）や、安易に背景色を変えたボックス（箱囲み・枠線付きカード化）はいかにもAI特有の安っぽい装飾であるため、公開Webサイト（フロントページ）ではユーザーから明示的な指示がない限り絶対に使用してはならない（管理画面／Admin UIは実用性の観点から問題なし）。注記は背景色変更や縦線（左ボーダー）をつけず、文字サイズやテキストカラーの明度差のみでシンプルかつ品格ある自然なテキストとして表現すること。
- **Workflows (Skills)**: 開発開始時は `dev-setup`、作業終了・引き継ぎ時は `handover-wrapup`、SEO/AI検索診断時は `seo-geo-audit` スキルを実行すること（詳細は `.agents/skills/` を参照）。
- **Deploy rule**: Cloudflareへのデプロイ・本番アップロード（`wrangler deploy`）は、ユーザーから明示的に指示があった場合のみ実行すること。ユーザーの指示がない限り勝手に本番へアップロードせず、ローカル環境（`http://localhost:4321`）での確認にとどめること。
- **Admin UI direct access rule**: ユーザーから「管理画面」や「Admin」についての指示や質問があった際は、通常のログイン画面（`/_emdash/admin`）ではなく、必ず認証バイパス用の直接アクセスリンク [http://localhost:4321/_emdash/api/auth/dev-bypass?redirect=/_emdash/admin](http://localhost:4321/_emdash/api/auth/dev-bypass?redirect=/_emdash/admin) を提示・案内すること。
- **Clickable URL rule**: チャット上でユーザーにWebページのURLや管理画面リンクを提示する際は、インラインコードやプレーンテキストで囲まず、必ずワンクリックで直接遷移できるMarkdownリンク形式（例: `[表示名](URL)` または `[URL](URL)`）で記述すること。テキストをコピー＆ペーストさせないこと。
- **Official location naming rule**: 拠点名や指定工場の表記には、拠点マスタ（データベース・一覧）に登録されている正式表記（例: カタカナ「サービスセンター」ではなく、正式英語表記「`Nicole BMW Service Centre`」等）を常に厳格に用いること。
- **Magazine Editorial & SEO/AIO Content rule**: オウンドメディア・マガジン記事（`src/pages/magazine/`、CMSコレクション `magazine`）の執筆・作成時は、即答性（Direct Answerability）・データとスペックの構造化（Table & DL）・FAQ/JSON-LD連動・一次情報（E-E-A-T）を順守すること。
- **Block-First Article Authoring rule (ブロックファースト記事作成原則・手動編集担保)**: 誰が（人間）作っても、どのAI（Claude, Cursor, Antigravity, Windsurf等）が作っても、後から管理画面（Admin UI）で手作業で直接手直し・加筆・修正ができるよう、記事コンテンツは構造化ブロック（Portable Textブロック）を基本単位として作成すること。生HTML（`CustomHtmlBlock` 等）にテーブルやレイアウトを丸ごと流し込む作成方法は原則禁止。比較表・スペック表は `table` (TableBlock)、CTAボタンは `cta` (CTABlock)、注釈・補足は `notes` または段落スタイル `note`、カード列は `columnCards`、FAQは `accordion`、画像スライダーは `slider` などの標準ブロックを使用し、管理画面から誰でも直感的にセル単位・項目単位で打ち替えできるようにすること（詳細は `.agents/rules/article-block-rules.md` を参照）。
- **Editor-Render Parity rule (エディタ設定・装飾の完全描画保証原則)**: 管理画面のエディタ上で設定できるすべての項目（文字揃え `textAlign: left/center/right/justify`、リンクの別タブ `blank: true`、インライン装飾等）は、Astro側のカスタムブロック（`RichPortableText`、`CustomParagraph`、`CustomHeading`、`CustomLink` 等）で100%確実に拾い上げてWebサイト側に反映すること。CSS側でも `.prose` による上書きを防止し、管理画面の設定がそのまま最優先で見た目に反映されるよう担保すること。
- **Dual-File Rulebook Parity rule (AGENTS.md & CLAUDE.md 完全同期原則)**: `AGENTS.md` と `CLAUDE.md` は常に100%同一の内容を維持しなければならない。Claude Code、Antigravity、Cursor、Windsurf等、どのAIツールで作業・ルール追加・修正・学習を行った場合でも、必ず両方のファイル（`AGENTS.md` および `CLAUDE.md`）にまったく同じ内容を反映・同期すること。片方のみの更新・乖離は厳禁とする。
- **Smart Anchor & Case-Insensitive Jump rule (スマートアンカー・表記揺れ自動吸収原則)**: 見出し末尾の `[#anchor]` 記法（または `{#anchor}`）による自動ID付与をサポートするとともに、HTMLのCase-Sensitive仕様によるリンク切れを防止するため、大文字・小文字両方のエイリアスID（`<span id="...">`）を自動生成し、さらにクライアントJSで大文字小文字無視のスムーズスクロールを担保すること。編集者が `#FAQ` と書いても見出しが `[#faq]` であっても100%確実にジャンプする環境を維持すること。
- **Admin UI Live-Sync & Field Type Rule (管理画面・スキーマ完全最新化および正規フィールド型原則)**: スキーマ（`seed/seed.json`）、フィールド定義、コレクション設定、シードデータを追加・変更した際は、コード編集のみで放置せず、必ずローカルデータベース（SQLite/D1）に対しても `ALTER TABLE` および `_emdash_fields` テーブルへのメタデータ登録、DBバックアップ（`npm run db:backup`）を即座に実行し、管理画面（Admin UI）上で100%確実に最新の編集項目および実データが即座に表示・編集できる状態を担保しなければならない。「直したのに管理画面に反映されていない」状態の放置は厳禁とする。【最重要フィールド型規約】ブロックエディタフィールドの型名は必ず `portableText`（column_type は `JSON`）を使用すること。一般的なCMS用語である `richText` や `blocks` はEmDash未対応型であり、指定すると管理画面が「This entry is read-only because its schema uses field types this version of EmDash does not support」エラーとなって一切編集できなくなるため厳禁とする。
- **Article Slug Naming Rule (記事スラッグ命名規則・公開年月プレフィックス原則)**: 記事（マガジン `magazine`、お知らせ `posts`、キャンペーン `campaigns` 等）のスラッグ（URL識別子）を新規作成・命名する際は、必ず公開年月（`YYYYMM` 4桁年+2桁月）を先頭に付与し、アンダースコアに続けて英小文字・ハイフンで簡潔に記述すること（例: `202611_xxxxxxx`）。日（DAY `DD`）までは含めず、公開月（`YYYYMM`）で統一すること。また、全ブランド対象記事（特定単一ブランドに属さない記事）にはブランド分類として「`ALL BRANDS`」を割り当てること。
- **Constructive Pushback & Advisory Partnership Rule (プロフェッショナル助言・安全ブレーキ原則)**: ユーザーからの指示・希望を単に盲目的に実装するのではなく、プロフェッショナルな視点で一度立ち止まり、技術的・運用上・デザイン上のデメリットやリスク（CMS管理画面の手動編集との衝突、モバイル/タブレット表示の破綻、過度な共通化によるコード肥大化、ブランド品格・一貫性の毀損、表示速度/SEO低下など）が生じる恐れがある場合は、必ず作業を進める前に「リスクの理由」と「本来の目的を安全に達成できる代替案」を率直に提示し、ユーザーに確認・相談した上で進めること。
- **Question-First Response Rule (質問優先・作業前回答原則)**: ユーザーから「なぜ〜か」「どうして」「おしえて」「どういうこと」などの質問・理由の確認・疑問を投げかけられた際は、先回りして勝手にコード編集や修正作業を行ってはならない。まずは純粋な質問への理由・背景・現状の分析・選択肢をテキストで回答し、ユーザーの理解・確認および次の方針指示を待ってから作業に移ること。
- **Typography & Font rule (欧文・和文フォント設計原則・等幅フォント完全排除)**: 欧文は全見出し・英数字・メタラベルを含め Helvetica Neue / Helvetica（ヘルベチカ）を一貫して最優先適用。和文（日本語）はシステムフォントスタック（Mac/iOS:「ヒラギノ角ゴ ProN」、Windows:「游ゴシック」、Android:「Noto Sans JP」/システムゴシック）を採用し、Webフォント遅延・レイアウトシフト（CLS）ゼロの最速高精細描画を担保すること。JetBrains Mono などの等幅フォント（Monospace）はサイト全体から完全排除し、一切使用してはならない。
- **Magazine Article Title & Layout Rules (マガジン記事タイトル・アイキャッチ・構成原則)**:
  1. *タイトルの適正長（PCで2行目安）*: 記事タイトルは冗長な修飾語を詰め込まず、PC表示時に美しく2行以内に収まる文字量（目安40〜48文字前後）を厳格に順守すること。長すぎるタイトルは厳禁。
  2. *アイキャッチ写真の余白とモデル選定（空間美と最新モデル優先）*: アイキャッチ画像は車体が枠いっぱいに詰まったトリミングや余白のない写真は厳禁とし、美しい背景・周囲の呼吸感（余白）が確保された魅力的な公式写真・広角構図を採用すること。また比較・新型予告記事では、必ず「新しいモデル（次期型・新型コンセプト等）」の写真をアイキャッチに据えること。
  3. *矢印の連続使用禁止とアクセントカラー活用*: 「30秒でわかること」等のカードやリストにおいて、「→」「▶」などの矢印を各項目で連続・多用することは厳禁。視線誘導が必要な場合は矢印の乱用を避け、文字色（ブランドアクセントカラー/赤等）や下線による品格あるリンク表現にすること。
  4. *テキスト連続の防止と合間の写真配置*: 記事内で解説文や見出し（判断基準等）が長く連続して文字だらけにならないよう、章の合間や結論・総括セクションの手前等に必ず車両写真・ディテール写真を挟み込み、視覚的な呼吸感を担保すること。
  5. *安易な「プロ」文言の排除（品格ある表現）*: 「プロの結論」「プロが教える〜」「プロが提案する〜」といった俗っぽくチープな表現は厳禁とし、「結論」「エディターズノート」「推奨されるスマートな乗り継ぎ解」「正規ディーラーNicole BMWが提案する〜」など、インテリジェントで品格ある言葉遣いに統一すること。

## This Template

A blog with posts, pages, categories, tags, full-text search, and RSS. Designed for personal writing, technical writing, indie newsletters, and anything where the writing is the product. Neutral editorial aesthetic: a framed layout with hairline rails, white cards on an off-white canvas, Helvetica / Helvetica Neue typography, and real article structure with bylines and reading time.

## Pages

| Page        | Path               | What it shows                                                                                                                  |
| ----------- | ------------------ | ------------------------------------------------------------------------------------------------------------------------------ |
| Home        | `/`                | Site title and tagline, featured post card (first post with an image), latest posts grid                                       |
| All posts   | `/posts`           | Post rows with thumbnails, excerpts, bylines, and tag chips; cursor pagination                                                 |
| Post detail | `/posts/[slug]`    | Tags, title, excerpt, featured image, then a three-column reading view: meta rail, body, table of contents and sidebar widgets |
| Search      | `/search`          | Full-text search over posts; matching title terms are highlighted                                                              |
| Page        | `/pages/[slug]`    | Static page content (Portable Text)                                                                                            |
| Category    | `/category/[slug]` | Card grid of posts in a category                                                                                               |
| Tag         | `/tag/[slug]`      | Card grid of posts with a tag                                                                                                  |
| RSS         | `/rss.xml`         | Generated feed                                                                                                                 |

## Schema

- `posts` collection: `title`, `featured_image`, `content` (Portable Text), `excerpt` (text).
- `pages` collection: `title`, `content` (Portable Text). Used for `/about` etc.
- Taxonomies: `category`, `tag`.
- Single `primary` menu (Home, About, Posts by default).

Site settings have `title` and `tagline`. The title renders in the header, the home page intro, and the footer; the tagline renders under the title in the home page intro and in the footer.

## Visual character

The palette is neutral: an off-white canvas (`--color-bg`), white surfaces (`--color-surface`), and near-black ink. `--color-brand` is ink too -- it drives buttons, links, focus rings, and the site monogram. Dark mode inverts the same scale.

Every page sits in a frame: two hairline rails run the full height of the page, and each full-width section (`.band`) is ruled off with a hairline that meets the rails at a small crosshair. Cards are white with a 1px ring and a soft shadow, and their images are inset so the corners stay concentric (`--radius-xl` card = `--radius-lg` image + `--card-padding`).

Type is **Helvetica** / **Helvetica Neue** on `--font-body` for everything, with weight and size carrying the hierarchy. Small uppercase labels (`.eyebrow`) used for section names and meta also use Helvetica / Helvetica Neue. Page titles use `--font-size-display` with tight tracking; the home intro pairs the site title with the tagline as a muted second line.

The article layout is the standout feature: a meta rail (authors, date, reading time), a 680px body column, and a rail with the table of contents and sidebar widgets. Below 1100px it collapses to one column, the table of contents is hidden, and the widgets move under the article. Don't flatten it on desktop -- the layout signals "this is something to read".

## Customisation

Design tokens live in `src/styles/tokens.css` with their default values. To restyle the site, override tokens in `src/styles/theme.css` -- declarations there are unlayered, so they always beat the `@layer base` defaults. Don't edit `tokens.css` or `Base.astro` for visual changes.

Colours are defined with `light-dark(<light>, <dark>)`, so each token carries both modes. Overriding with a plain colour changes light and dark at once; use `light-dark()` in the override to keep them distinct. There is no separate dark palette to maintain. To give the site a colour, set `--color-brand`, `--color-brand-hover`, and `--color-on-brand` together: `--color-on-brand` defaults to near-black in dark mode, to sit on the light ink brand.

Webfonts are configured in `astro.config.mjs` under `fonts:`. To swap the body face, change the `name:` for the entry bound to `cssVariable: "--font-body"`. Good alternatives: Geist, IBM Plex Sans, Söhne (if you have a licence), Public Sans. If you want a serif-bodied blog, swap to a humanist serif like Source Serif, Crimson Pro, or Lora -- but then also raise `--font-size-base` to `1.0625rem` for readability. To give headings their own face (or use a system font) without touching the font pipeline, override `--font-heading` or `--font-body` in `theme.css`.

`Base.astro` defines the shared building blocks every page uses: `.frame` (content width, aligned with the rails), `.band` and `.section` (full-width sections), `.intro`, `.eyebrow`, `.chip`, `.btn`, and `.post-grid`. Posts render through `src/components/PostCard.astro` (`card`, `feature`, and `row` variants) and bylines through `src/components/Byline.astro`.

CSS variables worth knowing (see `tokens.css` for the full list):

- `--color-brand`, `--color-brand-hover`, `--color-on-brand`, `--color-brand-ring`
- `--color-bg`, `--color-surface`, `--color-fill`, `--color-text`, `--color-text-secondary`, `--color-muted`, `--color-border`, `--color-ring`
- `--font-body`, `--font-heading`, `--font-mono`
- `--font-weight-heading` / `--font-weight-display` (both 600) -- heading weights; lower them if you switch to a serif
- `--font-size-display` -- page titles
- `--radius-sm` / `--radius` / `--radius-lg` / `--radius-xl` / `--radius-full`, `--card-padding`
- `--shadow-card`, `--shadow-card-hover`
- `--content-width` (680px) -- article body column
- `--wide-width` (1200px) -- the frame, rails included
- `--frame-margin` / `--frame-padding` -- space outside and inside the rails
- `--meta-col-width` (180px) / `--gutter-width` (200px) -- the article rails
- `--avatar-size-{xs,sm,md,lg}` -- byline avatar sizes

## What not to do

- Don't add a second accent colour or coloured section backgrounds. If the site needs a colour, it goes in `--color-brand`.
- Don't replace Helvetica with a display sans (Bebas, Anton, etc.). Headings rely on weight and size, not novelty faces.
- Don't break the frame: new sections should be `.band` elements with their content in a `.frame`, so the rails and rules line up.
- Don't collapse the article rails on desktop -- they're part of the reading experience.
- Don't use stock blog copy ("Welcome to my blog", "Stay tuned for more"). Write a real tagline that says what this blog is about.
- Don't seed the home page with three identical placeholder posts. If you only have one real post, show one real post.
- Comments are enabled on posts and rendered on the post detail page. Configure moderation before publishing the site, or remove `commentsEnabled` and the comments UI together.
