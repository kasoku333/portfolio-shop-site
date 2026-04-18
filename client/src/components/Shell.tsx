import { ReactNode } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { ShoppingBag, BookOpen, Image, ScrollText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { trpc } from "@/lib/trpc";

type ShellProps = {
  children: ReactNode;
};

// サブナビ（全ページ・サイト上部/下部に表示するカテゴリ切り替え）
// 将来カテゴリが増えたらここに追記するだけでよい。
// flex/grid の等幅配置により自動で均等分割される。
const categoryNavItems = [
  {
    to: "/gallery?category=manga",
    label: "漫画",
    icon: BookOpen,
    // aria-current 判定用。pathが /gallery かつ category パラメータが一致すれば active。
    matchCategory: "manga",
  },
  {
    to: "/gallery?category=illustration",
    label: "イラスト",
    icon: Image,
    matchCategory: "illustration",
  },
  {
    to: "/gallery?category=novel",
    label: "小説",
    icon: ScrollText,
    matchCategory: "novel",
  },
] as const;

// メインナビ（デスクトップヘッダー右側に表示）
const mainNavItems = [
  { to: "/", label: "トップ" },
  { to: "/gallery", label: "ギャラリー" },
  { to: "/shop", label: "ショップ" },
  { to: "/about", label: "About" },
  { to: "/history", label: "History" },
];

/** 現在URLのカテゴリクエリを返す。useLocation() を使うことでSPA遷移時にも確実に再計算される。 */
function useCurrentCategory() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  return params.get("category");
}

export default function Shell({ children }: ShellProps) {
  const { totalItems } = useCart();
  // API 停止時にヘッダー描画が長時間ブロックされないよう retry を抑える。
  // 失敗時は下の `|| "..."` フォールバックでデフォルト文言を表示する。
  const { data: settings } = trpc.siteSettings.get.useQuery(undefined, {
    staleTime: 1000 * 60 * 5,
    retry: false,
  });

  const siteName = settings?.siteName || "Atelier Shelf";
  const siteSubtitle = settings?.siteSubtitle || "Portfolio Shop";
  const email = settings?.email || "hello@atelier-shelf.example";

  const currentCategory = useCurrentCategory();

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/*
        ===== デスクトップヘッダー (1024px以上で表示) =====
        hidden lg:flex で制御。
        カテゴリナビを右側に追加、カートボタンは右端に固定。
      */}
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur hidden lg:block">
        <div className="container flex items-center justify-between py-4">
          {/* ロゴ */}
          <Link to="/" className="flex items-center gap-3 shrink-0">
            <span className="text-xl font-serif font-semibold tracking-tight">
              {siteName}
            </span>
            <span className="hidden sm:inline text-xs uppercase tracking-[0.3em] text-muted-foreground">
              {siteSubtitle}
            </span>
          </Link>

          {/* メインナビ */}
          <nav className="flex items-center gap-6 text-sm" aria-label="メインナビゲーション">
            {mainNavItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                className={({ isActive }) =>
                  [
                    "transition-colors",
                    isActive ? "text-accent font-semibold" : "text-foreground hover:text-accent",
                  ].join(" ")
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* カテゴリクイックナビ（デスクトップ右側） */}
          <nav className="flex items-center gap-1 text-sm ml-4" aria-label="カテゴリナビゲーション">
            {categoryNavItems.map((item) => {
              const isActive = currentCategory === item.matchCategory;
              const Icon = item.icon;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  aria-current={isActive ? "page" : undefined}
                  className={[
                    "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                    isActive
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  ].join(" ")}
                >
                  <Icon className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden="true" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* カートボタン */}
          <Link to="/cart" className="ml-4 shrink-0">
            <Button size="sm" className="gap-2 rounded-full px-4 shadow-sm relative">
              <ShoppingBag className="h-4 w-4" />
              カート
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                  {totalItems}
                </span>
              )}
            </Button>
          </Link>
        </div>
      </header>

      {/*
        ===== モバイルヘッダー (1023px以下で表示) =====
        ロゴ + カートボタンのみ。カテゴリは下部タブバーに移動。
      */}
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur lg:hidden">
        <div className="container flex items-center justify-between py-3">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-lg font-serif font-semibold tracking-tight">
              {siteName}
            </span>
          </Link>
          <Link to="/cart">
            <Button size="sm" className="gap-2 rounded-full px-3 shadow-sm relative">
              <ShoppingBag className="h-4 w-4" />
              カート
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                  {totalItems}
                </span>
              )}
            </Button>
          </Link>
        </div>
      </header>

      {/* メインコンテンツ。モバイルではタブバー分の余白を下部に確保。 */}
      <main className="pb-[env(safe-area-inset-bottom)] lg:pb-0">
        {/* モバイルタブバー分の余白（タブバーの高さ約64px相当） */}
        <div className="lg:hidden h-0" style={{ paddingBottom: 0 }} />
        {children}
        {/* モバイルのタブバー高さ（64px）+ safe-area 分のスペーサー */}
        <div className="h-16 lg:hidden" aria-hidden="true" />
      </main>

      {/*
        ===== モバイル下部タブバー (1023px以下で表示) =====
        fixed bottom-0 で画面最下部に固定。
        flex の等幅（flex-1）で項目数が増えても自動で均等分割。
        将来カテゴリが増えたら categoryNavItems に追記するだけ。
      */}
      <nav
        className="fixed bottom-0 inset-x-0 z-50 border-t border-border/60 bg-background/90 backdrop-blur lg:hidden"
        aria-label="カテゴリナビゲーション"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="flex">
          {categoryNavItems.map((item) => {
            const isActive = currentCategory === item.matchCategory;
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                aria-current={isActive ? "page" : undefined}
                className={[
                  "flex-1 flex flex-col items-center justify-center gap-1 py-3 text-xs font-medium transition-colors",
                  isActive
                    ? "text-accent"
                    : "text-muted-foreground hover:text-foreground",
                ].join(" ")}
              >
                <Icon
                  className={[
                    "h-5 w-5 transition-transform duration-200",
                    isActive ? "scale-110" : "",
                  ].join(" ")}
                  strokeWidth={isActive ? 2 : 1.5}
                  aria-hidden="true"
                />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      <footer className="border-t border-border/70 bg-muted/40">
        <div className="container py-10 grid gap-6 md:grid-cols-3">
          <div className="space-y-2">
            <p className="text-lg font-serif font-semibold">{siteName}</p>
            <p className="text-sm text-muted-foreground">New releases every month.</p>
          </div>
          <div className="flex flex-col gap-2 text-sm">
            <p className="font-semibold text-foreground mb-1">リンク</p>
            <Link to="/privacy" className="text-muted-foreground hover:text-accent transition-colors">
              プライバシーポリシー
            </Link>
            <Link to="/tokushoho" className="text-muted-foreground hover:text-accent transition-colors">
              特定商取引法に基づく表記
            </Link>
          </div>
          <div className="flex flex-col gap-2 text-sm text-muted-foreground md:items-end">
            <span>© 2026 {siteName}</span>
            <span>{email}</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
