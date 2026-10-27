# 自宅PCでの開発・確認セットアップ手順 (Nicole Group / EmDash)

このプロジェクトは、自宅のPCや別の環境でも全く同じ状態（全画像・全記事31件・BMW/MINI動的モデル・拠点一覧・管理画面）を再現できるようにセットアップされています。

---

## 🚀 3ステップで起動する手順

### 1. リポジトリをクローン
```bash
git clone https://github.com/takeoff-takeover/emdash_first.git
cd emdash_first
```

### 2. 依存関係のインストール
```bash
npm install
```
> **自動実行される処理**:
> `npm install` 実行時に `scripts/restore-db.mjs` が自動起動し、`seed/backup.sqlite` からローカルD1データベース（全31記事・設定・管理者アカウント）が自動復元されます。

### 3. 開発サーバーの起動
```bash
npm run dev
```

---

## 🌐 アクセス先一覧

| ページ | URL | 説明 |
| :--- | :--- | :--- |
| **トップページ** | [http://localhost:4321/](http://localhost:4321/) | Nicole Group 公式トップ（黒背景マガジンテイスト） |
| **BMW ブランドページ** | [http://localhost:4321/bmw](http://localhost:4321/bmw) | BMW全21車種ラインナップ & 12拠点ショールーム |
| **MINI ブランドページ** | [http://localhost:4321/mini](http://localhost:4321/mini) | MINI全9車種ラインナップ & 5拠点ショールーム |
| **拠点一覧** | [http://localhost:4321/locations](http://localhost:4321/locations) | ブランド横断（ALL / BMW / MINI / Rolls-Royce / Ferrari） |
| **管理画面 (Admin)** | [http://localhost:4321/admin](http://localhost:4321/admin) | **ワンクリック自動ログイン**（ログイン画面スキップ） |
| **記事アーカイブ** | [http://localhost:4321/posts](http://localhost:4321/posts) | インポート済み記事一覧 |

---

## 🛠 自宅での更新をGitHubに反映する手順

自宅PCで変更を加えた後は、通常通りコミット＆プッシュしてください：

```bash
# データベースの変更もバックアップに含めたい場合
npm run db:backup

# 変更をコミットしてプッシュ
git add .
git commit -m "feat: 自宅での更新内容"
git push origin main
```
