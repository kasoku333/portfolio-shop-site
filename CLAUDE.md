# CLAUDE.md — portfolio-shop-site

イラスト・漫画・小説を並べるポートフォリオと、デジタル/実物商品を売るショップを
1つにしたフルスタック個人サイト。作者（はるか）が1人で運用する。

このファイルは AI アシスタント向けの作業ガイド。README.md はセットアップ手順、
todo.md は機能単位の進捗を持つ。**設計の意図と落とし穴はこのファイルに集約する。**

---

## 技術スタック

| 層 | 採用 |
|---|---|
| フロント | React 19 / Vite 7 / TypeScript 5.9 / Tailwind CSS 4 / shadcn-ui (Radix) |
| ルーティング | react-router-dom v6 の **HashRouter** |
| データ取得 | tRPC v11 + TanStack Query v5（transformer は superjson） |
| サーバ | Express 4 + tRPC（`/api/trpc`）+ Google OAuth |
| DB | Drizzle ORM + MySQL（mysql2） |
| 決済 | Stripe Checkout |
| テスト | Vitest（node 環境・サーバのみ） |
| パッケージ管理 | **pnpm 10.15.1**（workspace）。npm / yarn は使わない |

---

## ディレクトリ構成

```
client/          Vite アプリ。src/pages が画面、src/components/ui が shadcn 生成物
server/          Express + tRPC。_core/ が基盤、直下が業務ロジック
  _core/         index.ts（起動）context.ts（認証）trpc.ts（procedure定義）
                 oauth.ts sdk.ts env.ts vite.ts cookies.ts llm.ts notification.ts
  routers.ts     appRouter 本体。ここが API の全体像
  db.ts          Drizzle クエリヘルパー（全 DB アクセスはここ経由）
  storage.ts     アップロード先（**ローカルFS**。後述）
  siteSettings.ts  server/site-settings.json を読み書きするファイルストア
shared/          クライアント/サーバ共有の定数・型（`@shared/*`）
drizzle/         schema.ts + 生成済みマイグレーション（0000〜0002）
patches/         pnpm patch 置き場（現在は死んでいる。後述）
.github/workflows/  ci.yml（型・ビルド・テスト）/ pages.yml（Pages デプロイ）
start-*.cmd      Windows 用のワンクリック起動スクリプト
```

パスエイリアス（tsconfig / vite / vitest の3箇所で定義。**変えるなら3箇所とも**）:

- `@/*` → `client/src/*`
- `@shared/*` → `shared/*`
- `@assets/*` → `attached_assets/*`（vite / vitest のみ）

---

## コマンド

```bash
pnpm install          # 依存導入（CI は --frozen-lockfile）
pnpm dev              # client(5173) と server(3000) を並列起動
pnpm check            # tsc --noEmit（CI と同じ）
pnpm test             # vitest run（server/**/*.test.ts のみ）
pnpm build            # vite build → esbuild で server をバンドル
pnpm start            # NODE_ENV=production node dist/index.js
pnpm format           # prettier --write .
pnpm db:push          # drizzle-kit generate && drizzle-kit migrate
```

**push 前に必ず `pnpm check` と `pnpm test` を通す。** CI がこの順で落ちる。
`pnpm db:push` は `DATABASE_URL` 必須（drizzle.config.ts が未設定なら throw する）。

---

## アーキテクチャ

### リクエストの流れ

```
ブラウザ → /api/trpc/<router>.<procedure>
   ├ 開発: Vite(5173) の proxy → Express(3000)
   └ 本番: Express(3000) が dist/public も配る
