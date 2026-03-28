# Google OAuth 移行指示書 — Claude Code 向け

## 概要

管理画面へのログインを Manus OAuth から Google OAuth 2.0 に切り替える。
このサイトの認証は**管理者（1名）専用**で、一般ユーザーのログイン機能はない。

**方針：**
- Google OAuth 2.0 を直接実装（passport 等のライブラリは不要）
- 既存の JWT セッション管理（`signSession`, `verifySession`）はそのまま再利用
- 管理者のメールアドレスを環境変数で指定し、それ以外のログインは拒否する

---

## Task 1: manusTypes.ts を書き換え

**ファイル:** `server/_core/types/manusTypes.ts`

既存の Manus 型定義をすべて削除し、Google OAuth 用の型定義に置き換える。

```typescript
// Google OAuth 2.0 types

export interface GoogleTokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
  scope: string;
  id_token: string;
  refresh_token?: string;
}

export interface GoogleUserInfo {
  sub: string;        // Google のユーザー ID
  name: string;
  email: string;
  email_verified: boolean;
  picture?: string;
}
```

ファイル名を `manusTypes.ts` → `googleAuthTypes.ts` にリネームする。

---

## Task 2: sdk.ts を書き換え

**ファイル:** `server/_core/sdk.ts`

### 2-1. import を修正

```diff
- import type {
-   ExchangeTokenRequest,
-   ExchangeTokenResponse,
-   GetUserInfoResponse,
-   GetUserInfoWithJwtRequest,
-   GetUserInfoWithJwtResponse,
- } from "./types/manusTypes";
+ import type {
+   GoogleTokenResponse,
+   GoogleUserInfo,
+ } from "./types/googleAuthTypes";
```

### 2-2. OAuthService クラスを Google OAuth 用に書き換え

既存の `OAuthService` クラスと関連する定数（`EXCHANGE_TOKEN_PATH` 等）を削除し、
以下の `GoogleOAuthService` クラスに置き換える。

```typescript
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v3/userinfo";

class GoogleOAuthService {
  /**
   * 認可コードをアクセストークンに交換する
   */
  async exchangeCodeForToken(
    code: string,
    redirectUri: string
  ): Promise<GoogleTokenResponse> {
    const params = new URLSearchParams({
      code,
      client_id: ENV.googleClientId,
      client_secret: ENV.googleClientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    });

    const { data } = await axios.post<GoogleTokenResponse>(
      GOOGLE_TOKEN_URL,
      params.toString(),
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );

    return data;
  }

  /**
   * アクセストークンでユーザー情報を取得する
   */
  async getUserInfo(accessToken: string): Promise<GoogleUserInfo> {
    const { data } = await axios.get<GoogleUserInfo>(GOOGLE_USERINFO_URL, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    return data;
  }
}
```

### 2-3. SDKServer クラスを修正

**削除するもの：**
- `createOAuthHttpClient` 関数
- コンストラクタの `client` 引数と `this.client` フィールド
- `exchangeCodeForToken` メソッド（Google版に置き換え）
- `getUserInfo` メソッド（Google版に置き換え）
- `getUserInfoWithJwt` メソッド（Manus専用、不要）
- `deriveLoginMethod` メソッド（Google固定になるため不要）

**残すもの（そのまま維持）：**
- `SessionPayload` 型
- `parseCookies` メソッド
- `getSessionSecret` メソッド
- `createSessionToken` メソッド
- `signSession` メソッド
- `verifySession` メソッド

**書き換えるもの：**

コンストラクタ：
```typescript
class SDKServer {
  private readonly googleOAuth: GoogleOAuthService;

  constructor() {
    this.googleOAuth = new GoogleOAuthService();
  }
  // ...
}
```

`exchangeCodeForToken` を Google 版に：
```typescript
async exchangeCodeForToken(
  code: string,
  redirectUri: string
): Promise<GoogleTokenResponse> {
  return this.googleOAuth.exchangeCodeForToken(code, redirectUri);
}
```

`getUserInfo` を Google 版に：
```typescript
async getUserInfo(accessToken: string): Promise<GoogleUserInfo> {
  return this.googleOAuth.getUserInfo(accessToken);
}
```

`authenticateRequest` メソッドを修正：
- `getUserInfoWithJwt` の呼び出しを削除
- ユーザーがDBに存在しない場合は `ForbiddenError` を throw する（Google OAuth コールバック時に DB 登録するため、ここで未登録はありえない）

