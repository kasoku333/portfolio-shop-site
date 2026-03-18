import { useAuth } from "@/_core/hooks/useAuth";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { LogOut, Home, Package } from "lucide-react";
import ProductManager from "@/components/ProductManager";
import ArtworkManager from "@/components/ArtworkManager";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

const statusLabels: Record<string, { label: string; className: string }> = {
  pending:   { label: "処理中",    className: "bg-yellow-100 text-yellow-800" },
  completed: { label: "完了",      className: "bg-green-100 text-green-800" },
  failed:    { label: "失敗",      className: "bg-red-100 text-red-800" },
  cancelled: { label: "キャンセル", className: "bg-gray-100 text-gray-600" },
};

function OrdersTab() {
  const utils = trpc.useUtils();
  const { data: orders, isLoading } = trpc.orders.adminList.useQuery();
  const updateStatus = trpc.orders.updateStatus.useMutation({
    onSuccess: () => {
      utils.orders.adminList.invalidate();
      toast.success("注文ステータスを更新しました");
    },
    onError: () => toast.error("更新に失敗しました"),
  });

  if (isLoading) {
    return (
      <div className="py-12 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent mx-auto" />
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-card p-8 text-center">
        <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-muted-foreground">まだ注文はありません</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => {
        const statusInfo = statusLabels[order.status] ?? { label: order.status, className: "bg-muted text-muted-foreground" };
        return (
          <div key={order.id} className="rounded-xl border border-border bg-card p-5 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-muted-foreground" />
                <span className="font-semibold">注文 #{order.id}</span>
                <span className="text-sm text-muted-foreground">— {order.customerName}</span>
              </div>
              <span className={`text-xs font-medium px-3 py-1 rounded-full ${statusInfo.className}`}>
                {statusInfo.label}
              </span>
            </div>
            <div className="flex items-center justify-between flex-wrap gap-3 text-sm text-muted-foreground">
              <div className="space-y-0.5">
                <p>{order.customerEmail}</p>
                <p>{new Date(order.createdAt).toLocaleString("ja-JP")}</p>
              </div>
              <span className="text-base font-bold text-accent">
                ¥{parseFloat(order.totalAmount).toLocaleString()}
              </span>
            </div>
            <div className="flex gap-2 flex-wrap pt-1 border-t border-border">
              {(["pending", "completed", "cancelled"] as const).map((s) => (
                <Button
                  key={s}
                  size="sm"
                  variant={order.status === s ? "default" : "outline"}
                  disabled={order.status === s || updateStatus.isPending}
                  onClick={() => updateStatus.mutate({ id: order.id, status: s })}
                  className="text-xs rounded-full"
                >
                  {statusLabels[s].label}に変更
                </Button>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function AdminDashboard() {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState<any[]>([]);

  // アクセス制御：管理者ロールのみ許可
  useEffect(() => {
    if (!loading && (!user || user.role !== "admin")) {
      navigate("/");
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-4"></div>
          <p className="text-muted-foreground">読み込み中...</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-serif font-bold text-foreground mb-4">
            アクセス権限がありません
          </h1>
          <p className="text-muted-foreground mb-6">
            このページは管理者のみがアクセスできます
          </p>
          <Link to="/">
            <Button>ホームに戻る</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-50 border-b border-border bg-card" style={{boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)'}}>
        <div className="container flex items-center justify-between py-4">
          <div>
            <h1 className="text-2xl font-serif font-bold text-accent">管理ダッシュボード</h1>
            <p className="text-sm text-muted-foreground">
              ようこそ、{user.name}さん
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <Home className="w-4 h-4" />
                サイトに戻る
              </Button>
            </Link>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                logout();
                navigate("/");
              }}
              className="flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              ログアウト
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container py-8">
        <Tabs defaultValue="products" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="products">商品管理</TabsTrigger>
            <TabsTrigger value="artworks">作品管理</TabsTrigger>
            <TabsTrigger value="orders">注文管理</TabsTrigger>
            <TabsTrigger value="settings">設定</TabsTrigger>
          </TabsList>

          {/* Products Tab */}
          <TabsContent value="products" className="space-y-6">
            <h2 className="text-2xl font-serif font-bold text-foreground">
              商品管理
            </h2>
            <ProductManager
              products={products}
              onAdd={(product) => {
                const newProduct = { id: Date.now(), ...product };
                setProducts([...products, newProduct]);
              }}
              onEdit={(id, updates) => {
                setProducts(
                  products.map((p) => (p.id === id ? { ...p, ...updates } : p))
                );
              }}
              onDelete={(id) => {
                setProducts(products.filter((p) => p.id !== id));
              }}
            />
          </TabsContent>

          {/* Artworks Tab */}
          <TabsContent value="artworks" className="space-y-6">
            <h2 className="text-2xl font-serif font-bold text-foreground">
              作品管理
            </h2>
            <ArtworkManager />
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders" className="space-y-6">
            <h2 className="text-2xl font-serif font-bold text-foreground">
              注文管理
            </h2>
            <OrdersTab />
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <h2 className="text-2xl font-serif font-bold text-foreground">
              設定
            </h2>
            <div className="rounded-lg border border-border bg-card p-8 text-center">
              <p className="text-muted-foreground mb-4">
                設定機能は実装中です
              </p>
              <p className="text-sm text-muted-foreground">
                ここでプロフィール、通知設定などを管理できます
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
