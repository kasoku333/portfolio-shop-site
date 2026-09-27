# Railway へのデプロイ手順

アプリ本体（Node サーバ）と MySQL を Railway に置く。
アップロード画像とサイト設定は Railway の **Volume**（永続ディスク）に保存するので、
再デプロイや再起動をしても消えない。

## 全体像

```
Railway プロジェクト
├── portfolio-shop-site（GitHub から自動デプロイ）
│     └── Volume（/data） … 画像・site-settings.json
└── MySQL                 … 作品・商品・注文・ユーザー
```

## 1. プロジェクトを作る

1. Railway にログインし、**New Project → Deploy from GitHub repo** で `kasoku333/portfolio-shop-site` を選ぶ
2. 同じプロジェクトで **+ New → Database → MySQL** を追加する

ビルド・起動のコマンドは `railway.json` に書いてあるので、画面で設定しなくてよい。
Railway が `server` / `client` / `drizzle` を別々のサービスに分けようとしたら、`server` 以外を消し、
Build Command・Start Command・Watch Patterns の上書きも消しておく（リポジトリ全体で1つのアプリ）。

- ビルド: `pnpm build`
- 起動: `pnpm start`（起動時に `drizzle/` のマイグレーションを流すので、DB のテーブルは自動で最新になる）

## 2. Volume を付ける

アプリのサービスを右クリック → **Attach Volume**、マウントパスは `/data`。

Volume を付けると `RAILWAY_VOLUME_MOUNT_PATH` が自動で入り、
アプリはそこに `uploads/` と `site-settings.json` を置く（`server/dataDir.ts`）。

## 3. 環境変数を入れる

アプリのサービス → **Variables** で設定する。

| 変数 | 値 |
|---|---|
| `DATABASE_URL` | `${{MySQL.MYSQL_URL}}`（MySQL サービスの参照） |
| `JWT_SECRET` | 長いランダム文字列。**空だとログインできない** |
| `ADMIN_PASSWORD` | 管理画面のパスワード |
| `ADMIN_EMAIL` | Google ログインを許可する管理者のメールアドレス |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Google ログインを使う場合 |
| `STRIPE_SECRET_KEY` | 決済を使う場合 |

`JWT_SECRET` は手元で次のように作れる：

```
node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
```

`PORT` と `NODE_ENV` は設定しなくてよい（Railway が `PORT` を入れ、`pnpm start` が `NODE_ENV=production` にする）。

## 4. 公開 URL を作る

アプリのサービス → **Settings → Networking → Generate Domain**。
独自ドメインを使うならここで追加する。

Google ログインを使う場合は、Google Cloud Console の OAuth クライアントの
「承認済みのリダイレクト URI」に `https://<発行されたドメイン>/api/oauth/callback` を追加する。

## 5. 動作確認

1. 公開 URL を開いてトップページが出る
2. `/admin` でパスワードログインできる
3. 作品を画像付きで登録する
4. Railway でサービスを **Redeploy** し、画像とサイト設定が残っていることを確認する

## 知っておくこと

- **Volume 付きのサービスは 1 台でしか動かせない。** 台数を増やす（replicas）ことはできない。ポートフォリオなら問題ない
- **再デプロイ時に数秒〜数十秒止まる。** Volume を付け替えるため
- **料金の目安**：Hobby プラン月 $5（$5 分の利用料込み）。アプリ + MySQL が小規模なら、その範囲かやや超える程度。Volume は 1GB あたり月 $0.15
- ローカルの MySQL にある作品データは Railway には自動で移らない。移すなら `mysqldump` で書き出して Railway の MySQL に流し込み、
  `server/uploads/` の画像も Volume にコピーする必要がある（必要になったら相談）
- GitHub Pages のデプロイ（見た目確認用）はそのまま残っている。Railway が動いたら止めてよい
