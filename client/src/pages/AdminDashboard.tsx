import { Link, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { LogOut, Home } from "lucide-react";
import ProductManager from "@/components/ProductManager";
import ArtworkManager from "@/components/ArtworkManager";
import OrderManager from "@/components/OrderManager";
import SiteSettingsManager from "@/components/SiteSettingsManager";
import ProfileManager from "@/components/ProfileManager";
import HistoryManager from "@/components/HistoryManager";
import { trpc } from "@/lib/trpc";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { data: authUser, isLoading: loading } = trpc.auth.me.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
  });
  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => navigate("/login"),
  });
  const user = authUser ? { name: authUser.name || "管理者", role: "admin" as const } : null;
  const logout = () => logoutMutation.mutate();

  // tRPC: 商品データ取得
  const { data: products = [], refetch: refetchProducts } = trpc.products.list.useQuery();
  const createProduct = trpc.products.create.useMutation({ onSuccess: () => refetchProducts() });
  const updateProduct = trpc.products.update.useMutation({ onSuccess: () => refetchProducts() });
  const deleteProduct = trpc.products.delete.useMutation({ onSuccess: () => refetchProducts() });

  // tRPC: 作品データ取得
  const { data: artworks = [], refetch: refetchArtworks } = trpc.artworks.list.useQuery();
  const createArtwork = trpc.artworks.create.useMutation({ onSuccess: () => refetchArtworks() });
  const updateArtwork = trpc.artworks.update.useMutation({ onSuccess: () => refetchArtworks() });
  const deleteArtwork = trpc.artworks.delete.useMutation({ onSuccess: () => refetchArtworks() });

  // tRPC: 注文データ取得
  const { data: orders = [], refetch: refetchOrders } = trpc.orders.listAll.useQuery(undefined, {
    retry: 1,
    retryDelay: 1000,
  });
  const updateOrderStatus = trpc.orders.updateStatus.useMutation({
    onSuccess: () => refetchOrders(),
  });

  // アクセス制御：未認証時はログインページへリダイレクト
  useEffect(() => {
    if (!loading && !user) {
      navigate("/login");
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

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="text-center">
          <h1 className="text-2xl font-serif font-bold text-foreground mb-4">
            アクセス権限がありません
          </h1>
          <p className="text-muted-foreground mb-6">
            このページは管理者のみがアクセスできます。
          </p>
          <Link to="/login">
            <Button>ログインページへ</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div
        className="sticky top-0 z-50 border-b border-border bg-card"
        style={{ boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)" }}
      >
        <div className="container flex flex-wrap items-center justify-between gap-3 py-3 md:py-4">
          <div className="min-w-0">
            <h1 className="text-lg md:text-2xl font-serif font-bold text-accent truncate">
              管理ダッシュボード
            </h1>
            <p className="text-xs md:text-sm text-muted-foreground">
              ようこそ、{user.name}さん
            </p>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            <Link to="/">
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <Home className="w-4 h-4" />
                <span className="hidden sm:inline">サイトに戻る</span>
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
              <span className="hidden sm:inline">ログアウト</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container py-6 md:py-8">
        <Tabs defaultValue="products" className="w-full">
          {/* スマホでは横スクロールで全タブを表示。PCでは6等分グリッド。 */}
          <div className="-mx-4 px-4 overflow-x-auto md:mx-0 md:px-0 md:overflow-visible">
            <TabsList className="inline-flex md:grid md:w-full md:grid-cols-6 whitespace-nowrap">
              <TabsTrigger value="products">商品管理</TabsTrigger>
              <TabsTrigger value="artworks">作品管理</TabsTrigger>
              <TabsTrigger value="orders">注文管理</TabsTrigger>
              <TabsTrigger value="profile">プロフィール</TabsTrigger>
              <TabsTrigger value="history">ヒストリー</TabsTrigger>
              <TabsTrigger value="settings">サイト設定</TabsTrigger>
            </TabsList>
          </div>

          {/* Products Tab */}
          <TabsContent value="products" className="space-y-6">
            <h2 className="text-xl md:text-2xl font-serif font-bold text-foreground">商品管理</h2>
            <ProductManager
              products={products.map((p) => ({
                ...p,
                price: typeof p.price === "string" ? parseFloat(p.price) : p.price,
              }))}
              onAdd={(product) => {
                createProduct.mutate({
                  title: product.title,
                  description: product.description ?? undefined,
                  price: product.price.toString(),
                  productType: product.productType,
                  stock: product.stock ?? undefined,
                  imageUrl: product.imageUrl ?? undefined,
                });
              }}
              onEdit={(id, updates) => {
                updateProduct.mutate({
                  id,
                  title: updates.title,
                  description: updates.description ?? undefined,
                  price: updates.price?.toString(),
                  productType: updates.productType,
                  stock: updates.stock ?? undefined,
                  imageUrl: updates.imageUrl ?? undefined,
                });
              }}
              onDelete={(id) => {
                deleteProduct.mutate({ id });
              }}
            />
          </TabsContent>

          {/* Artworks Tab */}
          <TabsContent value="artworks" className="space-y-6">
            <h2 className="text-xl md:text-2xl font-serif font-bold text-foreground">作品管理</h2>
            <ArtworkManager
              artworks={artworks}
              onAdd={(artwork) => {
                createArtwork.mutate({
                  title: artwork.title,
                  description: artwork.description ?? undefined,
                  category: artwork.category,
                  imageUrl: artwork.imageUrl ?? undefined,
                });
              }}
              onEdit={(id, updates) => {
                updateArtwork.mutate({
                  id,
                  title: updates.title,
                  description: updates.description ?? undefined,
                  category: updates.category,
                  imageUrl: updates.imageUrl ?? undefined,
                });
              }}
              onDelete={(id) => {
                deleteArtwork.mutate({ id });
              }}
            />
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders" className="space-y-6">
            <h2 className="text-xl md:text-2xl font-serif font-bold text-foreground">注文管理</h2>
            <OrderManager
              orders={orders}
              onStatusChange={(id, status) => {
                updateOrderStatus.mutate({ id, status });
              }}
            />
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <h2 className="text-xl md:text-2xl font-serif font-bold text-foreground">
              プロフィール管理
            </h2>
            <ProfileManager />
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="space-y-6">
            <h2 className="text-xl md:text-2xl font-serif font-bold text-foreground">
              ヒストリー管理
            </h2>
            <HistoryManager />
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <h2 className="text-xl md:text-2xl font-serif font-bold text-foreground">
              サイト設定
            </h2>
            <SiteSettingsManager />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
