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

const FILTERS = [
  { value: "all", label: "すべて" },
  { value: "digital", label: "デジタル" },
  { value: "physical", label: "実物" },
] as const;

// 価格を「¥1,000」形式で必ず3桁区切り表示する。
function formatPrice(value: number | undefined | null) {
  if (value == null || Number.isNaN(value)) return "¥0";
  return `¥${Math.round(value).toLocaleString("ja-JP")}`;
}

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

  const { data: dbProducts = [], isLoading, isError } = trpc.products.list.useQuery(undefined, {
    retry: 1,
    retryDelay: 1000,
  });
  const showLoading = isLoading && !isError;
  const allProducts: Product[] = dbProducts.map((p) => ({
    ...p,
    price: typeof p.price === "string" ? parseFloat(p.price) : p.price,
  }));

  const filteredProducts =
    selectedFilter === "all" ? allProducts : allProducts.filter((p) => p.productType === selectedFilter);

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
      <section className="py-14 md:py-20 border-b border-border/60 bg-muted/40">
        <div className="container text-center space-y-3">
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Shop</p>
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground">ショップ</h2>
          <p className="text-sm md:text-base text-muted-foreground max-w-xl mx-auto leading-relaxed">
            デジタル作品と実物作品をお届けします。
          </p>
        </div>
      </section>

      {/* Products Section */}
      <section className="py-12 md:py-16">
        <div className="container">
          {/* Filter Tabs */}
          <div className="flex flex-wrap gap-2 sm:gap-3 mb-10" role="tablist" aria-label="商品タイプで絞り込む">
            {FILTERS.map((filter) => {
              const isActive = selectedFilter === filter.value;
              return (
                <button
                  key={filter.value}
                  type="button"
                  onClick={() => setSelectedFilter(filter.value)}
                  role="tab"
                  aria-selected={isActive}
                  className={[
                    "px-4 py-2 rounded-full text-sm border transition-colors",
                    isActive
                      ? "bg-accent text-accent-foreground border-accent"
                      : "bg-card text-foreground border-border hover:border-accent/40 hover:text-accent",
                  ].join(" ")}
                >
                  {filter.label}
                </button>
              );
            })}
          </div>

          {/* Loading State */}
          {showLoading && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">読み込み中...</p>
            </div>
          )}

          {/* Error State */}
          {isError && (
            <div className="text-center py-12 space-y-2">
              <p className="text-destructive font-medium">サーバーに接続できませんでした</p>
              <p className="text-sm text-muted-foreground">
                時間を置いて再度お試しください。
              </p>
            </div>
          )}

          {/* Products Grid */}
          {!showLoading && !isError && filteredProducts.length > 0 && (
            <div
              className={
                filteredProducts.length === 1
                  ? "grid grid-cols-1 sm:grid-cols-[minmax(0,18rem)] gap-6"
                  : "gallery-grid"
              }
            >
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="group relative overflow-hidden rounded-lg border border-border bg-card cursor-pointer transition-all duration-300 hover:shadow-lg flex flex-col"
                  onClick={() => setSelectedProduct(product)}
                  style={{ boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)" }}
                >
                  <div className="aspect-square w-full bg-muted relative overflow-hidden">
                    {product.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt={product.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        No Image
                      </div>
                    )}
                    <div
                      className={[
                        "absolute top-2 right-2 px-2 py-1 rounded text-xs font-semibold",
                        product.productType === "digital"
                          ? "bg-accent text-accent-foreground"
                          : "bg-background/90 text-foreground border border-border",
                      ].join(" ")}
                    >
                      {getProductTypeLabel(product.productType)}
                    </div>
                  </div>
                  <div className="p-4 flex-1 flex flex-col">
                    <h4 className="font-serif font-semibold text-foreground mb-2 line-clamp-2">
                      {product.title}
                    </h4>
                    <div className="mt-auto flex items-center justify-between">
                      <span className="text-lg font-bold text-accent">
                        {formatPrice(product.price)}
                      </span>
                      {product.productType === "physical" && product.stock != null && (
                        <span className="text-xs text-muted-foreground">在庫: {product.stock}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!showLoading && !isError && filteredProducts.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">該当する商品がありません</p>
            </div>
          )}
        </div>
      </section>

      {/* Product Detail Modal */}
      <Dialog open={!!selectedProduct} onOpenChange={(open) => !open && setSelectedProduct(null)}>
        <DialogContent className="max-w-2xl w-[calc(100vw-2rem)] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl md:text-2xl">
              {selectedProduct?.title}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-5">
            {selectedProduct?.imageUrl && (
              <img
                src={selectedProduct.imageUrl}
                alt={selectedProduct.title}
                className="w-full rounded-lg object-contain bg-muted max-h-[55vh]"
              />
            )}
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="text-3xl font-bold text-accent">
                  {formatPrice(selectedProduct?.price ?? 0)}
                </span>
                <span className="text-xs bg-muted text-muted-foreground px-3 py-1 rounded uppercase tracking-wider">
                  {getProductTypeLabel(selectedProduct?.productType || "")}
                </span>
              </div>
              {selectedProduct?.productType === "physical" && selectedProduct?.stock != null && (
                <p className="text-sm text-muted-foreground">在庫: {selectedProduct.stock}個</p>
              )}
              {selectedProduct?.description ? (
                <p className="text-foreground leading-relaxed whitespace-pre-line">
                  {selectedProduct.description}
                </p>
              ) : (
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {selectedProduct?.productType === "digital"
                    ? "PDF形式で読めるデジタル作品です。購入後、ダウンロードできます。"
                    : "実物作品です。発送までしばらくお待ちください。"}
                </p>
              )}
            </div>
            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-border">
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
