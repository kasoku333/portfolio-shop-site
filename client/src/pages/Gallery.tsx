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

export default function Gallery() {
  const [searchParams] = useSearchParams();
  const initialCategory = searchParams.get("category") ?? "all";
  const [selectedArtwork, setSelectedArtwork] = useState<Artwork | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);

  const { data: artworks = [], isLoading, isError } = trpc.artworks.list.useQuery({
    category: selectedCategory as any,
  }, { retry: 1, retryDelay: 1000 });
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
      <section className="py-16 md:py-24 text-center bg-muted/50">
        <div className="container space-y-4">
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-foreground">
            ギャラリーへようこそ！
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            イラスト、漫画、小説の作品を展示・販売しています。
            <br />
            デジタルコンテンツから実物作品まで、様々な作品をお楽しみください。
          </p>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="py-16 md:py-24">
        <div className="container space-y-8">
          <h3 className="text-3xl font-serif font-bold text-foreground">ギャラリー</h3>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-3">
            {["all", "illustration", "manga", "novel"].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full transition-colors ${
                  selectedCategory === cat
                    ? "bg-accent text-accent-foreground"
                    : "bg-muted text-foreground hover:bg-muted/80"
                }`}
              >
                {cat === "all" ? "すべて" : getCategoryLabel(cat)}
              </button>
            ))}
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

          {/* Artworks Grid */}
          {!showLoading && !isError && artworks.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {artworks.map((artwork) => (
                <div
                  key={artwork.id}
                  onClick={() => setSelectedArtwork(artwork)}
                  className="group cursor-pointer"
                >
                  <div className="relative overflow-hidden rounded-lg border border-border bg-muted aspect-square mb-4 transition-transform hover:scale-105">
                    {artwork.imageUrl ? (
                      <img
                        src={artwork.imageUrl}
                        alt={artwork.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        No image
                      </div>
                    )}
                  </div>
                  <h4 className="font-serif font-semibold text-foreground mb-1">
                    {artwork.title}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {getCategoryLabel(artwork.category)}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!showLoading && !isError && artworks.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">作品がまだアップロードされていません</p>
            </div>
          )}
        </div>
      </section>

      {/* Artwork Detail Modal */}
      <Dialog open={!!selectedArtwork} onOpenChange={() => setSelectedArtwork(null)}>
        <DialogContent className="max-w-2xl">
          {selectedArtwork && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedArtwork.title}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                {selectedArtwork.imageUrl && (
                  <img
                    src={selectedArtwork.imageUrl}
                    alt={selectedArtwork.title}
                    className="w-full rounded-lg"
                  />
                )}
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">
                    {getCategoryLabel(selectedArtwork.category)}
                  </p>
                  <p className="text-foreground">{selectedArtwork.description}</p>
                </div>
                <div className="flex gap-3 pt-4">
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
