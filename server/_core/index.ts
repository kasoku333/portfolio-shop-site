import "dotenv/config";
import express from "express";
import { createServer } from "http";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import { UPLOADS_DIR } from "../storage";
import { runMigrations } from "../db";

async function startServer() {
  // 本番はテーブルが無いまま起動しないよう、先にマイグレーションを流す。
  // 開発ではローカル DB を勝手に変えないよう、pnpm db:push に任せる。
  if (process.env.NODE_ENV === "production") {
    await runMigrations();
  }

  const app = express();
  const server = createServer(app);
  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "150mb" }));
  app.use(express.urlencoded({ limit: "150mb", extended: true }));
  // Serve uploaded files
  app.use("/uploads", express.static(UPLOADS_DIR));
  // OAuth callback under /api/oauth/callback
  registerOAuthRoutes(app);
  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // Vite の devProxy (/api, /uploads) がこのポートに固定依存しているため、
  // 使用中の場合は自動退避せず明示的に失敗させる（退避するとクライアントからAPIに届かない）。
  const port = parseInt(process.env.PORT || "3000");

  server.on("error", (err: NodeJS.ErrnoException) => {
    if (err.code === "EADDRINUSE") {
      console.error(
        `\n[startup] Port ${port} is already in use.\n` +
        `Close the process holding it (e.g. previous pnpm dev) and retry.\n` +
        `  Windows: netstat -ano | findstr ":${port} "  → taskkill /PID <pid> /F\n`
      );
      process.exit(1);
    }
    throw err;
  });

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });

  // Railway は新しい版を公開すると、古い版に SIGTERM を送って止める。
  // 受け取らずに落ちると終了コード 143 になり、pnpm が「Command failed」を出して
  // Railway から「クラッシュしました」のメールが毎回届くので、自分で閉じて 0 で終える。
  process.once("SIGTERM", () => {
    console.log("[shutdown] SIGTERM received, closing server");
    server.close(() => process.exit(0));
    // 応答中の接続が残って閉じきれないときも、Railway に強制終了される前に終える
    setTimeout(() => process.exit(0), 10_000).unref();
  });
}

startServer().catch(error => {
  console.error(error);
  process.exit(1);
});
