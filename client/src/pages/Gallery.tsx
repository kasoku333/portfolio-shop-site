import { useState, useEffect } from "react";
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

const CATEGORY_LABELS: Record<string, string> = {
  illustration: "イラスト",
  manga: "漫画",
  novel: "小説",
};

export default function Gallery() {
  const [searchParams] = useSearchParams();
  const [selectedCategory, setSelectedCategory] = useState<string>(
    searchParams.get("category") ?? "all"
  );
  const [selectedArtwork, setSelectedArtwork] = useState<Artwork | null>(null);

  // URLパラメータと同期（ホームページカードからの遷移に対応）
  useEffect(() => {
    const cat = searchParams.get("category") ?? "all";
    setSelectedCategory(cat);
  }, [searchParams]);

  const { data: artworks = [], isLoading, isError } = trpc.artworks.list.useQuery({
    category: selectedCategory as any,
  }, { retry: 1, retryDelay: 1000 });
  const showLoading = isLoading && !isError;

  return (
    <Shell>
      {/* ページヘッダー */}
      <section className="py-10 md:py-14 border-b border-border/60">
        <div className="container">
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-2">
            ギャラリー
          </h1>
          <p className="text-sm text-muted-foreground">
            漫画・イラスト・小説の作品一覧
          </p>
        </div>
      </section>

      {/* 作品一覧 */}
      <section className="py-10 md:py-16">
        <div className="container space-y-8">
          {/* カテゴリフィルター */}
          <div className="flex flex-wrap gap-2">
            {["all", "illustration", "manga", "novel"].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === cat
                    ? "bg-accent text-accent-foreground"
                    : "bg-muted text-foreground hover:bg-muted/80"
                }`}
              >
                {cat === "all" ? "すべて" : CATEGORY_LABELS[cat]}
              </button>
            ))}
          </div>

          {/* 読み込み中 */}
          {showLoading && (
            <div className="text-center py-16">
              <p className="text-muted-foreground">読み込み中...</p>
            </div>
          )}

          {/* エラー */}
          {isError && (
            <div className="text-center py-16 space-y-2">
              <p className="text-destructive font-medium">サーバーに接続できませんでした</p>
              <p className="text-sm text-muted-foreground">時間を置いて再度お試しください。</p>
            </div>
          )}

          {/* 作品グリッド */}
          {!showLoading && !isError && artworks.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {artworks.map((artwork) => (
                <div
                  key={artwork.id}
                  onClick={() => setSelectedArtwork(artwork)}
                  className="group cursor-pointer rounded-xl border border-border bg-card overflow-hidden shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
                >
                  <div className="aspect-square w-full bg-muted relative overflow-hidden">
                    {artwork.imageUrl ? (
                      <img
                        src={artwork.imageUrl}
                        alt={artwork.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">
                        No image
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-serif font-semibold text-foreground mb-1.5 line-clamp-2">
                      {artwork.title}
                    </h3>
                    <span className="inline-block text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">
                      {CATEGORY_LABELS[artwork.category]}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 空の状態 */}
          {!showLoading && !isError && artworks.length === 0 && (
            <div className="text-center py-16">
              <p className="text-muted-foreground">
                {selectedCategory === "all"
                  ? "作品がまだアップロードされていません"
                  : `${CATEGORY_LABELS[selectedCategory] || selectedCategory}の作品はまだありません`}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* 作品詳細モーダル */}
      <Dialog open={!!selectedArtwork} onOpenChange={() => setSelectedArtwork(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedArtwork && (
            <>
              <DialogHeader>
                <DialogTitle className="font-serif text-xl">{selectedArtwork.title}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                {selectedArtwork.imageUrl && (
                  <img
                    src={selectedArtwork.imageUrl}
                    alt={selectedArtwork.title}
                    className="w-full rounded-lg object-cover"
                  />
                )}
                <div>
                  <span className="inline-block text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full mb-3">
                    {CATEGORY_LABELS[selectedArtwork.category]}
                  </span>
                  {selectedArtwork.description && (
                    <p className="text-foreground leading-relaxed">{selectedArtwork.description}</p>
                  )}
                </div>
                <div className="flex gap-3 pt-2">
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
