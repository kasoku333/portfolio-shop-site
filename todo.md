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
- [x] カート表示ページ（/cart）
- [x] カートアイテム追加・削除・更新機能
- [x] チェックアウトページ（Stripeリダイレクト）
- [x] Stripe 決済統合（createCheckoutSession）
- [x] 決済成功・失敗ページ（/payment/success, /payment/cancel）

## Additional Pages
- [x] 自己紹介ページ
- [x] 活動履歴ページ
- [x] 注文確認ページ（決済成功ページ）
- [x] 注文履歴ページ（/orders）

## Backend Features
- [x] tRPC ルーター実装（ギャラリー、商品、カート、注文）
- [x] カート操作API（addItem, updateItem, removeItem, checkout）
- [x] 商品CRUD API（admin用）
- [x] 注文管理API（adminList, updateStatus）
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
- [x] 注文管理・確認機能（ステータス変更対応）


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
