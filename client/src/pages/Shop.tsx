import { useState } from "react";
import Shell from "@/components/Shell";
import { ExternalLink } from "lucide-react";
import { trpc } from "@/lib/trpc";

interface Product {
  id: number;
  title: string;
  price: number;
  productType: "digital" | "physical";
  imageUrl?: string | null;
  description?: string | null;
  boothUrl?: string | null;
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
  const [selectedFilter, setSelectedFilter] = useState<"all" | "digital" | "physical">("all");

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
            作品はBOOTHにて頒布しています。気になる作品を選ぶと、BOOTHの商品ページが開きます。
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
              {filteredProducts.map((product) => {
                // BOOTHのURLが未設定の商品は遷移先がないため、リンクにせず「準備中」として出す。
                const boothUrl = product.boothUrl?.trim();

                const cardClassName = [
                  "group relative overflow-hidden rounded-lg border border-border bg-card transition-all duration-300 flex flex-col",
                  boothUrl ? "cursor-pointer hover:shadow-lg" : "opacity-70",
                ].join(" ");

                const cardBody = (
                  <>
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
                      <div className="mt-auto flex items-center justify-between gap-2">
                        <span className="text-lg font-bold text-accent">
                          {formatPrice(product.price)}
                        </span>
                        {boothUrl ? (
                          <span className="flex items-center gap-1 text-xs text-muted-foreground transition-colors group-hover:text-accent">
                            BOOTHで見る
                            <ExternalLink className="h-3 w-3" aria-hidden="true" />
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground">準備中</span>
                        )}
                      </div>
                    </div>
                  </>
                );

                return boothUrl ? (
                  <a
                    key={product.id}
                    href={boothUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cardClassName}
                    style={{ boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)" }}
                  >
                    {cardBody}
                  </a>
                ) : (
                  <div
                    key={product.id}
                    className={cardClassName}
                    style={{ boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)" }}
                  >
                    {cardBody}
                  </div>
                );
              })}
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
    </Shell>
  );
}
