# Nicole Group Web デザインシステム・実装マニュアル（DESIGN MANUAL）

本ドキュメントは、Nicole Group 公式Webサイトにおけるデザイン原則、デザイントークン（CSS変数）、共通UIコンポーネント、および実装規約をまとめたマスター仕様書です。

> **内部確認用スタイルガイド（Living Style Guide）**:  
> ローカル開発環境の [http://localhost:4321/design-system](http://localhost:4321/design-system) にて、フォント・色見本・コンポーネントの実物を確認およびカラー変数のワンクリックコピーが可能です。

---

## 1. 4大デザイン原則

1. **徹底したラグジュアリー・モノトーン**
   - 黒（`#0a0a0c`）・白（`#ffffff`）・グレーの緻密な階調のみで奥行きを表現。
   - 不要な装飾グラデーションや多色使いを厳禁とする。
2. **勝負所の赤（限定運用）**
   - アクセントレッド（`var(--color-accent-red)`: `#e11d48`）は、最重要CTAボタンや成約ハイライトなど「ここぞという勝負所」にのみ限定。
   - 日常テキストや汎用装飾での赤色乱用を禁ずる。
3. **幾何学的同心円の美**
   - 外枠カード角丸（`18px`）＝ 内部メディア角丸（`12px`）＋ パディング（`6px`）。内外のコーナーが数学的に美しい同心円を描く設計比率を厳守。
4. **マジックナンバーの完全禁止（トークン強制）**
   - CSSに直接ピクセル数値（例: `padding: 27px;` や `color: #333333;`）を書くことを禁止し、必ず定義済みのCSS変数（デザイントークン）のみを使用してスタイリングする。

---

## 2. デザイントークン一覧（Tokens & Variables）

### ① カラーパレット（Luxury Dark Palette）

| トークン名 | 値 | 役割・用途 |
| :--- | :--- | :--- |
| `--color-bg` | `#0a0a0c` | ページ全体の深黒キャンバス背景 |
| `--color-surface` | `#141418` | カード、入力フォーム、メニュー等の面背景 |
| `--color-fill` | `#1e1e24` | サブボタン背景、タグチップ、ホバー領域 |
| `--color-fill-strong` | `#2a2a32` | 強調ホバー、アクティブ選択状態 |
| `--color-text` | `#f4f4f6` | 主要本文、高コントラスト白テキスト |
| `--color-text-secondary`| `#a0a0aa` | 補足テキスト、説明文（中間グレー） |
| `--color-muted` | `#71717a` | 日付、注記、非活性テキスト |
| `--color-border` | `#222228` | レイル外枠、主要な区切り境界線 |
| `--color-border-subtle` | `#1a1a20` | カード内の薄い区切り線 |
| `--color-border-strong` | `#383842` | 入力枠ホバー、クロスターゲット |
| `--color-brand` | `#ffffff` | プラチナブランド色（主要ボタン、白ハイライト） |
| `--color-brand-hover` | `#e4e4e7` | ブランド要素ホバー時 |
| `--color-on-brand` | `#09090b` | 白ボタン上の文字色 |
| **`--color-accent-red`** | **`#e11d48`** | **★ 最重要CTA・勝負所ハイライト専用赤** |
| `--color-accent-red-hover` | `#be123c` | アクセントレッドのホバー色 |

#### 機能アクション専用色（Utility Action Colors）
> ※OS連携（タップ発信・地図起動）専用。通常テキストや装飾での使用は禁止。

| トークン名 | 値 | 役割・用途 |
| :--- | :--- | :--- |
| `--color-utility-blue` | `#60a5fa` | 電話発信ボタン文字・アイコン色 |
| `--color-utility-blue-bg` | `rgba(59, 130, 246, 0.1)` | 電話発信ボタン背景透過 |
| `--color-utility-blue-border` | `rgba(59, 130, 246, 0.35)` | 電話発信ボタン境界線 |
| `--color-utility-blue-hover` | `#93c5fd` | 電話ボタンホバー文字色 |
| `--color-utility-green` | `#34d399` | ルート案内（Google Maps）ボタン文字色 |
| `--color-utility-green-bg` | `rgba(16, 185, 129, 0.1)` | ルート案内ボタン背景透過 |
| `--color-utility-green-border`| `rgba(16, 185, 129, 0.35)` | ルート案内ボタン境界線 |
| `--color-utility-green-hover` | `#6ee7b7` | ルート案内ボタンホバー文字色 |

---

### ② タイポグラフィ（Typography）

- **本文・見出しフォント**: `Inter`, sans-serif (`--font-body` / `--font-heading`)
- **コード・メタラベル**: `JetBrains Mono`, monospace (`--font-mono`)

| トークン名 | rem | px換算 | 主な適用箇所 |
| :--- | :--- | :--- | :--- |
| `--font-size-label` | `0.75rem` | 12px | モノスペース小ラベル、タグ |
| `--font-size-xs` | `0.8125rem`| 13px | 注記、テーブル内セル、サブテキスト |
| `--font-size-sm` | `0.875rem` | 14px | 補足説明、メタ情報、ボタンテキスト |
| `--font-size-base` | `1.0rem` | 16px | **本文（標準サイズ）** |
| `--font-size-lg` | `1.125rem`| 18px | リード文、大きめのリスト |
| `--font-size-xl` | `1.25rem` | 20px | 小見出し（H4、カードタイトル） |
| `--font-size-2xl` | `1.5rem` | 24px | 中見出し（H3） |
| `--font-size-3xl` | `2.0rem` | 32px | セクション大見出し（H2） |
| `--font-size-display` | 可変 | 36〜56px | ページ主要大タイトル（H1） |

---

### ③ 余白・角丸・レイアウト幅

- **レイアウト幅**:
  - 全体最大幅: `--wide-width` = `1200px`
  - 記事・読書カラム幅: `--content-width` = `680px`
  - 固定ヘッダー高: `--nav-height` = `64px`
- **余白スケール（8点グリッド）**:
  - `--spacing-1` (4px), `--spacing-2` (8px), `--spacing-3` (12px), `--spacing-4` (16px), `--spacing-6` (24px), `--spacing-8` (32px), `--spacing-12` (48px), `--spacing-16` (64px), `--spacing-24` (96px)
- **角丸スケール**:
  - 小型ボタン・バッジ: `--radius-sm` (6px)
  - 入力欄・コード枠: `--radius` (8px)
  - カード内部画像: `--radius-lg` (12px)
  - 外枠カード・パネル: `--radius-xl` (18px)
  - ピル型ボタン・タグ: `--radius-full` (999px)
  - カード内余白: `--card-padding` (6px)

---

## 3. 実装用コピペコードスニペット

### ① 最重要CTAボタン（勝負所の赤）
```html
<a href="/contact" class="btn-cta-accent">
  Web商談予約・お問い合わせ
</a>
```
```css
.btn-cta-accent {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-3) var(--spacing-6);
  background: var(--color-accent-red);
  color: var(--color-on-accent-red);
  border-radius: var(--radius-full);
  font-size: var(--font-size-sm);
  font-weight: 600;
  text-decoration: none;
  box-shadow: 0 4px 18px rgba(225, 29, 72, 0.4);
  transition: all var(--transition-fast);
}
.btn-cta-accent:hover {
  background: var(--color-accent-red-hover);
  transform: translateY(-1px);
}
```

### ② 電話発信ボタン（Utility Blue）
```html
<a href="tel:0445413011" class="btn-tel">
  📞 044-541-3011
</a>
```
```css
.btn-tel {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-2);
  padding: var(--spacing-3) var(--spacing-5);
  background: var(--color-utility-blue-bg);
  color: var(--color-utility-blue);
  border: 1px solid var(--color-utility-blue-border);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-sm);
  font-weight: 600;
  text-decoration: none;
  transition: all var(--transition-fast);
}
.btn-tel:hover {
  background: var(--color-utility-blue-bg-hover);
  color: var(--color-utility-blue-hover);
  border-color: var(--color-utility-blue-border-hover);
}
```

### ③ ラグジュアリーテーブル
```html
<div class="table-wrapper">
  <table class="cms-table">
    <thead>
      <tr>
        <th>拠点正式名称</th>
        <th>ブランド</th>
        <th>所在地</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Nicole BMW Head Showroom</td>
        <td>BMW</td>
        <td>神奈川県川崎市幸区</td>
      </tr>
    </tbody>
  </table>
</div>
```

---

## 4. 設計・実装ルール（NG集）

| 項目 | ⭕️ 推奨（Good） | ❌ 禁止（Bad） |
| :--- | :--- | :--- |
| **見出し** | 自然で品格のある日本語見出し | 「SPECIAL BENEFITS」「01 / 02」等の安易な英字添え |
| **拠点表記** | 公式マスタ準拠（`Nicole BMW Service Centre`） | カタカナ略称（「ニコル川崎サービスセンター」） |
| **色使い** | モノトーン＋勝負所の赤＋機能色（青・緑） | 通常テキストの赤文字化、装飾目的での多色乱用 |
| **余白指定** | `padding: var(--spacing-6);` | `padding: 23px;` などのマジックナンバー直書き |
| **スマホ表示**| 右側に隙間を作らず左右バランス良く情報密度を凝縮 | 要素が無駄に改行・縦延びして右側に不自然な余白ができる配置 |

---

## 5. 今後の移行ロードマップ（やることリスト）

詳細はプロジェクトルートの [`TODO.md`](TODO.md) を参照。

- [x] **主要ページのトークン連動化**: 拠点詳細（`/location/*`）、キャンペーン詳細（`/campaigns/*`）、トップ（`/`）、会社概要（`/corporate`）
- [ ] **固定ページのモダンAstro移行（Elementor旧コードの脱却）**:
  - [ ] 企業理念（`/philosophy`）
  - [ ] ESG/SDGs活動（`/esg_sdgs`）
  - [ ] カスタマーポリシー（`/customer-policy`）
  - [ ] プライバシーポリシー（`/privacystatement`）
  - [ ] 5大事業会社個別ページ（`/corporate/nicole-cars` 等）
  - [ ] ブランド紹介ページ（`/bmw`, `/mini`）
