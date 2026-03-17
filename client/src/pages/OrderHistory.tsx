import { Link } from "react-router-dom";
import Shell from "@/components/Shell";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Package, ShoppingBag } from "lucide-react";

const statusLabels: Record<string, { label: string; className: string }> = {
  pending:   { label: "処理中",    className: "bg-yellow-100 text-yellow-800" },
  completed: { label: "完了",      className: "bg-green-100 text-green-800" },
  failed:    { label: "失敗",      className: "bg-red-100 text-red-800" },
  cancelled: { label: "キャンセル", className: "bg-gray-100 text-gray-600" },
};

export default function OrderHistory() {
  const { user, loading: authLoading } = useAuth();

  const { data: orders, isLoading } = trpc.orders.list.useQuery(undefined, {
    enabled: !!user,
  });

  if (authLoading) {
    return (
      <Shell>
        <div className="container py-24 text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-accent mx-auto" />
        </div>
      </Shell>
    );
  }

  if (!user) {
    return (
      <Shell>
        <section className="py-24">
          <div className="container max-w-md text-center space-y-6">
            <Package className="mx-auto h-16 w-16 text-muted-foreground" />
            <h1 className="text-2xl font-serif font-bold">ログインが必要です</h1>
            <p className="text-muted-foreground">注文履歴を見るにはログインしてください。</p>
            <Link to="/shop">
              <Button variant="outline">ショップに戻る</Button>
            </Link>
          </div>
        </section>
      </Shell>
    );
  }

  return (
    <Shell>
      <section className="py-12 md:py-20">
        <div className="container max-w-3xl">
          <h1 className="text-3xl md:text-4xl font-serif font-bold mb-10">注文履歴</h1>

          {isLoading ? (
            <div className="py-24 text-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-accent mx-auto" />
            </div>
          ) : !orders || orders.length === 0 ? (
            <div className="py-24 text-center space-y-6">
              <ShoppingBag className="mx-auto h-16 w-16 text-muted-foreground" />
              <p className="text-lg text-muted-foreground">注文履歴はありません</p>
              <Link to="/shop">
                <Button>ショップを見る</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => {
                const statusInfo = statusLabels[order.status] ?? { label: order.status, className: "bg-muted text-muted-foreground" };
                return (
                  <div
                    key={order.id}
                    className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-3"
                  >
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-3">
                        <Package className="h-5 w-5 text-muted-foreground" />
                        <span className="font-serif font-semibold">注文 #{order.id}</span>
                      </div>
                      <span className={`text-xs font-medium px-3 py-1 rounded-full ${statusInfo.className}`}>
                        {statusInfo.label}
                      </span>
                    </div>
                    <div className="flex justify-between items-end flex-wrap gap-2 text-sm">
                      <div className="space-y-1 text-muted-foreground">
                        <p>注文日: {new Date(order.createdAt).toLocaleDateString("ja-JP")}</p>
                        {order.stripePaymentIntentId && (
                          <p className="font-mono text-xs">決済ID: {order.stripePaymentIntentId.slice(0, 20)}...</p>
                        )}
                      </div>
                      <span className="text-lg font-bold text-accent">
                        ¥{parseFloat(order.totalAmount).toLocaleString()}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </Shell>
  );
}
