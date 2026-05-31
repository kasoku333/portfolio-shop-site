import { useParams, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { trpc } from "@/lib/trpc";
import Shell from "@/components/Shell";
import { Button } from "@/components/ui/button";
import NotFound from "@/pages/NotFound";

export default function NovelReader() {
  const { id } = useParams();
  const numericId = Number(id);
  const isValidId = Number.isFinite(numericId);

  const {
    data: artwork,
    isLoading,
    isError,
  } = trpc.artworks.getById.useQuery(
    { id: numericId },
    { enabled: isValidId, retry: 1 }
  );

  if (!isValidId) {
    return <NotFound />;
  }

  return (
    <Shell>
      <section className="py-10 md:py-14">
        <div className="container max-w-3xl space-y-8">
          {/* 戻る導線 */}
          <Link
            to="/gallery?category=novel"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-accent transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            小説一覧へ戻る
          </Link>

          {/* Loading */}
          {isLoading && (
            <div className="text-center py-16">
              <p className="text-muted-foreground">読み込み中...</p>
            </div>
          )}

          {/* Error */}
          {isError && (
            <div className="text-center py-16 space-y-2">
              <p className="text-destructive font-medium">
                作品を読み込めませんでした
              </p>
              <p className="text-sm text-muted-foreground">
                時間を置いて再度お試しください。
              </p>
            </div>
          )}

          {/* Body */}
          {!isLoading && !isError && artwork && (
            <article className="space-y-8">
              <header className="space-y-3 text-center">
                <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                  Novel
                </p>
                <h1 className="text-2xl md:text-4xl font-serif font-bold text-foreground leading-snug">
                  {artwork.title}
                </h1>
              </header>

              {/* 表紙画像（任意） */}
              {artwork.imageUrl && (
                <img
                  src={artwork.imageUrl}
                  alt={artwork.title}
                  className="w-full max-h-[55vh] object-contain rounded-lg bg-muted"
                />
              )}

              {/* 前書き・キャプション */}
              {artwork.description && (
                <div className="rounded-lg border border-border/70 bg-muted/40 p-5">
                  <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">
                    前書き
                  </p>
                  <p className="text-sm md:text-base text-foreground whitespace-pre-line leading-relaxed">
                    {artwork.description}
                  </p>
                </div>
              )}

              {/* 本文 */}
              {artwork.content ? (
                <div className="font-serif text-foreground whitespace-pre-wrap leading-loose text-base md:text-lg tracking-wide">
                  {artwork.content}
                </div>
              ) : (
                <p className="text-center text-sm text-muted-foreground py-8">
                  本文がまだ登録されていません。
                </p>
              )}

              {/* 末尾の戻る導線 */}
              <div className="pt-8 border-t border-border/60 text-center">
                <Link to="/gallery?category=novel">
                  <Button variant="outline">小説一覧へ戻る</Button>
                </Link>
              </div>
            </article>
          )}
        </div>
      </section>
    </Shell>
  );
}