Express → createContext（認証解決）→ appRouter → server/db.ts → MySQL
```

`server/routers.ts` の `appRouter` が API の全体像。新しい API はここに足す。
DB へは必ず `server/db.ts` のヘルパー経由で触る（routers から drizzle を直接叩かない）。

### 認証は2系統ある

`server/_core/context.ts` が毎リクエストで、この順に解決する。

1. **管理者パスワードログイン** — `auth.adminLogin` に `ADMIN_PASSWORD` を渡すと
   JWT を発行し `app_session_id` クッキーに載せる。`ctx.adminSession` に入る
2. **Google OAuth** — `/api/oauth/login` → `/api/oauth/callback`。
   `users` テーブルに upsert され、`ctx.user` に入る

procedure は3種（`server/_core/trpc.ts`）:

| procedure | 条件 |
|---|---|
| `publicProcedure` | 誰でも |
| `protectedProcedure` | `ctx.user` が必要 |
| `adminProcedure` | `ctx.user.role === "admin"` が必要 |

> **⚠ 現状の実装ギャップ（把握した上で触ること）**
>
> 管理系の書き込み（`artworks.create/update/delete`、`products.*`、
> `orders.listAll` / `orders.updateStatus`、`siteSettings.update`）は
> **すべて `publicProcedure` のまま**で、サーバ側の認可が無い。
> `adminProcedure` は `system.notifyOwner` でしか使われていない。
> `/admin` 画面の保護は `AdminDashboard.tsx` のクライアント側リダイレクトだけで、
> しかも `auth.me` が何か返せば role を `"admin"` と決め打ちしている。
>
> つまり **API を直接叩けば誰でも書き換えられる**。
> ここを直すなら `adminProcedure` への差し替え＋`auth.me` の role を素直に返す修正がセット。
> 直さないなら、少なくとも「守られている」前提のコードを新たに増やさないこと。

### ストレージ

`server/storage.ts` は **`server/uploads/` へのローカル書き込み**。Express が
`/uploads` で静的配信する。`package.json` に `@aws-sdk/client-s3` が入っていて
`server/upload.ts` のコメントにも "Upload to S3" とあるが、**S3 は使っていない**。
コメントが実装より古いだけなので、S3 前提で読まないこと。

アップロードは tRPC の `upload.image` に base64 で送る方式。
そのため express の body limit が `150mb` まで引き上げてある。

### サイト設定

`siteSettings.get/update` はDBではなく `server/site-settings.json` を読み書きする。
**リポジトリにコミットされているファイルを実行時に上書きする**ので、
本番で更新した内容は次のデプロイで巻き戻る。作り込むならDBへ移す。

### DB は無くても起動する

`server/db.ts` の `getDb()` は `DATABASE_URL` が無ければ `null` を返し、
各ヘルパーは warn を出して空配列や undefined を返す。
ローカルで DB 無しでも画面は立ち上がる（データが出ないだけ）。テストもこれに依存している。

---

## 触るときに事故りやすい所

### 1. ポートは固定。自動退避させない

- Express は **3000 固定**。埋まっていたら `EADDRINUSE` で明示的に落ちる
- Vite は **5173 固定**（`strictPort: true`）

Vite の devProxy（`/api`, `/uploads`）が 3000 を決め打ちしており、
`start-*.cmd` は 5173 を待ち受ける前提。**どちらもポートを退避させると繋がらなくなる。**
「ポートが埋まってるので別ポートにする」対処はここでは間違い。掴んでいるプロセスを落とす。

### 2. HashRouter なので URL は `/#/xxx`

`client/src/main.tsx` は `HashRouter`。管理画面は `http://localhost:5173/#/admin`。
過去に「HashRouter とアンカーリンクの競合で `/#/` 内リンクが 404」という
不具合を踏んでいる（`510cead`）。ページ内アンカーとルート遷移を混ぜるときは注意。

### 3. GitHub Pages 版にはバックエンドが無い

`pages.yml` は `vite build` でクライアントだけを焼いて `dist/public` を上げる。
`/api/trpc` は存在しないので、**Pages 上では DB 由来の表示は動かない**（見た目の確認用）。
`--base=/portfolio-shop-site/` を CLI で渡して `client/vite.config.ts` の
`base: "/"` を上書きしている。base を触るときは両方見る。

