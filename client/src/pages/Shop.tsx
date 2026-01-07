import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Link } from "wouter";
import { ShoppingCart, Menu, X } from "lucide-react";

interface Product {
  id: number;
  title: string;
  price: number;
  productType: "digital" | "physical";
  imageUrl?: string;
  description?: string;
  stock?: number;
}

// Mock data for demo
const mockProducts: Product[] = [
  {
    id: 1,
    title: "Moonlight Dreams - Digital Edition",
    price: 1500,
    productType: "digital",
    imageUrl: "https://images.unsplash.com/photo-1579783902614-e3fb5141b0cb?w=400&h=400&fit=crop",
    description: "高解像度デジタルアート素材パック",
  },
  {
    id: 2,
    title: "Urban Tales - Manga Volume 1",
    price: 2800,
    productType: "physical",
    imageUrl: "https://images.unsplash.com/photo-1578926078328-123456789012?w=400&h=400&fit=crop",
    description: "限定版漫画本（サイン入り）",
    stock: 5,
  },
  {
    id: 3,
    title: "Whispers of Time - eBook",
    price: 980,
    productType: "digital",
    imageUrl: "https://images.unsplash.com/photo-1507842217343-583f20270319?w=400&h=400&fit=crop",
    description: "完全版電子書籍",
  },
  {
    id: 4,
    title: "Art Print Collection",
    price: 3500,
    productType: "physical",
    imageUrl: "https://images.unsplash.com/photo-1578926078328-123456789013?w=400&h=400&fit=crop",
    description: "限定版アートプリント（5枚セット）",
    stock: 10,
  },
];

export default function Shop() {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const getProductTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      digital: "デジタル",
      physical: "実物",
    };
    return labels[type] || type;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-border bg-card" style={{boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)'}}>
        <div className="container flex items-center justify-between py-4">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-serif font-bold text-accent">My Room</h1>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="/" className="text-foreground hover:text-accent transition-colors">
              ギャラリー
            </Link>
            <Link href="/shop" className="text-foreground hover:text-accent transition-colors font-semibold">
              ショップ
            </Link>
            <Link href="/about" className="text-foreground hover:text-accent transition-colors">
              自己紹介
            </Link>
            <Link href="/history" className="text-foreground hover:text-accent transition-colors">
              活動履歴
            </Link>
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <ShoppingCart className="w-4 h-4" />
              カート
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border bg-card p-4 space-y-3">
            <Link href="/" className="block text-foreground hover:text-accent transition-colors">
              ギャラリー
            </Link>
            <Link href="/shop" className="block text-foreground hover:text-accent transition-colors font-semibold">
              ショップ
            </Link>
            <Link href="/about" className="block text-foreground hover:text-accent transition-colors">
              自己紹介
            </Link>
            <Link href="/history" className="block text-foreground hover:text-accent transition-colors">
              活動履歴
            </Link>
            <Button variant="outline" className="w-full flex items-center justify-center gap-2">
              <ShoppingCart className="w-4 h-4" />
              カート
            </Button>
          </div>
        )}
      </nav>

      {/* Header Section */}
      <section className="py-16 md:py-24 border-b border-border">
        <div className="container text-center">
          <h2 className="text-4xl md:text-5xl font-serif font-bold mb-4 text-foreground">
            ショップ
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            デジタルコンテンツから実物商品まで、様々な作品をご購入いただけます。
          </p>
        </div>
      </section>

      {/* Products Section */}
      <section className="py-16 md:py-24">
        <div className="container">
          {/* Filter Tabs */}
          <div className="flex gap-2 mb-12 flex-wrap">
            <Button variant="outline" className="rounded-full">
              すべて
            </Button>
            <Button variant="outline" className="rounded-full">
              デジタル
            </Button>
            <Button variant="outline" className="rounded-full">
              実物
            </Button>
          </div>

          {/* Products Grid */}
          <div className="gallery-grid">
            {mockProducts.map((product) => (
              <div
                key={product.id}
                className="group relative overflow-hidden rounded-lg border border-border bg-card cursor-pointer transition-all duration-300 hover:shadow-lg"
                onClick={() => setSelectedProduct(product)}
                style={{
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
                }}
              >
                <div className="aspect-square w-full object-cover transition-transform duration-300 group-hover:scale-105 bg-muted relative">
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={product.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                      No Image
                    </div>
                  )}
                  {product.productType === "digital" && (
                    <div className="absolute top-2 right-2 bg-accent text-accent-foreground px-2 py-1 rounded text-xs font-semibold">
                      デジタル
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h4 className="font-serif font-semibold text-foreground mb-2 line-clamp-2">
                    {product.title}
                  </h4>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-accent">
                      ¥{product.price.toLocaleString()}
                    </span>
                    {product.productType === "physical" && product.stock !== undefined && (
                      <span className="text-xs text-muted-foreground">
                        在庫: {product.stock}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Product Detail Modal */}
      <Dialog open={!!selectedProduct} onOpenChange={(open) => !open && setSelectedProduct(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl">
              {selectedProduct?.title}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            {selectedProduct?.imageUrl && (
              <img
                src={selectedProduct.imageUrl}
                alt={selectedProduct.title}
                className="w-full rounded-lg object-cover max-h-96"
              />
            )}
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-3xl font-bold text-accent">
                  ¥{selectedProduct?.price.toLocaleString()}
                </span>
                <span className="text-sm bg-muted text-muted-foreground px-3 py-1 rounded">
                  {getProductTypeLabel(selectedProduct?.productType || "")}
                </span>
              </div>
              {selectedProduct?.productType === "physical" && selectedProduct?.stock !== undefined && (
                <p className="text-sm text-muted-foreground mb-4">
                  在庫: {selectedProduct.stock}個
                </p>
              )}
              <p className="text-foreground leading-relaxed">
                {selectedProduct?.description}
              </p>
            </div>
            <div className="flex gap-3 pt-4 border-t border-border">
              <Button className="flex-1" variant="default">
                カートに追加
              </Button>
              <Button className="flex-1" variant="outline">
                閉じる
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-12">
        <div className="container text-center text-muted-foreground">
          <p>&copy; 2024 My Room Portfolio. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