```typescript
async authenticateRequest(req: Request): Promise<User> {
  const cookies = this.parseCookies(req.headers.cookie);
  const sessionCookie = cookies.get(COOKIE_NAME);
  const session = await this.verifySession(sessionCookie);

  if (!session) {
    throw ForbiddenError("Invalid session cookie");
  }

  const user = await db.getUserByOpenId(session.openId);

  if (!user) {
    throw ForbiddenError("User not found");
  }

  await db.upsertUser({
    openId: user.openId,
    lastSignedIn: new Date(),
  });

  return user;
}
```

---

## Task 3: env.ts を修正

**ファイル:** `server/_core/env.ts`

Manus 系の変数を Google OAuth 用に置き換える。

```typescript
export const ENV = {
  appId: process.env.VITE_APP_ID ?? "",
  cookieSecret: process.env.JWT_SECRET ?? "",
  databaseUrl: process.env.DATABASE_URL ?? "",
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
  isProduction: process.env.NODE_ENV === "production",
  // Google OAuth
  googleClientId: process.env.GOOGLE_CLIENT_ID ?? "",
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
  adminEmail: process.env.ADMIN_EMAIL ?? "",
};
```

削除する行：
- `oAuthServerUrl`（Manus OAuth サーバー）
- `forgeApiUrl`（前回削除済みのはずだが残っていれば削除）
- `forgeApiKey`（同上）

---

## Task 4: oauth.ts を書き換え

**ファイル:** `server/_core/oauth.ts`（または `server/oauth.ts`）

Google OAuth のコールバック処理と、ログイン開始用のルートを実装する。

```typescript
import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import type { Express, Request, Response } from "express";
import * as db from "../db";
import { getSessionCookieOptions } from "./cookies";
import { ENV } from "./env";
import { sdk } from "./sdk";

/**
 * Google OAuth ログイン URL を生成する
 */
function buildGoogleAuthUrl(redirectUri: string): string {
  const params = new URLSearchParams({
    client_id: ENV.googleClientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "openid email profile",
    access_type: "offline",
    prompt: "select_account",
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

/**
 * リクエストから OAuth リダイレクト URI を構築する
 */
function getRedirectUri(req: Request): string {
  const protocol = req.headers["x-forwarded-proto"] || req.protocol;
  const host = req.headers["x-forwarded-host"] || req.get("host");
  return `${protocol}://${host}/api/oauth/callback`;
}

export function registerOAuthRoutes(app: Express) {
  /**
   * GET /api/oauth/login
   * Google OAuth ログインページにリダイレクトする
   */
  app.get("/api/oauth/login", (req: Request, res: Response) => {
    const redirectUri = getRedirectUri(req);
    const authUrl = buildGoogleAuthUrl(redirectUri);
    res.redirect(302, authUrl);
  });

  /**
   * GET /api/oauth/callback
   * Google からのコールバックを処理し、セッションを作成する
   */
  app.get("/api/oauth/callback", async (req: Request, res: Response) => {
    const code = typeof req.query.code === "string" ? req.query.code : undefined;
    const error = typeof req.query.error === "string" ? req.query.error : undefined;

    if (error) {
      console.error("[OAuth] Google returned error:", error);
      res.status(403).json({ error: "Authentication denied" });
      return;
    }

    if (!code) {
      res.status(400).json({ error: "Authorization code is required" });
      return;
    }

    try {
      const redirectUri = getRedirectUri(req);

      // 1. 認可コードをアクセストークンに交換
      const tokenResponse = await sdk.exchangeCodeForToken(code, redirectUri);

      // 2. ユーザー情報を取得
      const userInfo = await sdk.getUserInfo(tokenResponse.access_token);

      // 3. 管理者メールアドレスの確認
      if (!userInfo.email_verified) {
        res.status(403).json({ error: "Email not verified" });
        return;
      }

      if (userInfo.email.toLowerCase() !== ENV.adminEmail.toLowerCase()) {
        console.warn("[OAuth] Unauthorized login attempt:", userInfo.email);
        res.status(403).json({ error: "Unauthorized: admin access only" });
        return;
      }

      // 4. DB にユーザー情報を登録/更新
      //    openId には Google の sub（ユーザーID）を使用
      await db.upsertUser({
        openId: userInfo.sub,
        name: userInfo.name || null,
        email: userInfo.email,
        loginMethod: "google",
        lastSignedIn: new Date(),
      });

      // 5. JWT セッションを作成
      const sessionToken = await sdk.createSessionToken(userInfo.sub, {
        name: userInfo.name || "",
        expiresInMs: ONE_YEAR_MS,
      });

      // 6. Cookie にセッションを保存してリダイレクト
      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, {
        ...cookieOptions,
        maxAge: ONE_YEAR_MS,
      });

      res.redirect(302, "/");
    } catch (error) {
      console.error("[OAuth] Callback failed:", error);
      res.status(500).json({ error: "OAuth callback failed" });
    }
  });

  /**
   * POST /api/oauth/logout
   * セッション Cookie を削除してログアウトする
   */
  app.post("/api/oauth/logout", (req: Request, res: Response) => {
    const cookieOptions = getSessionCookieOptions(req);
    res.clearCookie(COOKIE_NAME, cookieOptions);
    res.json({ success: true });
  });
}
```

---

## Task 5: .env.example を更新

**ファイル:** `.env.example`

以下の変更を適用する：

```diff
  # ===================
  # Authentication
  # ===================
  JWT_SECRET=your-jwt-secret-here
