import { ReactNode } from "react";
import { Link, NavLink } from "react-router-dom";
import { ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { trpc } from "@/lib/trpc";

type ShellProps = {
  children: ReactNode;
};

// メインナビ（PCヘッダー / モバイル下部タブバー共通）
// 上部メニューは「トップ / ギャラリー / ショップ / About / History」を基本とし、
// カートはアイコン付きの専用ボタンとして別配置。
const mainNavItems = [
  { to: "/", label: "トップ" },
  { to: "/gallery", label: "ギャラリー" },
  { to: "/shop", label: "ショップ" },
  { to: "/about", label: "About" },
  { to: "/history", label: "History" },
] as const;

export default function Shell({ children }: ShellProps) {
  const { totalItems } = useCart();
  // API 停止時にヘッダー描画が長時間ブロックされないよう retry を抑える。
  const { data: settings } = trpc.siteSettings.get.useQuery(undefined, {
    staleTime: 1000 * 60 * 5,
    retry: false,
  });

  const siteName = settings?.siteName || "木陰の部屋";
  const siteSubtitle = settings?.siteSubtitle || "PORTFOLIO & SHOP";
  const email = settings?.email || "";

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/*
        ===== デスクトップヘッダー (1024px以上で表示) =====
        トップ / ギャラリー / ショップ / About / History を中央寄せ、
        右端にカートボタン。
        従来あったカテゴリ（漫画/イラスト/小説）ショートカットは
        ギャラリーページ内のフィルターと役割が重複するため削除。
      */}
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur hidden lg:block">
        <div className="container flex items-center justify-between gap-6 py-4">
          {/* ロゴ */}
          <Link to="/" className="flex items-baseline gap-3 shrink-0">
            <span className="text-xl font-serif font-semibold tracking-tight">
              {siteName}
            </span>
            <span className="hidden sm:inline text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
              {siteSubtitle}
            </span>
          </Link>

          {/* メインナビ */}
          <nav className="flex items-center gap-7 text-sm" aria-label="メインナビゲーション">
            {mainNavItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                className={({ isActive }) =>
                  [
                    "relative py-1 transition-colors",
                    isActive
                      ? "text-accent font-semibold after:absolute after:left-0 after:right-0 after:-bottom-[2px] after:h-[2px] after:bg-accent after:rounded-full"
                      : "text-foreground/80 hover:text-accent",
                  ].join(" ")
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* カートボタン */}
          <Link to="/cart" className="shrink-0">
            <Button size="sm" className="gap-2 rounded-full px-4 shadow-sm relative">
              <ShoppingBag className="h-4 w-4" />
              カート
              {totalItems > 0 && (
                <span
                  data-testid="cart-badge"
                  className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-xs rounded-full h-5 min-w-5 px-1 flex items-center justify-center font-bold"
                >
                  {totalItems}
                </span>
              )}
            </Button>
          </Link>
        </div>
      </header>

      {/*
        ===== モバイルヘッダー (1023px以下で表示) =====
        ロゴ + カートボタン。メインナビは下部タブバーへ移動。
      */}
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/90 backdrop-blur lg:hidden">
        <div className="container flex items-center justify-between py-3">
          <Link to="/" className="flex items-baseline gap-2 min-w-0">
            <span className="text-base font-serif font-semibold tracking-tight truncate">
              {siteName}
            </span>
            <span className="text-[9px] uppercase tracking-[0.25em] text-muted-foreground hidden xs:inline">
              {siteSubtitle}
            </span>
          </Link>
          <Link to="/cart" className="shrink-0">
            <Button size="sm" className="gap-2 rounded-full px-3 shadow-sm relative">
              <ShoppingBag className="h-4 w-4" />
              <span className="hidden sm:inline">カート</span>
              {totalItems > 0 && (
                <span
                  data-testid="cart-badge"
                  className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-xs rounded-full h-5 min-w-5 px-1 flex items-center justify-center font-bold"
                >
                  {totalItems}
                </span>
              )}
            </Button>
          </Link>
        </div>
      </header>

      {/* メインコンテンツ。モバイルは下部タブバー分の余白を確保。 */}
      <main className="pb-[env(safe-area-inset-bottom)] lg:pb-0">
        {children}
        <div className="h-16 lg:hidden" aria-hidden="true" />
      </main>

      {/*
        ===== モバイル下部タブバー (1023px以下で表示) =====
        メインナビをそのまま表示（カテゴリショートカットは廃止）。
        flex-1 で項目数に応じて自動均等配置。
      */}
      <nav
        className="fixed bottom-0 inset-x-0 z-50 border-t border-border/60 bg-background/95 backdrop-blur lg:hidden"
        aria-label="メインナビゲーション"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="flex">
          {mainNavItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) =>
                [
                  "flex-1 flex items-center justify-center py-3 text-xs font-medium transition-colors",
                  isActive
                    ? "text-accent font-semibold"
                    : "text-muted-foreground hover:text-foreground",
                ].join(" ")
              }
            >
              {item.label}
            </NavLink>
          ))}
        </div>
      </nav>

      <footer className="border-t border-border/70 bg-muted/40">
        <div className="container py-10 grid gap-6 md:grid-cols-3">
          <div className="space-y-2">
            <p className="text-lg font-serif font-semibold">{siteName}</p>
            <p className="text-sm text-muted-foreground">
              漫画・イラスト・小説の小さな作品棚。
            </p>
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
            {email && <span>{email}</span>}
          </div>
        </div>
      </footer>
    </div>
  );
}
