import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Menu, X, ShoppingCart } from "lucide-react";
import { useState } from "react";

interface HistoryItem {
  date: string;
  title: string;
  description: string;
  category: "exhibition" | "publication" | "award" | "other";
}

const historyItems: HistoryItem[] = [
  {
    date: "2024年1月",
    title: "デジタルアート展示会 開催",
    description: "オンラインギャラリーで新作イラスト30点を展示。多くのファンからの好評を得ました。",
    category: "exhibition",
  },
  {
    date: "2023年11月",
    title: "漫画作品『Urban Tales』出版",
    description: "初の商業漫画作品を出版。限定版はすぐに完売となりました。",
    category: "publication",
  },
  {
    date: "2023年9月",
    title: "クリエイティブアワード受賞",
    description: "デジタルアート部門で新人賞を受賞。これまでの活動が認められました。",
    category: "award",
  },
  {
    date: "2023年7月",
    title: "小説『Whispers of Time』完成",
    description: "長編小説の執筆を完了。電子書籍として配信開始。",
    category: "publication",
  },
  {
    date: "2023年5月",
    title: "SNS フォロワー10万人達成",
    description: "ソーシャルメディアでの活動が評価され、フォロワー数が10万人を超えました。",
    category: "other",
  },
  {
    date: "2023年3月",
    title: "ポートフォリオサイト開設",
    description: "作品を展示・販売するためのオンラインストアをオープン。",
    category: "other",
  },
];

export default function History() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-border bg-card" style={{boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)'}}>
        <div className="container flex items-center justify-between py-4">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-serif font-bold text-accent">My Room</h1>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="/" className="text-foreground hover:text-accent transition-colors">
              ギャラリー
            </Link>
            <Link href="/shop" className="text-foreground hover:text-accent transition-colors">
              ショップ
            </Link>
            <Link href="/about" className="text-foreground hover:text-accent transition-colors">
              自己紹介
            </Link>
            <Link href="/history" className="text-foreground hover:text-accent transition-colors font-semibold">
              活動履歴
            </Link>
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <ShoppingCart className="w-4 h-4" />
              カート
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border bg-card p-4 space-y-3">
            <Link href="/" className="block text-foreground hover:text-accent transition-colors">
              ギャラリー
            </Link>
            <Link href="/shop" className="block text-foreground hover:text-accent transition-colors">
              ショップ
            </Link>
            <Link href="/about" className="block text-foreground hover:text-accent transition-colors">
              自己紹介
            </Link>
            <Link href="/history" className="block text-foreground hover:text-accent transition-colors font-semibold">
              活動履歴
            </Link>
            <Button variant="outline" className="w-full flex items-center justify-center gap-2">
              <ShoppingCart className="w-4 h-4" />
              カート
            </Button>
          </div>
        )}
      </nav>

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
          <div className="space-y-8">
            {historyItems.map((item, idx) => (
              <div key={idx} className="flex gap-6">
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

          {/* Call to Action */}
          <div className="mt-16 p-8 rounded-lg border border-border bg-card text-center" style={{boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)'}}>
            <h3 className="text-2xl font-serif font-bold mb-4 text-foreground">
              最新作品をチェック
            </h3>
            <p className="text-muted-foreground mb-6">
              これまでの活動の中で生まれた作品たちをご覧ください
            </p>
            <Link href="/shop">
              <Button className="w-full md:w-auto">
                ショップへ
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-12">
        <div className="container text-center text-muted-foreground">
          <p>&copy; 2024 My Room Portfolio. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
