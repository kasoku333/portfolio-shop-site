import { ReactNode } from "react";
import { Link, NavLink } from "react-router-dom";
import { ShoppingBag, Home, Image, Store, User, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { trpc } from "@/lib/trpc";

type ShellProps = {
  children: ReactNode;
};

const mainNavItems = [
  { to: "/", label: "トップ", end: true },
  { to: "/gallery", label: "ギャラリー", end: false },
  { to: "/shop", label: "ショップ", end: false },
  { to: "/about", label: "About", end: false },
  { to: "/history", label: "History", end: false },
];

const mobileNavItems = [
  { to: "/", label: "トップ", icon: Home, end: true },
  { to: "/gallery", label: "ギャラリー", icon: Image, end: false },
  { to: "/shop", label: "ショップ", icon: Store, end: false },
  { to: "/about", label: "About", icon: User, end: false },
  { to: "/history", label: "History", icon: Clock, end: false },
];

export default function Shell({ children }: ShellProps) {
  const { totalItems } = useCart();
  const { data: settings } = trpc.siteSettings.get.useQuery(undefined, {
    staleTime: 1000 * 60 * 5,
    retry: false,
  });

  const siteName = settings?.siteName || "木陰の部屋";
  const email = settings?.email || "hello@example.com";

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* ===== デスクトップヘッダー (lg以上) ===== */}
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur hidden lg:block">
        <div className="container flex items-center justify-between py-4">
          <Link to="/" className="shrink-0">
            <span className="text-xl font-serif font-semibold tracking-tight">
              {siteName}
            </span>
          </Link>

          <nav className="flex items-center gap-6 text-sm" aria-label="メインナビゲーション">
            {mainNavItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  [
                    "transition-colors py-1 border-b-2",
                    isActive
                      ? "text-accent font-semibold border-accent"
                      : "text-foreground hover:text-accent border-transparent",
                  ].join(" ")
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

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

      {/* ===== モバイルヘッダー (lg未満) ===== */}
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur lg:hidden">
        <div className="container flex items-center justify-between py-3">
          <Link to="/">
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

      {/* メインコンテンツ */}
      <main className="pb-[env(safe-area-inset-bottom)] lg:pb-0">
        {children}
        <div className="h-16 lg:hidden" aria-hidden="true" />
      </main>

      {/* ===== モバイル下部タブバー ===== */}
      <nav
        className="fixed bottom-0 inset-x-0 z-50 border-t border-border/60 bg-background/90 backdrop-blur lg:hidden"
        aria-label="メインナビゲーション"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="flex">
          {mobileNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  [
                    "flex-1 flex flex-col items-center justify-center gap-1 py-3 text-xs font-medium transition-colors",
                    isActive ? "text-accent" : "text-muted-foreground hover:text-foreground",
                  ].join(" ")
                }
              >
                <Icon className="h-5 w-5" strokeWidth={1.5} aria-hidden="true" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </div>
      </nav>

      <footer className="border-t border-border/70 bg-muted/40">
        <div className="container py-10 grid gap-6 md:grid-cols-3">
          <div className="space-y-2">
            <p className="text-lg font-serif font-semibold">{siteName}</p>
            <p className="text-sm text-muted-foreground">漫画・イラスト・小説の作品棚。</p>
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
