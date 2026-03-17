import { useState } from "react";
import { Button } from "@/components/ui/button";
import Shell from "@/components/Shell";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";

type FilterType = "all" | "digital" | "physical";

export default function Shop() {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [filter, setFilter] = useState<FilterType>("all");
  const { user } = useAuth();
  const utils = trpc.useUtils();

  const { data: allProducts, isLoading } = trpc.products.list.useQuery();

  const addToCart = trpc.cart.addItem.useMutation({
    onSuccess: () => {
      utils.cart.getItemCount.invalidate();
      toast.success("カートに追加しました");
      setSelectedId(null);
    },
    onError: () => {
      toast.error("カートへの追加に失敗しました");
    },
  });

  const products = allProducts?.filter((p) =>
    filter === "all" ? true : p.productType === filter
  ) ?? [];

  const selectedProduct = allProducts?.find((p) => p.id === selectedId) ?? null;

  const handleAddToCart = (productId: number) => {
    if (!user) {
      toast.error("カートに追加するにはログインが必要です");
      return;
    }
    addToCart.mutate({ productId, quantity: 1 });
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
            デジタルコンテンツから実物商品まで、大切な創作物をお選びいただけます。
          </p>
        </div>
      </section>

      {/* Products Section */}
      <section className="py-16 md:py-24">
        <div className="container">
          {/* Filter Tabs */}
          <div className="flex gap-2 mb-12 flex-wrap">
            {(["all", "digital", "physical"] as FilterType[]).map((f) => (
              <Button
                key={f}
                variant={filter === f ? "default" : "outline"}
                className="rounded-full"
                onClick={() => setFilter(f)}
              >
                {f === "all" ? "すべて" : f === "digital" ? "デジタル" : "実物"}
              </Button>
            ))}
          </div>

          {/* Loading */}
          {isLoading && (
            <div className="py-24 text-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-accent mx-auto" />
            </div>
          )}

          {/* Empty */}
          {!isLoading && products.length === 0 && (
            <div className="py-24 text-center text-muted-foreground">
              <p className="text-lg">商品がありません</p>
            </div>
          )}

          {/* Products Grid */}
          {!isLoading && products.length > 0 && (
            <div className="gallery-grid">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="group relative overflow-hidden rounded-lg border border-border bg-card cursor-pointer transition-all duration-300 hover:shadow-lg"
                  onClick={() => setSelectedId(product.id)}
                  style={{ boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)" }}
                >
                  <div className="aspect-square w-full object-cover transition-transform duration-300 group-hover:scale-105 bg-muted relative overflow-hidden">
                    {product.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt={product.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">
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
                        ¥{parseFloat(product.price).toLocaleString()}
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
        </div>
      </section>

      {/* Product Detail Modal */}
      <Dialog open={!!selectedProduct} onOpenChange={(open) => !open && setSelectedId(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl">
              {selectedProduct?.title}
            </DialogTitle>
          </DialogHeader>
          {selectedProduct && (
            <div className="space-y-6">
              {selectedProduct.imageUrl && (
                <img
                  src={selectedProduct.imageUrl}
                  alt={selectedProduct.title}
                  className="w-full rounded-lg object-cover max-h-96"
                />
              )}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-3xl font-bold text-accent">
                    ¥{parseFloat(selectedProduct.price).toLocaleString()}
                  </span>
                  <span className="text-sm bg-muted text-muted-foreground px-3 py-1 rounded">
                    {selectedProduct.productType === "digital" ? "デジタル" : "実物"}
                  </span>
                </div>
                {selectedProduct.productType === "physical" && selectedProduct.stock != null && (
                  <p className="text-sm text-muted-foreground mb-4">
                    在庫: {selectedProduct.stock}点
                  </p>
                )}
                {selectedProduct.description && (
                  <p className="text-foreground leading-relaxed">
                    {selectedProduct.description}
                  </p>
                )}
              </div>
              <div className="flex gap-3 pt-4 border-t border-border">
                <Button
                  className="flex-1"
                  variant="default"
                  disabled={addToCart.isPending}
                  onClick={() => handleAddToCart(selectedProduct.id)}
                >
                  {addToCart.isPending ? "追加中..." : "カートに追加"}
                </Button>
                <Button className="flex-1" variant="outline" onClick={() => setSelectedId(null)}>
                  閉じる
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Shell>
  );
}
