import { useAuth } from "@/_core/hooks/useAuth";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { LogOut, Home } from "lucide-react";
import ProductManager from "@/components/ProductManager";
import ArtworkManager from "@/components/ArtworkManager";

export default function AdminDashboard() {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState<any[]>([]);
  const [artworks, setArtworks] = useState<any[]>([]);

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
            <ArtworkManager
              artworks={artworks}
              onAdd={(artwork) => {
                const newArtwork = { id: Date.now(), ...artwork };
                setArtworks([...artworks, newArtwork]);
              }}
              onEdit={(id, updates) => {
                setArtworks(
                  artworks.map((a) => (a.id === id ? { ...a, ...updates } : a))
                );
              }}
              onDelete={(id) => {
                setArtworks(artworks.filter((a) => a.id !== id));
              }}
            />
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders" className="space-y-6">
            <h2 className="text-2xl font-serif font-bold text-foreground">
              注文管理
            </h2>
            <div className="rounded-lg border border-border bg-card p-8 text-center">
              <p className="text-muted-foreground mb-4">
                注文管理機能は実装中です
              </p>
              <p className="text-sm text-muted-foreground">
                ここで顧客からの注文を確認・管理できます
              </p>
            </div>
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
