import { Button } from "@/components/ui/button";
import Shell from "@/components/Shell";
import { Link } from "react-router-dom";
import { trpc } from "@/lib/trpc";

export default function History() {
  const { data: settings } = trpc.siteSettings.get.useQuery(undefined, {
    staleTime: 1000 * 60 * 5,
  });

  const historyItems = (settings?.historyItems || [])
    .filter((item) => item.isPublished)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  // 既存のカテゴリ enum はそのままに、ラベルだけ「制作記録」らしい柔らかい表現に揃える。
  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      exhibition: "bg-blue-50 text-blue-800 border border-blue-100",
      publication: "bg-purple-50 text-purple-800 border border-purple-100",
      award: "bg-amber-50 text-amber-800 border border-amber-100",
      other: "bg-muted text-muted-foreground border border-border",
    };
    return colors[category] || colors.other;
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      exhibition: "展示",
      publication: "刊行",
      award: "受賞",
      other: "記録",
    };
    return labels[category] || category;
  };

  return (
    <Shell>
      {/* Header Section */}
      <section className="py-14 md:py-20 border-b border-border/60 bg-muted/40">
        <div className="container text-center space-y-3">
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">History</p>
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground">
            制作の歩み
          </h2>
          <p className="text-sm md:text-base text-muted-foreground max-w-xl mx-auto leading-relaxed">
            これまでに残してきた、制作とサイトの記録です。
          </p>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-12 md:py-20">
        <div className="container max-w-3xl">
          {historyItems.length === 0 ? (
            <div className="text-center py-16 space-y-2">
              <p className="text-muted-foreground">記録はまだありません。</p>
              <p className="text-xs text-muted-foreground/80">
                これから少しずつ、ここに足跡を置いていきます。
              </p>
            </div>
          ) : (
            <div className="space-y-0">
              {historyItems.map((item, idx) => (
                <div key={item.id} className="flex gap-4 sm:gap-6">
                  {/* Timeline rail */}
                  <div className="flex flex-col items-center pt-2">
                    <div className="w-3 h-3 rounded-full bg-accent" />
                    {idx !== historyItems.length - 1 && (
                      <div className="w-px flex-1 bg-border mt-1" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="pb-8 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="text-sm font-semibold text-accent">{item.date}</span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded font-medium ${getCategoryColor(item.category)}`}
                      >
                        {getCategoryLabel(item.category)}
                      </span>
                    </div>
                    <h3 className="text-lg md:text-xl font-serif font-bold text-foreground mb-2">
                      {item.title}
                    </h3>
                    {item.description && (
                      <p className="text-sm md:text-base text-foreground/90 leading-relaxed whitespace-pre-line">
                        {item.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Call to Action */}
          <div
            className="mt-12 md:mt-16 p-6 md:p-8 rounded-lg border border-border bg-card text-center"
            style={{ boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)" }}
          >
            <h3 className="text-xl md:text-2xl font-serif font-bold mb-3 md:mb-4 text-foreground">
              最新作品をチェック
            </h3>
            <p className="text-sm md:text-base text-muted-foreground mb-6">
              これまでの活動の中で生まれた作品たちをご覧ください。
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/gallery" className="sm:w-auto">
                <Button variant="outline" className="w-full sm:w-auto">
                  ギャラリーへ
                </Button>
              </Link>
              <Link to="/shop" className="sm:w-auto">
                <Button className="w-full sm:w-auto">ショップへ</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </Shell>
  );
}
