import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { trpc } from "@/lib/trpc";
import Shell from "@/components/Shell";
import { Link, useSearchParams } from "react-router-dom";

interface Artwork {
  id: number;
  title: string;
  category: "illustration" | "manga" | "novel";
  imageUrl?: string | null;
  description?: string | null;
  userId?: number;
  imageKey?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

const FILTERS = [
  { value: "all", label: "すべて" },
  { value: "illustration", label: "イラスト" },
  { value: "manga", label: "漫画" },
  { value: "novel", label: "小説" },
] as const;

export default function Gallery() {
  const [searchParams] = useSearchParams();
  const initialCategory = searchParams.get("category") ?? "all";
  const [selectedArtwork, setSelectedArtwork] = useState<Artwork | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);

  const { data: artworks = [], isLoading, isError } = trpc.artworks.list.useQuery(
    { category: selectedCategory as any },
    { retry: 1, retryDelay: 1000 }
  );
  const showLoading = isLoading && !isError;

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      illustration: "イラスト",
      manga: "漫画",
      novel: "小説",
    };
    return labels[category] || category;
  };

  return (
    <Shell>
      {/* Hero Section */}
      <section className="py-14 md:py-20 text-center bg-muted/40 border-b border-border/60">
        <div className="container space-y-3">
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Gallery</p>
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground">
            作品ギャラリー
          </h2>
          <p className="text-sm md:text-base text-muted-foreground max-w-xl mx-auto leading-relaxed">
            イラスト・漫画・小説の作品を、ゆっくり並べています。
            <br className="hidden sm:inline" />
            気になる作品があれば、カードをタップして詳しく見てください。
          </p>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="py-12 md:py-16">
        <div className="container space-y-8">
          {/* Category Filter（このページの主導線） */}
          <div className="flex flex-wrap gap-2 sm:gap-3" role="tablist" aria-label="カテゴリで絞り込む">
            {FILTERS.map((filter) => {
              const isActive = selectedCategory === filter.value;
              return (
                <button
                  key={filter.value}
                  type="button"
                  onClick={() => setSelectedCategory(filter.value)}
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

          {/* Artworks Grid
              1件のみのときは max-w で幅を抑え、左寄せの違和感を防ぐ。
              2件以上のときは sm/lg/xl のグリッドが効く。 */}
          {!showLoading && !isError && artworks.length > 0 && (
            <div
              className={
                artworks.length === 1
                  ? "grid grid-cols-1 sm:grid-cols-[minmax(0,18rem)] gap-6"
                  : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              }
            >
              {artworks.map((artwork) => (
                <button
                  key={artwork.id}
                  type="button"
                  onClick={() => setSelectedArtwork(artwork)}
                  className="group text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring rounded-lg"
                >
                  <div className="relative overflow-hidden rounded-lg border border-border bg-muted aspect-square mb-3 transition-transform group-hover:scale-[1.02]">
                    {artwork.imageUrl ? (
                      <img
                        src={artwork.imageUrl}
                        alt={artwork.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">
                        No image
                      </div>
                    )}
                  </div>
                  <h4 className="font-serif font-semibold text-foreground mb-1 line-clamp-2">
                    {artwork.title}
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    {getCategoryLabel(artwork.category)}
                  </p>
                </button>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!showLoading && !isError && artworks.length === 0 && (
            <div className="text-center py-16 space-y-2">
              <p className="text-muted-foreground">この棚はまだ空です。</p>
              <p className="text-xs text-muted-foreground/80">
                作品が並ぶまで、もう少しだけお待ちください。
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Artwork Detail Modal */}
      <Dialog open={!!selectedArtwork} onOpenChange={() => setSelectedArtwork(null)}>
        <DialogContent className="max-w-2xl w-[calc(100vw-2rem)] max-h-[90vh] overflow-y-auto">
          {selectedArtwork && (
            <>
              <DialogHeader>
                <DialogTitle className="font-serif text-xl md:text-2xl">
                  {selectedArtwork.title}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                {selectedArtwork.imageUrl && (
                  <img
                    src={selectedArtwork.imageUrl}
                    alt={selectedArtwork.title}
                    className="w-full rounded-lg max-h-[60vh] object-contain bg-muted"
                  />
                )}
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">
                    {getCategoryLabel(selectedArtwork.category)}
                  </p>
                  {selectedArtwork.description ? (
                    <p className="text-foreground whitespace-pre-line leading-relaxed">
                      {selectedArtwork.description}
                    </p>
                  ) : (
                    <p className="text-sm text-muted-foreground">説明文はまだありません。</p>
                  )}
                </div>
                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <Link to="/shop" className="flex-1">
                    <Button className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                      関連商品を見る
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setSelectedArtwork(null)}
                  >
                    閉じる
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </Shell>
  );
}
