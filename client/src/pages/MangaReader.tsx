import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import { trpc } from "@/lib/trpc";
import Shell from "@/components/Shell";
import { Button } from "@/components/ui/button";
import NotFound from "@/pages/NotFound";
import { getMangaPages, type MangaViewMode } from "@shared/manga";

// 読み方の選択は読む人ごとの好みなので、その人のブラウザにだけ覚えておく。
// プライベートモード等で使えないこともあるので、読めなければ縦スクロールで始める。
const VIEW_MODE_KEY = "manga-view-mode";

function loadViewMode(): MangaViewMode {
  try {
    return localStorage.getItem(VIEW_MODE_KEY) === "horizontal"
      ? "horizontal"
      : "vertical";
  } catch {
    return "vertical";
  }
}

function saveViewMode(mode: MangaViewMode) {
  try {
    localStorage.setItem(VIEW_MODE_KEY, mode);
  } catch {
    // 覚えられなくても、今の画面で切り替わっていれば十分
  }
}

// 指を離したときの横移動がこれ以上ならスワイプとみなす（px）
const SWIPE_THRESHOLD = 50;

export default function MangaReader() {
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

  const [viewMode, setViewMode] = useState<MangaViewMode>(loadViewMode);
  const [pageIndex, setPageIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);

  const pages = useMemo(
    () => (artwork ? getMangaPages(artwork) : []),
    [artwork]
  );
  const lastIndex = pages.length - 1;

  const changeViewMode = (mode: MangaViewMode) => {
    setViewMode(mode);
    saveViewMode(mode);
  };

  const goNext = useCallback(
    () => setPageIndex(i => Math.min(i + 1, lastIndex)),
    [lastIndex]
  );
  const goPrev = useCallback(() => setPageIndex(i => Math.max(i - 1, 0)), []);

  // 別の作品に移ったら1ページ目から
  useEffect(() => {
    setPageIndex(0);
  }, [numericId]);

  // 右開き（日本の漫画と同じ）なので、← が次のページ、→ が前のページ
  useEffect(() => {
    if (viewMode !== "horizontal") return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") goNext();
      if (e.key === "ArrowRight") goPrev();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [viewMode, goNext, goPrev]);

  // 次のページを先に読み込んでおき、めくったときに白い画面を挟まない
  useEffect(() => {
    if (viewMode !== "horizontal") return;
    const next = pages[pageIndex + 1];
    if (next) new Image().src = next;
  }, [viewMode, pageIndex, pages]);

  if (!isValidId) {
    return <NotFound />;
  }

  // 右開きなので、画面の左側を押すと次、右側を押すと前
  const handlePageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    if (e.clientX - rect.left < rect.width / 2) goNext();
    else goPrev();
  };

  // 右開きなので、指を右へ払うと次のページ
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (dx > SWIPE_THRESHOLD) goNext();
    if (dx < -SWIPE_THRESHOLD) goPrev();
  };

  return (
    <Shell>
      <section className="py-10 md:py-14">
        <div className="container max-w-3xl space-y-8">
          {/* 戻る導線 */}
          <Link
            to="/gallery?category=manga"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-accent transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            漫画一覧へ戻る
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

          {!isLoading && !isError && artwork && (
            <article className="space-y-8">
              <header className="space-y-3 text-center">
                <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                  Manga
                </p>
                <h1 className="text-2xl md:text-4xl font-serif font-bold text-foreground leading-snug">
                  {artwork.title}
                </h1>
              </header>

              {/* 説明・キャプション */}
              {artwork.description && (
                <div className="rounded-lg border border-border/70 bg-muted/40 p-5">
                  <p className="text-sm md:text-base text-foreground whitespace-pre-line leading-relaxed">
                    {artwork.description}
                  </p>
                </div>
              )}

              {pages.length === 0 ? (
                <p className="text-center text-sm text-muted-foreground py-8">
                  ページがまだ登録されていません。
                </p>
              ) : (
                <>
                  {/* 読み方の切り替え */}
                  <div
                    className="flex justify-center"
                    role="radiogroup"
                    aria-label="読み方"
                  >
                    <div className="inline-flex rounded-full border border-border bg-card p-1">
                      {(
                        [
                          { value: "vertical", label: "縦スクロール" },
                          { value: "horizontal", label: "横めくり" },
                        ] as const
                      ).map(option => {
                        const isActive = viewMode === option.value;
                        return (
                          <button
                            key={option.value}
                            type="button"
                            role="radio"
                            aria-checked={isActive}
                            onClick={() => changeViewMode(option.value)}
                            className={[
                              "px-4 py-1.5 rounded-full text-sm transition-colors",
                              isActive
                                ? "bg-accent text-accent-foreground"
                                : "text-muted-foreground hover:text-accent",
                            ].join(" ")}
                          >
                            {option.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {viewMode === "vertical" ? (
                    <div className="space-y-2">
                      {pages.map((url, index) => (
                        <img
                          key={`${url}-${index}`}
                          src={url}
                          alt={`${artwork.title} ${index + 1}ページ目`}
                          className="w-full rounded bg-muted"
                          loading={index < 2 ? "eager" : "lazy"}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div
                        className="relative h-[75svh] rounded bg-muted select-none cursor-pointer touch-pan-y"
                        onClick={handlePageClick}
                        onTouchStart={e => {
                          touchStartX.current = e.touches[0].clientX;
                        }}
                        onTouchEnd={handleTouchEnd}
                      >
                        <img
                          src={pages[pageIndex]}
                          alt={`${artwork.title} ${pageIndex + 1}ページ目`}
                          className="w-full h-full object-contain"
                          draggable={false}
                        />
                      </div>

                      {/* 右開きなので「次へ」が左 */}
                      <div className="flex items-center justify-between gap-3">
                        <Button
                          variant="outline"
                          onClick={goNext}
                          disabled={pageIndex >= lastIndex}
                          className="gap-1"
                        >
                          <ChevronLeft className="w-4 h-4" />
                          次へ
                        </Button>
                        <p
                          className="text-sm text-muted-foreground tabular-nums"
                          aria-live="polite"
                        >
                          {pageIndex + 1} / {pages.length}
                        </p>
                        <Button
                          variant="outline"
                          onClick={goPrev}
                          disabled={pageIndex === 0}
                          className="gap-1"
                        >
                          前へ
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* 末尾の戻る導線 */}
              <div className="pt-8 border-t border-border/60 text-center">
                <Link to="/gallery?category=manga">
                  <Button variant="outline">漫画一覧へ戻る</Button>
                </Link>
              </div>
            </article>
          )}
        </div>
      </section>
    </Shell>
  );
}
