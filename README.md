# portfolio-shop-site

ポートフォリオ兼ショップサイトのフルスタック構成です。フロントは Vite + React、バックエンドは Express + tRPC、DB は Drizzle ORM + MySQL を想定しています。

## 構成

- `client/`: フロントエンド (Vite)
- `server/`: バックエンド (Express + tRPC)
- `shared/`: 共有の型/定数
- `drizzle/`: スキーマとマイグレーション
- `patches/`: pnpm patch

## セットアップ

```bash
pnpm install
```

## 開発サーバー

```bash
pnpm dev
```

起動ログに `Server running on http://localhost:3000/` が表示されます。空きがない場合は 3000 番以降へ自動的に切り替わります。

## ビルド/本番

```bash
pnpm build
pnpm start
```

## 環境変数

`.env` を作成して必要な値を設定してください。

必須に近いもの:
- `DATABASE_URL` (MySQL 接続文字列)
- `VITE_APP_ID`
- `VITE_OAUTH_PORTAL_URL`
- `JWT_SECRET`
- `BUILT_IN_FORGE_API_URL`
- `BUILT_IN_FORGE_API_KEY`

機能により必要なもの:
- `OWNER_OPEN_ID` (管理者ロール付与)
- `OAUTH_SERVER_URL`
- `STRIPE_SECRET_KEY`
- `VITE_ANALYTICS_ENDPOINT`
- `VITE_ANALYTICS_WEBSITE_ID`
- `VITE_FRONTEND_FORGE_API_URL`
- `VITE_FRONTEND_FORGE_API_KEY`

## DB

```bash
pnpm db:push
```

## 主なスクリプト

- `pnpm dev` 開発サーバー起動
- `pnpm build` フロント/サーバーのビルド
- `pnpm start` 本番起動
- `pnpm check` 型チェック
- `pnpm test` テスト
