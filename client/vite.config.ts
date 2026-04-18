import { jsxLocPlugin } from "@builder.io/vite-plugin-jsx-loc";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";
import { defineConfig } from "vite";


const currentDir = typeof import.meta.dirname === "string"
  ? import.meta.dirname
  : path.dirname(fileURLToPath(import.meta.url));

const plugins = [react(), tailwindcss(), jsxLocPlugin()];

export default defineConfig({
  base: "/",
  plugins,
  resolve: {
    alias: {
      "@": path.resolve(currentDir, "src"),
      "@shared": path.resolve(currentDir, "..", "shared"),
      "@assets": path.resolve(currentDir, "..", "attached_assets"),
    },
  },
  envDir: path.resolve(currentDir, ".."),
  root: path.resolve(currentDir),
  publicDir: path.resolve(currentDir, "public"),
  build: {
    outDir: path.resolve(currentDir, "..", "dist", "public"),
    emptyOutDir: true,
  },
  server: {
    host: true,
    // start-*.cmd は 5173 を待ち受ける前提なので、ポート退避されると
    // ブラウザからつながらなくなる。退避せず明示的に失敗させる。
    strictPort: true,
    allowedHosts: [
      "localhost",
      "127.0.0.1",
    ],
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
      "/uploads": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
    },
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
});
