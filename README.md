# portfolio-shop-site
※ ローカルでの実行は任意。ビルド確認は GitHub Actions を推奨。
イラスト・漫画・小説のポートフォリオと、BOOTHへの購入導線をまとめた個人サイトです。  
（※ログイン機能は当面なし）

## 構成

- `client/` : Vite + React のフロントエンド
- `server/` : Express + tRPC のバックエンド（※将来用／現状は未使用の可能性あり）
- `shared/` : 共有の型・定数
- `drizzle/` : DB関連（将来用）

## まず何ができる？

- 作品（ポートフォリオ）の閲覧
- 商品ページ/作品ページから BOOTH へ遷移して購入

## 開発（ローカル）

> ローカルで動かす場合のみ必要です。PCが重い場合はGitHub Actionsでビルド確認できます。

```bash
pnpm install
pnpm dev


