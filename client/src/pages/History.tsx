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

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      exhibition: "bg-blue-100 text-blue-800",
      publication: "bg-purple-100 text-purple-800",
      award: "bg-amber-100 text-amber-800",
      other: "bg-gray-100 text-gray-800",
    };
    return colors[category] || colors.other;
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      exhibition: "展示会",
      publication: "出版",
      award: "受賞",
      other: "その他",
    };
    return labels[category] || category;
  };

  return (
    <Shell>

      {/* Header Section */}
      <section className="py-16 md:py-24 border-b border-border">
        <div className="container text-center">
          <h2 className="text-4xl md:text-5xl font-serif font-bold mb-4 text-foreground">
            活動履歴
          </h2>
          <p className="text-lg text-muted-foreground">
            これまでの創作活動と主な実績をご紹介します
          </p>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-16 md:py-24">
        <div className="container max-w-3xl">
          {historyItems.length === 0 ? (
            <p className="text-center text-muted-foreground py-12">
              活動履歴はまだありません。
            </p>
          ) : (
            <div className="space-y-8">
              {historyItems.map((item, idx) => (
                <div key={item.id} className="flex gap-6">
                  {/* Timeline dot */}
                  <div className="flex flex-col items-center">
                    <div className="w-4 h-4 rounded-full bg-accent mt-2"></div>
                    {idx !== historyItems.length - 1 && (
                      <div className="w-1 h-24 bg-border mt-2"></div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="pb-8 flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-sm font-semibold text-accent">
                        {item.date}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded font-medium ${getCategoryColor(item.category)}`}>
                        {getCategoryLabel(item.category)}
                      </span>
                    </div>
                    <h3 className="text-xl font-serif font-bold text-foreground mb-2">
                      {item.title}
                    </h3>
                    <p className="text-foreground leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Call to Action */}
          <div className="mt-16 p-8 rounded-lg border border-border bg-card text-center" style={{boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)'}}>
            <h3 className="text-2xl font-serif font-bold mb-4 text-foreground">
              最新作品をチェック
            </h3>
            <p className="text-muted-foreground mb-6">
              これまでの活動の中で生まれた作品たちをご覧ください
            </p>
            <Link to="/shop">
              <Button className="w-full md:w-auto">
                ショップへ
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </Shell>
  );
}
