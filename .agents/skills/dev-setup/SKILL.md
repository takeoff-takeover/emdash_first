---
name: dev-setup
description: >-
  ユーザーから「準備して」「開発準備して」「自宅（会社）に戻ったので準備して」「作業開始」「最新にして」などの開始指示があった際に使用する。
  ローカル差分の退避、mainブランチへの切り替え、リモート最新の確実な同期（git pull）、ローカルDB完全復元（npm run db:restore）、
  開発サーバー起動、管理画面URL案内をワンストップで一括実行する。
---

# Development Setup Workflow (開発準備・完全最新化スキル)

別PC（自宅／会社）やリモートで作業した最新の状態を確実に手元に再現し、ローカル環境で即座に開発を再開できるよう、以下のステップを自律的・順序通りに一括実行してください。

## 実行ステップ

### 1. ローカル状態の整理とブランチ確認
ローカルに作業中の未コミット変更や自動生成ファイルのゴミが残っていると、Gitが衝突（コンフリクト）を警戒して同期を中断してしまいます。
1. `git status` で現在のブランチと未コミットの変更を確認します。
2. もし未コミットの変更がある場合、安全のために一時退避（stash）します：
   ```bash
   git stash save "auto-stash before dev-setup"
   ```
3. 必ず `main` ブランチに切り替えます：
   ```bash
   git checkout main
   ```

### 2. リモート（GitHub）最新版の完全同期
1. リモートの最新情報を取得します：
   ```bash
   git fetch origin main
   ```
2. リモートの最新コミットをローカルに完全に取り込みます：
   ```bash
   git pull origin main
   ```
3. `git log -n 3 --oneline` で直近のコミットログを確認し、リモート最新の状態（HEAD）になっていることを確認します。

### 3. ローカルデータベース（D1）の完全復元
コードだけでなく、別環境で更新された最新の記事・画像・スキーマデータをローカルDBに確実に反映します。
1. リモートから最新化された `seed/backup.sqlite` からローカルDBを復元します：
   ```bash
   npm run db:restore
   ```
   ※ これにより、ローカルが古い過去のコンテンツデータのままになることを確実に防ぎます。

### 4. 依存パッケージと環境の確認（必要に応じて）
`package.json` や `package-lock.json` が更新されていた場合は、依存パッケージをインストールします：
```bash
npm install
```

### 5. 開発サーバーの起動と稼働確認
1. Astro開発サーバーが未起動の場合はバックグラウンドで起動します：
   ```bash
   npm run dev
   ```
2. サーバーがHTTP 200で正常に応答するか確認します：
   ```bash
   curl -I http://localhost:4321/
   ```

### 6. ユーザーへの状況報告とアクセスリンク提示
すべてのステップが完了したら、ユーザーに以下の形式で報告します。

* **Git最新化結果**: 取り込まれた最新コミットの要約（「〇〇のコミットまで反映済み」）
* **DB復元状況**: `seed/backup.sqlite` から最新コンテンツを復元した旨
* **サーバー状態**: 正常起動（ポート 4321）
* **アクセスリンク（Clickable URLルール準拠）**:
  * サイトトップ: [http://localhost:4321](http://localhost:4321)
  * 管理画面（認証バイパス直通）: [http://localhost:4321/_emdash/api/auth/dev-bypass?redirect=/_emdash/admin](http://localhost:4321/_emdash/api/auth/dev-bypass?redirect=/_emdash/admin)
