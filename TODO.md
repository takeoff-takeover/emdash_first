# プロジェクト・やることリスト（TODO LIST）

最終更新: 2026年11月9日

---

## 📌 デザインシステム＆UI移行タスク（最優先バックログ）

### 【完了済み】
- [x] **デザインシステム基本仕様の策定・マニュアル化**
  - カラーパレット（深黒 `#0a0a0c`、プラチナブランド `#ffffff`、勝負所の赤 `#e11d48`）
  - 機能アクション色（電話発信用青 `#60a5fa`、ルート案内用緑 `#6ee7b7`）の公式認可・定義
  - デザイントークン体系（フォント、サイズスケール、8点グリッド余白、同心円角丸比率）
  - マニュアル文書 [`DESIGN_MANUAL.md`](file:///Users/kazumasatakemoto/dev/my-emdash-site/DESIGN_MANUAL.md) 作成
- [x] **社内確認用スタイルガイドページ構築**
  - [http://localhost:4321/design-system](http://localhost:4321/design-system)（完全独立レイアウトで構築・カラーコード即時コピー対応）
- [x] **主要ページのデザイントークン連動化（フェーズ1）**
  - 拠点詳細ページ（`src/pages/location/[slug].astro`）: 電話・ルートボタンの完全トークン化
  - キャンペーン詳細ページ（`src/pages/campaigns/[slug].astro`）: 最重要CTAボタン（勝負所の赤）のトークン化
  - トップページ（`src/components/NicoleHomeMain.astro`）: マガジンボタン・会社案内ボタン等のトークン化
  - 会社概要ページ（`src/pages/corporate.astro`）: 黒背景・フォント・会社データテーブルの完全トークン化

---

### 【今後のやること（未着手・順次対応）】

#### 1. 固定ページのモダンAstro構造への順次移行（Elementor旧コードの脱却）
現在、旧WordPress / Elementorの静的HTML・CSS（`elementorHtml`）を忠実に再現している以下の固定ページについて、リニューアルやコンテンツ改定のタイミングに合わせて、会社概要（`/corporate`）と同等の「黒背景エディトリアル・独自Astroコンポーネント」へ順次移行・トークン連動化する。

- [ ] **`/philosophy`（企業理念）**
  - MISSION / VISION / VALUES の3つの核心カードをモダンなAstroコンポーネントへ再構築
  - デザイントークン（`var(--color-bg)`, `var(--color-surface)`, `var(--spacing-*)` 等）へ完全連動化
- [ ] **`/esg_sdgs`（ESG / SDGs活動）**
  - 環境保全・社会貢献・ガバナンスのコンテンツブロックをAstroコンポーネント化
- [ ] **`/customer-policy`（カスタマーポリシー）**
  - ポリシー規定・番号付きリストのセマンティックHTML化
- [ ] **`/privacystatement`（プライバシーステートメント）**
  - 個人情報保護方針テキストの構造化・可読性向上
- [ ] **5大事業会社の個別詳細ページ（`/corporate/*`）**
  - [ ] `nicole-cars.astro`（ニコル・カーズ合同会社）
  - [ ] `nicole-automobiles.astro`（ニコル・オートモビルズ合同会社）
  - [ ] `nicole-motorcars.astro`（Nicole MotorCars合同会社）
  - [ ] `nicole-competizione.astro`（Nicole Competizione合同会社）
  - [ ] `nicole-racing-japan.astro`（ニコル・レーシング・ジャパン合同会社）
- [ ] **ブランド紹介ページ（`/bmw`, `/mini`）**
  - 旧Elementorの静的HTMLから、モダンなブランド紹介レイアウトへの刷新

#### 2. サイト全体の直書き数値（マジックナンバー）点検・リファクタリング
- [ ] 各種Astroコンポーネント内に残る細かな直書きピクセル・カラーコードを、`DESIGN_MANUAL.md` 記載のCSS変数へ順次統一。
