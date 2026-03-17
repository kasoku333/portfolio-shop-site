import { ReactNode } from "react";
import { Link, NavLink } from "react-router-dom";
import { ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";

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

function CartButton() {
  const { user } = useAuth();
  const { data: count } = trpc.cart.getItemCount.useQuery(undefined, {
    enabled: !!user,
    refetchOnWindowFocus: false,
  });

  return (
    <Link to="/cart">
      <Button size="sm" className="gap-2 rounded-full px-4 shadow-sm relative">
        <ShoppingBag className="h-4 w-4" />
        カート
        {count != null && count > 0 && (
          <span className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center leading-none">
            {count > 99 ? "99+" : count}
          </span>
        )}
      </Button>
    </Link>
  );
}

export default function Shell({ children }: ShellProps) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur">
        <div className="container flex items-center justify-between py-4">
          <Link to="/" className="flex items-center gap-3">
            <span className="text-xl font-serif font-semibold tracking-tight">
              Atelier Shelf
            </span>
            <span className="hidden sm:inline text-xs uppercase tracking-[0.3em] text-muted-foreground">
              Portfolio Shop
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
          <CartButton />
        </div>
      </header>

      <main>{children}</main>

      <footer className="border-t border-border/70 bg-muted/40">
        <div className="container py-10 grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">New releases every month.</p>
            <p className="text-lg font-serif font-semibold">Join the studio notes.</p>
          </div>
          <div className="flex flex-col gap-2 text-sm text-muted-foreground md:items-end">
            <span>© 2026 Atelier Shelf</span>
            <span>hello@atelier-shelf.example</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
