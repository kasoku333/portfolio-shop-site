import { useState } from "react";
import { Button } from "@/components/ui/button";
import Shell from "@/components/Shell";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Link } from "react-router-dom";
import { trpc } from "@/lib/trpc";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";

interface Product {
  id: number;
  title: string;
  price: number;
  productType: "digital" | "physical";
  imageUrl?: string | null;
  description?: string | null;
  stock?: number | null;
}

// Mock data for demo (fallback)
const mockProducts: Product[] = [
  {
    id: 1,
    title: "Moonlight Dreams - Digital Edition",
    price: 1500,
    productType: "digital",
    imageUrl: "https://images.unsplash.com/photo-1579783902614-e3fb5141b0cb?w=400&h=400&fit=crop",
    description: "高解像度デジタルアート完全パック",
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
    description: "完結済み電子書籍版",
  },
  {
    id: 4,
    title: "Art Print Collection",
    price: 3500,
    productType: "physical",
    imageUrl: "https://images.unsplash.com/photo-1578926078328-123456789013?w=400&h=400&fit=crop",
    description: "限定版アートプリント（3枚セット）",
    stock: 10,
  },
];

export default function Shop() {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<"all" | "digital" | "physical">("all");
  const { addItem } = useCart();

  const handleAddToCart = (product: Product) => {
    addItem({
      productId: product.id,
      title: product.title,
      price: product.price,
      imageUrl: product.imageUrl,
      productType: product.productType,
    });
    toast.success(`「${product.title}」をカートに追加しました`);
  };

  // DB から商品を取得、なければモックデータを使用
  const { data: dbProducts = [], isLoading, isError } = trpc.products.list.useQuery(undefined, {
    retry: 1,
    retryDelay: 1000,
  });
  const showLoading = isLoading && !isError;
  const allProducts: Product[] = (dbProducts.length > 0 && !isError)
    ? dbProducts.map(p => ({ ...p, price: typeof p.price === 'string' ? parseFloat(p.price) : p.price }))
    : mockProducts;

  const filteredProducts = selectedFilter === "all"
    ? allProducts
    : allProducts.filter(p => p.productType === selectedFilter);

  const getProductTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      digital: "デジタル",
      physical: "実物",
    };
    return labels[type] || type;
  };

  return (
    <Shell>

      {/* Header Section */}
      <section className="py-16 md:py-24 border-b border-border">
        <div className="container text-center">
          <h2 className="text-4xl md:text-5xl font-serif font-bold mb-4 text-foreground">
            ショップ
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            デジタルコンテンツから実物作品まで、様々な作品をご購入いただけます。
          </p>
        </div>
      </section>

      {/* Products Section */}
      <section className="py-16 md:py-24">
        <div className="container">
          {/* Filter Tabs */}
          <div className="flex gap-2 mb-12 flex-wrap">
            {(["all", "digital", "physical"] as const).map((filter) => (
              <Button
                key={filter}
                variant="outline"
                className={`rounded-full ${selectedFilter === filter ? "bg-accent text-accent-foreground" : ""}`}
                onClick={() => setSelectedFilter(filter)}
              >
                {filter === "all" ? "すべて" : filter === "digital" ? "デジタル" : "実物"}
              </Button>
            ))}
          </div>

          {/* Loading State */}
          {showLoading && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">読み込み中...</p>
            </div>
          )}

          {/* Products Grid */}
          {!showLoading && (
            <div className="gallery-grid">
              {filteredProducts.map((product) => (
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
                      {product.productType === "physical" && product.stock != null && (
                        <span className="text-xs text-muted-foreground">
                          在庫: {product.stock}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!isLoading && filteredProducts.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">該当する商品がありません</p>
            </div>
          )}
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
              {selectedProduct?.productType === "physical" && selectedProduct?.stock != null && (
                <p className="text-sm text-muted-foreground mb-4">
                  在庫: {selectedProduct.stock}個
                </p>
              )}
              <p className="text-foreground leading-relaxed">
                {selectedProduct?.description}
              </p>
            </div>
            <div className="flex gap-3 pt-4 border-t border-border">
              <Button
                className="flex-1"
                variant="default"
                onClick={() => {
                  if (selectedProduct) {
                    handleAddToCart(selectedProduct);
                    setSelectedProduct(null);
                  }
                }}
              >
                カートに追加
              </Button>
              <Button className="flex-1" variant="outline" onClick={() => setSelectedProduct(null)}>
                閉じる
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Shell>
  );
}
