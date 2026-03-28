# Railway デプロイ準備 — Claude Code 向け指示書

## 概要

ポートフォリオ＋オンラインショップサイト（React 19 + Vite + Express + tRPC + Drizzle/MySQL + Stripe + AWS S3）を Railway にデプロイするための事前準備。

**この指示書でやること：** コード側の修正のみ。Railway アカウント作成やDB作成は手動で行うため対象外。

---

## Task 1: vite.config.ts の修正

**ファイル:** `client/vite.config.ts`

### 1-1. `base` を変更

```diff
- base: "/portfolio-shop-site/",
+ base: "/",
```

GitHub Pages 用のサブパス設定を削除。Railway では独自ドメイン直下で配信するため不要。

### 1-2. Manus 系プラグインを削除

`vitePluginManusRuntime` のインポートと使用を削除する。

```diff
- import { vitePluginManusRuntime } from "vite-plugin-manus-runtime";

- const plugins = [react(), tailwindcss(), jsxLocPlugin(), vitePluginManusRuntime()];
+ const plugins = [react(), tailwindcss(), jsxLocPlugin()];
```

### 1-3. allowedHosts から Manus 系ドメインを削除

開発用の `localhost` と `127.0.0.1` だけ残す。

```diff
  server: {
    host: true,
    allowedHosts: [
-     ".manuspre.computer",
-     ".manus.computer",
-     ".manus-asia.computer",
-     ".manuscomputer.ai",
-     ".manusvm.computer",
      "localhost",
      "127.0.0.1",
    ],
```

---

## Task 2: Manus 系の依存パッケージを削除

**ファイル:** ルートの `package.json`

```diff
  "devDependencies": {
-   "vite-plugin-manus-runtime": "^0.0.57",
    ...
  }
```

修正後、`pnpm install` を実行して lockfile を更新する。

---

## Task 3: Manus 系の型定義・コードを確認・整理

**確認対象:** `server/_core/types/manusTypes.ts`

このファイルの中身を確認し、以下を判断する：

- 他のファイルから import されているか？
  - **されていない場合** → ファイルごと削除
  - **されている場合** → import 元を確認し、Manus 固有の機能なら代替実装を検討。判断に迷ったら作業を止めて確認を求める

**確認対象:** `server/_core/env.ts`

以下の環境変数が Manus（Forge）専用かどうかを確認する：

- `BUILT_IN_FORGE_API_URL`
- `BUILT_IN_FORGE_API_KEY`

これらを参照しているファイルを検索し、Manus 専用であれば env.ts から該当行を削除する。他の用途で使われている場合はそのまま残す。

---

## Task 4: 環境変数の一覧ドキュメントを作成

プロジェクト全体で `process.env.` を検索し、使われている環境変数をすべて洗い出す。

以下のテンプレートで `.env.example` をプロジェクトルートに作成する：

```env
# ===================
# Database (Railway が自動生成)
# ===================
DATABASE_URL=mysql://user:password@host:port/dbname

# ===================
# Authentication
# ===================
JWT_SECRET=your-jwt-secret-here
OAUTH_SERVER_URL=
OWNER_OPEN_ID=

# ===================
# App
# ===================
VITE_APP_ID=
NODE_ENV=production

# ===================
# Stripe（該当ファイルから変数名を特定すること）
# ===================
# 例: STRIPE_SECRET_KEY=sk_live_xxx
# 例: STRIPE_WEBHOOK_SECRET=whsec_xxx
# → プロジェクト内で process.env.STRIPE で検索して正確な変数名を記載

# ===================
# AWS S3（該当ファイルから変数名を特定すること）
# ===================
# 例: AWS_ACCESS_KEY_ID=
# 例: AWS_SECRET_ACCESS_KEY=
# 例: AWS_REGION=
# 例: S3_BUCKET_NAME=
# → プロジェクト内で process.env.AWS / process.env.S3 で検索して正確な変数名を記載

# ===================
# Manus / Forge（本番不要の可能性あり）
# ===================
# BUILT_IN_FORGE_API_URL=
# BUILT_IN_FORGE_API_KEY=
# → Task 3 の結果に応じてコメントアウトまたは削除
```

**重要：** `process.env.` でプロジェクト全体を grep し、上記テンプレートに載っていない環境変数があれば追記すること。

---

## Task 5: ビルド動作確認

すべての修正が完了したら、以下を実行してビルドが通ることを確認する：

```bash
pnpm install
pnpm build
```

エラーが出た場合は修正する。特に Manus 系の削除に伴う import エラーに注意。

---

## 補足: Railway デプロイ時の設定メモ（手動作業用）

この項目は Claude Code の作業対象外。オーナーが手動で行う際の参考情報。

### Railway プロジェクト設定

- **Build Command:** `pnpm install && pnpm build`
- **Start Command:** `pnpm start`
- **Watch Paths:** `/` (デフォルトのまま)

### Railway 環境変数

- `DATABASE_URL` → Railway MySQL プラグイン追加時に自動設定される
- その他の変数 → `.env.example` を参考に Railway のダッシュボードで設定

### デプロイ後の追加作業

- Stripe Webhook URL を本番ドメインに更新
- AWS S3 の CORS に本番ドメインを追加
- 独自ドメインの設定（必要な場合）
