# Portfolio Shop Site - TODO

## Database & Backend
- [x] Artworks テーブル設計（イラスト・漫画・小説）
- [x] Products テーブル設計（デジタル・実物両対応）
- [x] Artworks-Products 関連付けテーブル
- [x] Cart & CartItems テーブル
- [x] Orders & OrderItems テーブル
- [x] Profile テーブル（自己紹介・活動履歴）
- [x] スキーマ実装と db:push 実行
- [x] DB クエリヘルパー実装

## Frontend - Gallery & Shop UI
- [x] エレガントなデザイン基調の確立（色、フォント、レイアウト）
- [x] ギャラリーページ（グリッド表示）
- [x] 作品詳細モーダル
- [x] ショップページ（商品グリッド）
- [x] 商品詳細ページ
- [x] ナビゲーションバー（ギャラリー、ショップ、自己紹介、活動履歴）
- [x] 自己紹介ページ
- [x] 活動履歴ページ

## Product Management
- [ ] 商品管理ページ（オーナー用）
- [ ] 商品作成フォーム
- [ ] 商品編集フォーム
- [ ] 商品削除機能
- [ ] 画像アップロード機能（S3統合）
- [ ] 在庫管理UI

## Cart & Checkout
- [ ] カート表示ページ
- [ ] カートアイテム追加・削除・更新機能
- [ ] チェックアウトページ
- [ ] Stripe 決済統合
- [ ] 決済成功・失敗ページ

## Additional Pages
- [x] 自己紹介ページ
- [x] 活動履歴ページ
- [ ] 注文確認ページ
- [ ] 注文履歴ページ

## Backend Features
- [x] tRPC ルーター実装（ギャラリー、商品、カート、注文）
- [x] 認証・認可ロジック
- [x] Stripe 決済ヘルパー実装
- [x] Stripe Webhook 処理実装
- [x] ファイルストレージヘルパー実装（S3）
- [ ] オーナー通知機能（新規注文時）

## Testing & Deployment
- [x] vitest テスト作成（15個のテストが全てパス）
- [x] 動作確認
- [x] ユーザーへの納品準備


## Admin Dashboard（新規追加）
- [x] 管理者専用ダッシュボードページ（/admin）
- [x] アクセス制御（管理者ロールのみ）
- [x] 商品管理UI（作成・編集・削除）
- [x] 作品管理UI（ギャラリー作品の管理）
- [ ] 画像アップロード機能（S3統合）
- [ ] ファイル削除機能
- [ ] 在庫管理UI
- [ ] 注文管理・確認機能


## Image Upload Feature（新規追加）
- [x] ファイルアップロードUI実装（ドラッグ&ドロップ対応）
- [x] S3アップロードエンドポイント実装
- [x] 画像プレビュー機能
- [x] エラーハンドリング


## Gallery Display Feature（新規追加）
- [x] tRPCルーター拡張（作品一覧取得API）
- [x] ギャラリーページをデータベース連携に更新
- [x] 作品フィルタリング機能（イラスト・漫画・小説）
- [x] 作品詳細表示機能
- [x] 統合テスト


## ⚠️ Known Pre-existing CI Failures（要修正・main ブランチに既存）

GitHub Actions の `pnpm check`（TypeScript 型チェック）が main ブランチ時点で既に失敗しています。
ヒーロー画像 PR (#2) とは無関係。次回セッションで対応すること。

- [ ] `server/webhooks.ts:1` — `import { stripe } from "./stripe"` が壊れている。
  `server/stripe.ts` は `stripe` を直接 export しておらず、`getStripe()` / `isStripeConfigured()` などしか持たない。
  → `webhooks.ts` 側で `getStripe()` を呼ぶ形に直すか、`stripe.ts` で `stripe` を export する。
- [ ] `server/_core/notification.ts` / `server/_core/llm.ts` が `ENV.forgeApiUrl` / `ENV.forgeApiKey` を参照しているが、
  `server/_core/env.ts` の `ENV` オブジェクトにこれらのキーが存在しない（`TS2339`）。
  → `env.ts` に `forgeApiUrl: process.env.FORGE_API_URL ?? ""` / `forgeApiKey: process.env.FORGE_API_KEY ?? ""` を追加する。
- [ ] 上記修正後、`pnpm check && pnpm build && pnpm test` をローカルで通してから push する。