- OAUTH_SERVER_URL=
- # → Google OAuth に移行予定。現在は Manus OAuth（未使用）
  OWNER_OPEN_ID=

+ # ===================
+ # Google OAuth
+ # ===================
+ GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
+ GOOGLE_CLIENT_SECRET=your-google-client-secret
+ ADMIN_EMAIL=your-admin-email@gmail.com
```

---

## Task 6: フロントエンドのログインボタンを確認

プロジェクト内で Manus の OAuth ログイン URL やログインボタンを検索する。

検索キーワード：
- `oauth`
- `login`
- `sign-in`
- `signin`
- `OAUTH_SERVER_URL`
- `manus`

ログインボタンやリンクが見つかった場合、リンク先を `/api/oauth/login` に変更する。

例：
```diff
- <a href="https://manus-oauth-server.example.com/authorize?...">ログイン</a>
+ <a href="/api/oauth/login">Google でログイン</a>
```

ログアウトボタンがあれば、`POST /api/oauth/logout` を呼ぶように変更する。

---

## Task 7: ビルド確認

すべての修正が完了したら、以下を実行してビルドが通ることを確認する：

```bash
pnpm install
pnpm build
```

エラーが出た場合は修正する。特に以下に注意：
- `manusTypes` を import している箇所が他にないか
- `sdk.exchangeCodeForToken` の引数が変わっている（第2引数が `state` → `redirectUri`）
- `sdk.getUserInfo` の戻り値の型が `GetUserInfoResponse` → `GoogleUserInfo` に変わっている

---

## 補足: Google Cloud Console での設定手順（手動作業）

この項目は Claude Code の作業対象外。オーナーが手動で行う。

### 手順

1. [Google Cloud Console](https://console.cloud.google.com/) にアクセス
2. 新しいプロジェクトを作成（例: `portfolio-shop`）
3. 左メニュー → 「API とサービス」→「OAuth 同意画面」を設定
   - ユーザーの種類: 「外部」を選択
   - アプリ名: サイト名を入力
   - サポートメール: 自分のメールアドレス
   - スコープ: `email`, `profile`, `openid` を追加
   - テストユーザー: 自分のメールアドレスを追加
4. 左メニュー → 「認証情報」→「認証情報を作成」→「OAuth クライアント ID」
   - アプリケーションの種類: 「ウェブ アプリケーション」
   - 名前: 任意（例: `portfolio-shop-web`）
   - 承認済みのリダイレクト URI:
     - 開発用: `http://localhost:3000/api/oauth/callback`
     - 本番用: `https://your-railway-domain.up.railway.app/api/oauth/callback`
       （Railway デプロイ後にドメインが決まったら追加する）
5. 作成後に表示される「クライアント ID」と「クライアント シークレット」を
   `.env` の `GOOGLE_CLIENT_ID` と `GOOGLE_CLIENT_SECRET` に設定する

### 注意

- OAuth 同意画面が「テスト」ステータスの間は、テストユーザーに追加した
  メールアドレスでしかログインできない。管理者1人だけの運用ならこれで十分。
  「公開」にする必要はない。
- `ADMIN_EMAIL` には管理用の Google アカウントのメールアドレスを設定する。
  このアドレス以外でログインしようとすると 403 エラーになる。
- `OWNER_OPEN_ID` は Google の `sub`（ユーザーID）に対応する。
  初回ログイン後に DB を確認して設定するか、初回は空のままでもログイン自体は可能。
