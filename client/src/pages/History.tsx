import { Button } from "@/components/ui/button";
import Shell from "@/components/Shell";
import { Link } from "react-router-dom";
import { trpc } from "@/lib/trpc";

const CATEGORY_LABELS: Record<string, string> = {
  site: "サイト",
  creation: "制作",
  post: "投稿",
  exhibition: "イベント",
  publication: "出版",
  award: "受賞",
  other: "その他",
};

const CATEGORY_COLORS: Record<string, string> = {
  site: "bg-emerald-100 text-emerald-800",
  creation: "bg-blue-100 text-blue-800",
  post: "bg-purple-100 text-purple-800",
  exhibition: "bg-amber-100 text-amber-800",
  publication: "bg-teal-100 text-teal-800",
  award: "bg-orange-100 text-orange-800",
  other: "bg-gray-100 text-gray-600",
};

export default function History() {
  const { data: settings } = trpc.siteSettings.get.useQuery(undefined, {
    staleTime: 1000 * 60 * 5,
  });

  const historyItems = (settings?.historyItems || [])
    .filter((item) => item.isPublished)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <Shell>
      {/* ページヘッダー */}
      <section className="py-10 md:py-14 border-b border-border/60">
        <div className="container">
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-2">
            制作記録
          </h1>
          <p className="text-sm text-muted-foreground">
            活動の歩み・制作の記録
          </p>
        </div>
      </section>

      {/* タイムライン */}
      <section className="py-10 md:py-16">
        <div className="container max-w-2xl">
          {historyItems.length === 0 ? (
            <p className="text-center text-muted-foreground py-16">
              活動記録はまだありません。
            </p>
          ) : (
            <div className="relative space-y-0">
              {historyItems.map((item, idx) => (
                <div key={item.id} className="flex gap-6">
                  {/* タイムラインライン */}
                  <div className="flex flex-col items-center">
                    <div className="w-3 h-3 rounded-full bg-accent mt-1.5 shrink-0" />
                    {idx !== historyItems.length - 1 && (
                      <div className="w-px flex-1 bg-border mt-2 min-h-[3rem]" />
                    )}
                  </div>

                  {/* コンテンツ */}
                  <div className="pb-10 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="text-sm font-semibold text-accent">
                        {item.date}
                      </span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          CATEGORY_COLORS[item.category] || CATEGORY_COLORS.other
                        }`}
                      >
                        {CATEGORY_LABELS[item.category] || item.category}
                      </span>
                    </div>
                    <h2 className="text-lg font-serif font-bold text-foreground mb-1.5">
                      {item.title}
                    </h2>
                    <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* CTA */}
          <div className="mt-12 p-8 rounded-xl border border-border bg-card text-center shadow-sm">
            <h2 className="text-xl font-serif font-bold mb-3 text-foreground">
              最新作品をチェック
            </h2>
            <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
              これまでの活動の中で生まれた作品たちをご覧ください
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/gallery">
                <Button variant="outline" className="w-full sm:w-auto">
                  ギャラリーへ
                </Button>
              </Link>
              <Link to="/shop">
                <Button className="w-full sm:w-auto">
                  ショップへ
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </Shell>
  );
}
