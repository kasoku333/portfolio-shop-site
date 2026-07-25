# 木陰の部屋（portfolio-shop-site）

漫画・イラスト・小説の作品を掲載するポートフォリオサイト。

**作品の頒布はBOOTHへ委譲しており、このサイト自体は決済を扱わない。** 商品一覧はカタログとして表示し、クリックするとBOOTHの商品ページへ遷移する。

フロントは Vite + React、バックエンドは Express + tRPC、DB は Drizzle ORM + MySQL。

---

## 販売をBOOTHへ委譲した経緯（2026年7月25日）

もともと自作のカート + Stripe決済を実装していたが、公開前のレビューで以下が判明したため停止した。

**セキュリティ上の問題**

- 商品・作品・注文・サイト設定・画像アップロードの変更APIが**無認証で呼べた**（注文情報には購入者の氏名・住所が含まれる）
- ブラウザから送られた価格をそのままStripeへ渡しており、**価格改ざんが可能**だった
- Webhookが未登録かつ署名検証なし。在庫減算・デジタル納品も未完成
- 画像アップロードのファイル名に `../` を含めると、保存先ディレクトリの外へ書き込めた

**採算の問題**

自作でも決済手数料は避けられない（Stripeの国内カードは3.6%）。BOOTHとの差は数%で、サーバー代を含めると小規模なうちはむしろ自作の方が高くつく。

**運用の問題**

返金対応、配送トラブル、在庫のズレ、依存ライブラリの脆弱性対応、特商法に基づく氏名・連絡先の開示。これらを個人で負う必要がなくなる。

→ **サイトは「作品を見せる場所」に専念し、決済・配送・個人情報の取り扱いはBOOTHに任せる**方針とした。

---

## 商品の追加・編集

管理画面（`/#/admin`、`ADMIN_PASSWORD` でログイン）から行う。

- **BOOTH商品ページURL** を設定すると、ショップ一覧のカードがそのURLへのリンクになる
- URLが未設定の商品は「**準備中**」と表示され、クリックできない
- `https://` を省いて貼っても自動で補完される
- 在庫数はBOOTH側が実数を持つため、サイトには表示しない

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

起動ログに `Server running on http://localhost:3000/` が表示されます。空きがない場合は 3000 番以降へ自動的に切り替わります。フロントは http://localhost:5173/ 。

ルーティングはハッシュベース（`/#/shop` のような形式）。

## ビルド/本番

```bash
pnpm build
pnpm start
```

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

## 環境変数

`.env` を作成して必要な値を設定してください。

必須に近いもの:
- `DATABASE_URL` (MySQL 接続文字列)
- `ADMIN_PASSWORD` (管理画面のログインパスワード)
- `JWT_SECRET`
- `VITE_APP_ID`
- `VITE_OAUTH_PORTAL_URL`
- `BUILT_IN_FORGE_API_URL`
- `BUILT_IN_FORGE_API_KEY`

機能により必要なもの:
- `OWNER_OPEN_ID` (管理者ロール付与)
- `OAUTH_SERVER_URL`
- `STRIPE_SECRET_KEY` (**現在は決済を停止しているため不要**)
- `VITE_ANALYTICS_ENDPOINT`
- `VITE_ANALYTICS_WEBSITE_ID`
- `VITE_FRONTEND_FORGE_API_URL`
- `VITE_FRONTEND_FORGE_API_KEY`

---

## 認証の仕組み（触る前に読むこと）

管理者判定には**2つの経路**がある。

1. `ADMIN_PASSWORD` によるパスワードログイン → `ctx.adminSession` が立ち、**`ctx.user` は null のまま**
2. OAuth 経由のログイン → `ctx.user.role === "admin"`

`server/_core/context.ts` は `adminSession` が立つとOAuth認証をスキップするため、**`ctx.user` だけを見て管理者判定すると、パスワードでログインした管理者が締め出される**。

`server/_core/trpc.ts` の `adminProcedure` は両方を許可している。ここを変更する際は `server/routers.test.ts` の「管理APIの保護」ブロックが回帰を検出する。

---

## ショップ機能について（停止中）

自作販売を再開できるよう、コードは削除せず残してある。

**退避ブランチ**

- `feature/shop-stripe` — カート・決済が完全に動いていた地点（リモートにもプッシュ済み）

**現ブランチに残っているファイル**（ルートから外してあるだけ）

- `client/src/pages/Cart.tsx`
- `client/src/pages/CheckoutSuccess.tsx`
- `client/src/pages/CheckoutCancel.tsx`
- `client/src/pages/Tokushoho.tsx`（特定商取引法に基づく表記）
- `client/src/contexts/CartContext.tsx`
- `server/stripe.ts` / `server/webhooks.ts`
- `server/routers.ts` の `cart` / `orders` / `checkout` ルーター

`client/src/App.tsx` のルート定義に登録しない限り読み込まれない。

### 再開する場合に必ず直すこと

以下は**未解決のまま停止している**。復活させるなら先に潰すこと。

1. **価格の再取得** — `checkout.createSession` はブラウザから渡された `price` をそのままStripeへ流す。`productId` から価格と在庫をサーバー側で引き直す実装に変えるまで、`adminProcedure` から `publicProcedure` に戻さないこと
2. **Webhookの署名検証** — `server/webhooks.ts` は署名を検証しておらず、Stripe側にエンドポイントも登録されていない。「設定していない購入者情報を読む」「日本円を100で割る」といった不整合も残っている
3. **購入完了の判定** — 成功URLを直接開くだけで「購入完了」と表示され、カートが空になる
4. **在庫・納品** — 在庫減算、注文商品明細の記録、デジタル商品のダウンロード配布とメール送信が未実装
5. **特商法の表記** — `Tokushoho.tsx` に運営責任者名が未入力、メールアドレスが仮のまま。自分で販売するなら氏名・連絡先の表示義務が発生する

---

## 今後の課題

- **公開先の決定**。現構成は Node/Express + MySQL + サーバー内へのファイル保存のため、静的ホスティングには載らない。Cloudflare Pages + D1 + R2 への移行が候補（Express を Workers 向けに書き換える必要あり）
- JSバンドルが約940KB。ページ単位の遅延読み込みで初回表示を軽くできる
- `client/src/index.css` の Google Fonts の `@import` 位置にビルド警告が出ている
- `todo.md` に実装済み機能と未実装機能が混在している
