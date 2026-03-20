import { ReactNode } from "react";
import { Link, NavLink } from "react-router-dom";
import { ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { trpc } from "@/lib/trpc";

type ShellProps = {
  children: ReactNode;
};

const navItems = [
  { to: "/", label: "トップ" },
  { to: "/gallery", label: "ギャラリー" },
  { to: "/shop", label: "ショップ" },
  { to: "/about", label: "About" },
  { to: "/history", label: "History" },
];

export default function Shell({ children }: ShellProps) {
  const { totalItems } = useCart();
  const { data: settings } = trpc.siteSettings.get.useQuery(undefined, {
    staleTime: 1000 * 60 * 5, // 5分キャッシュ
  });

  const siteName = settings?.siteName || "Atelier Shelf";
  const siteSubtitle = settings?.siteSubtitle || "Portfolio Shop";
  const email = settings?.email || "hello@atelier-shelf.example";

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur">
        <div className="container flex items-center justify-between py-4">
          <Link to="/" className="flex items-center gap-3">
            <span className="text-xl font-serif font-semibold tracking-tight">
              {siteName}
            </span>
            <span className="hidden sm:inline text-xs uppercase tracking-[0.3em] text-muted-foreground">
              {siteSubtitle}
            </span>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
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
          <Link to="/cart">
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

      <main>{children}</main>

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