### 4. 開発サーバは2経路ある

`pnpm dev` は client と server を並列起動するが、`NODE_ENV=development` の
Express 自身も `setupVite()` で Vite をミドルウェアとして持つ。
つまり 5173（proxy経由）と 3000（Express内蔵Vite）の両方から同じ画面が出る。
挙動の違いを追うときは、いま自分がどちらを見ているか先に確定させる。

### 5. `patches/wouter@3.7.1.patch` は死んでいる

ルーティングは react-router-dom に移行済みで、wouter は依存に無く、
`package.json` に `patchedDependencies` の記載も無い。**適用されていない残骸。**
消してよいが、消すなら単独のコミットで。

### 6. `start-*.cmd` は作者の Windows 環境専用

`C:\Users\81904\AppData\Roaming\npm` を PATH に足すハードコードがある。
中身は Shift-JIS のコメント付き。**Linux/CI から実行するものではない。**
編集するときは文字コードを壊さないよう、必要な行だけ触る。

---

## 環境変数

`.env`（gitignore 済み）に置く。雛形は `.env.example`。

必須:
`DATABASE_URL` / `JWT_SECRET` / `VITE_APP_ID`

機能ごと:
- 管理者ログイン: `ADMIN_PASSWORD`
- Google OAuth: `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` / `ADMIN_EMAIL`
- 決済: `STRIPE_SECRET_KEY`
- 通知: `FORGE_API_URL` / `FORGE_API_KEY`
- その他: `OWNER_OPEN_ID` / `PORT`（既定 3000）/ `NODE_ENV`

サーバ側は `server/_core/env.ts` の `ENV` 経由で読むのが基本。
`.env` の中身をログや PR に貼らないこと。

---

## テスト

- `vitest.config.ts` の `include` は `server/**/*.test.ts` のみ。**クライアントのテストは無い**
- 環境は `node`。DB には繋がず、`appRouter.createCaller(ctx)` に
  手組みの `TrpcContext` を渡して procedure を直接呼ぶ形（`server/routers.test.ts` 参照）
- 認証込みのテストを書くなら、既存の `createAuthContext()` / `createPublicContext()` を真似る
- `tsconfig.json` は `**/*.test.ts` を除外しているので、**テストの型エラーは `pnpm check` では出ない**

---

## コーディング規約

- **Prettier がフォーマットの正**（`.prettierrc`: セミコロン有 / ダブルクォート /
  printWidth 80 / `arrowParens: "avoid"`）。手で整形せず `pnpm format`
- UI は shadcn-ui。`components.json` は style `new-york` / baseColor `neutral` / CSS変数。
  **`client/src/components/ui/` は生成物**なので、独自の見た目は上位コンポーネント側で当てる
- 配色は `client/src/index.css` の oklch 変数（`--primary` 等）で定義。
  テーマは `App.tsx` で `defaultTheme="light"` 固定（`switchable` はコメントアウト中）
- コメントは日本語で、**「なぜそうしたか」を書く**。既存コード（`vite.config.ts` の
  strictPort、`index.ts` のポート固定）がその書き方の見本
- 型は `strict: true`。`any` で潰さない

---

## Git / CI

- 作業ブランチ: `claude/claude-md-docs-q696z6`。push は `git push -u origin <branch>`
- PR は **draft** で作る
- CI（`ci.yml`）は push to main と全 PR で発火し、`install → check → build → test`
- `pages.yml` は main への push で GitHub Pages へデプロイ
- コミットメッセージは日本語。`feat:` / `fix:` / `style:` の prefix が混在しているが、
  **既存の流儀に合わせる**（直近は prefix 有りが多数）

> このリポジトリには CI があるので、PR を作ったあとの監視は意味がある。
> ただし発火するのは CI と、レビュアーがついた場合のみ。
> 自動チェックインの扱いは Skills リポジトリの CLAUDE.md にある
> 「自動チェックインのルール」に従うこと。
