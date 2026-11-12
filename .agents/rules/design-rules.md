# Design & Visual Rules

## 1. Color Palette: Monotone Base + Strategic Red
- **Base Palette (Monotone)**:
  - The fundamental palette is strictly **Black, White, and Gray (Monotone)**:
    - Backgrounds: Deep black (`#0a0a0c`), dark surfaces (`#141418`), neutral off-white/grays.
    - Typography: Pure white (`#ffffff`), secondary silver-gray (`#a0a0aa`), muted gray (`#71717a`).
    - Borders & Lines: Subtle hairline grays (`#222228`, rgba white 0.08-0.15).
  - Do NOT introduce arbitrary multi-colors, colorful gradients, or secondary brand tints (e.g. blue, green, yellow/gold, purple).

- **Strategic Accent Color: Red (ここぞという時の赤)**:
  - **Red (`#e11d48` / `#dc2626`) is reserved EXCLUSIVELY for high-impact focal points**:
    - Primary conversion CTAs (e.g., test-drive booking, important contact triggers).
    - Critical status tags or high-priority badges.
    - Do NOT overuse red on ordinary links, secondary buttons, borders, or general text. It must stand out with deliberate restraint.

## 2. Gallery Formatting Rules
- **Minimal & Standardized Gallery Format**:
  - Do NOT add redundant headings or promotional labels above galleries (e.g., "PHOTO GALLERY", "全○点", "公式プレスキットギャラリー").
  - Do NOT prepend category tags to captions (e.g., avoid "【エクステリア】", "【インテリア】").
  - Show only: high-resolution image, simple number indicator (`1 / 10`), clean title/caption, and standard navigation controls.

## 3. Vehicle Photography & Aspect Ratio Rules (車両写真のトリミング厳禁)
- **車両写真の中途半端なトリミング・カットは厳禁**:
  - 車両の8割など全景が写っているのに、バンパー・ホイール・ルーフ・前後端が中途半端に切れるようなトリミングや狭小な枠組みレイアウトは絶対に禁止。
  - **例外（意図的な寄り）**: エンブレム、テールライト、ステアリング、ホイールスポークなど、パーツやディテールを強調するために意図的に寄ったクローズアップ写真はOK。
  - 車両全景・3/4ビューを扱う場合は、車体全体が美しく完全に収まるようアスペクト比・レイアウト（`object-fit: contain` や全幅カードレイアウト等）を必ず設計すること。

## 4. Photo-First Explanation & "No Image" Placeholder Rule (写真前提レイアウトとNo Image配置)
- **写真があって成立する解説の原則**:
  - ヘッドライト形状、内装ディスプレイ、シート質感、ホイールなど「写真を見て初めて成立する装備や特徴の解説」は、写真配置を前提としたレイアウト（左右分割 `split_media` や写真カード等）を優先採用する。
- **実写真がない場合のルール**:
  - 記事作成・AI自動生成の時点で手元に該当写真がない場合でも、テキストのみの箇条書きに退行させてはならない。
  - 必ず統一の **「NO IMAGE」プレースホルダー画像（`/images/no-image.svg`）** を配置してブロックレイアウトを完成させること。
  - これにより読者にもレイアウト意図が伝わり、人間編集者が後から管理画面で実写真を手動差し替え・補充するための確実な目印となる。

## 5. Responsive Table & Tablet/Mobile Cardification Rule (横スクロール廃止とカード自動変形)
- **多列テーブルの横スクロール強要禁止**:
  - スペック比較表や価格表は、スマートフォン（〜768px）およびタブレット縦向き（768px〜1024px）で横スクロールさせてはならない。
  - 画面幅1024px以下で自動的に構造化スペックカード（`<dl><dt><dd>`）へ変形させること。
  - タブレット（641px〜1024px）では2列グリッドで高密度かつ左右バランスよく並べ、スマートフォン（〜640px）では1列の縦型カードに最適化する。
  - 疑似要素ハック（`::before { content: attr(...) }`）による項目名の重複やテーブル崩れは厳禁。

## 6. Natural Heading Line Break & Phrasal Wrapping Rule (見出しの自然文節改行・ぶつ切り禁止)
- **単語の途中・不自然な位置での改行禁止**:
  - 記事メインタイトル（H1）、大見出し（H2）、中見出し（H3）、小見出し（H4）、カード見出しにおいて、単語の途中（例: 「メリッ/ト」「注/意点」）で文字が泣き別れ改行される現象は厳禁。
  - **CSS適用**: すべての見出し要素に `word-break: auto-phrase !important; line-break: strict !important;` を指定し、自然言語文節単位での改行を強制する。
  - **H1タイトルのフレーズ分割**: 記事メインタイトルは句読点や助詞、括弧で区切られた意味のまとまりごとに `<span class="title-phrase">`（`display: inline-block`）で包み、画面幅が縮小した際もキリのよい文節単位でブロック改行される構造とする。

## 7. Section Block & Heading Spacing Rule (見出しセクション・ブロック間余白設計)
- **見出しから次の見出しまでを1つのブロックと定義**:
  - 記事の構造において「見出しから次の見出しが始まるまで」をひとつの完結した思考・話題ブロックとみなす。
  - 通常の段落送り（約28px）や要素内マージン（約44px）に比べて、ブロック間の境界（見出しの手前）には意図的に十分なブリージングスペース（余白）を確保すること。
  - **大見出し（H2）**: `margin-top: clamp(80px, 8.5vw, 116px)`（章の切り替わりを明確化）
  - **中見出し（H3）**: `margin-top: clamp(56px, 6vw, 76px)`（節の切り替わりを明確化）
  - **小見出し（H4）**: `margin-top: clamp(40px, 4.5vw, 54px)`
  - **例外（見出し連続）**: H2の直後にH3が続く場合（`h2 + h3`）は過大な隙間を避け `margin-top: 28px` とする。本文先頭の見出しは上部マージンを `0` とする。
  - **【最重要・厳格禁止】カード内見出しへの波及禁止**:
    - このセクション大余白は、本文直下の見出し（「30秒でわかること」等）のみを対象とする。
    - カード内部（4分割カード、左右分割メディアカード、スペックカード等）の見出し（タイトル）には絶対に波及させてはならず、必ず `margin-top: 0 !important;` を死守してカード本来の引き締まったデザインバランスを保つこと。
