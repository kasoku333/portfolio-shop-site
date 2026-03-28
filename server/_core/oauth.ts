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
