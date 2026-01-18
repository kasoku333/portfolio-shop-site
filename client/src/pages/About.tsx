import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Menu, X, ShoppingCart } from "lucide-react";
import { useState } from "react";

export default function About() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
            <Link to="/" className="text-foreground hover:text-accent transition-colors">
              ギャラリー
            </Link>
            <Link to="/shop" className="text-foreground hover:text-accent transition-colors">
              ショップ
            </Link>
            <Link to="/about" className="text-foreground hover:text-accent transition-colors font-semibold">
              自己紹介
            </Link>
            <Link to="/history" className="text-foreground hover:text-accent transition-colors">
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
            <Link to="/" className="block text-foreground hover:text-accent transition-colors">
              ギャラリー
            </Link>
            <Link to="/shop" className="block text-foreground hover:text-accent transition-colors">
              ショップ
            </Link>
            <Link to="/about" className="block text-foreground hover:text-accent transition-colors font-semibold">
              自己紹介
            </Link>
            <Link to="/history" className="block text-foreground hover:text-accent transition-colors">
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
            自己紹介
          </h2>
          <p className="text-lg text-muted-foreground">
            クリエイターとしての私についてご紹介します
          </p>
        </div>
      </section>

      {/* About Content */}
      <section className="py-16 md:py-24">
        <div className="container max-w-3xl">
          <div className="space-y-12">
            {/* Profile Section */}
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="rounded-lg overflow-hidden border border-border" style={{boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)'}}>
                <div className="aspect-square bg-muted flex items-center justify-center">
                  <div className="text-center text-muted-foreground">
                    <p className="text-lg">プロフィール画像</p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <h3 className="text-3xl font-serif font-bold text-foreground">
                  クリエイター名
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  イラスト、漫画、小説を制作するクリエイターです。
                  日々の創作活動を通じて、様々な作品を世界に発信しています。
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  デジタルアートから実物商品まで、多岐にわたる作品制作に取り組んでいます。
                  皆様の支援が、私の創作活動の原動力となっています。
                </p>
                <div className="pt-4">
                  <Link to="/shop">
                    <Button className="w-full md:w-auto">
                      作品を見る
                    </Button>
                  </Link>
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent"></div>

            {/* Skills Section */}
            <div>
              <h3 className="text-2xl font-serif font-bold mb-8 text-foreground">
                スキル・得意分野
              </h3>
              <div className="grid md:grid-cols-3 gap-6">
                {[
                  { title: "デジタルイラスト", description: "高解像度のデジタルアート制作" },
                  { title: "漫画制作", description: "ストーリー性のある漫画作品" },
                  { title: "小説執筆", description: "感情豊かな小説・エッセイ" },
                ].map((skill, idx) => (
                  <div
                    key={idx}
                    className="p-6 rounded-lg border border-border bg-card transition-all duration-300 hover:shadow-lg"
                    style={{boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)'}}
                  >
                    <h4 className="font-serif font-semibold text-foreground mb-2">
                      {skill.title}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {skill.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Divider */}
            <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent"></div>

            {/* Message Section */}
            <div className="bg-card border border-border rounded-lg p-8" style={{boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)'}}>
              <h3 className="text-2xl font-serif font-bold mb-4 text-foreground">
                メッセージ
              </h3>
              <p className="text-foreground leading-relaxed mb-4">
                このサイトは、私の創作活動の集大成です。
                ここで皆様と作品を通じてつながり、
                一緒に創造の喜びを分かち合いたいと思っています。
              </p>
              <p className="text-foreground leading-relaxed">
                皆様のご支援とご感想が、私の創作活動の源となります。
                ぜひ、作品をご覧いただき、ご感想をお聞かせください。
              </p>
            </div>
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
