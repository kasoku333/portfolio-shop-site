import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Link } from "wouter";
import { ShoppingCart, Menu, X } from "lucide-react";

interface Artwork {
  id: number;
  title: string;
  category: "illustration" | "manga" | "novel";
  imageUrl?: string;
  description?: string;
}

// Mock data for demo
const mockArtworks: Artwork[] = [
  {
    id: 1,
    title: "Moonlight Dreams",
    category: "illustration",
    imageUrl: "https://images.unsplash.com/photo-1579783902614-e3fb5141b0cb?w=400&h=400&fit=crop",
    description: "A serene illustration capturing the essence of a peaceful night.",
  },
  {
    id: 2,
    title: "Urban Tales",
    category: "manga",
    imageUrl: "https://images.unsplash.com/photo-1578926078328-123456789012?w=400&h=400&fit=crop",
    description: "A manga series exploring modern city life and human connections.",
  },
  {
    id: 3,
    title: "Whispers of Time",
    category: "novel",
    imageUrl: "https://images.unsplash.com/photo-1507842217343-583f20270319?w=400&h=400&fit=crop",
    description: "A novel about love, loss, and the passage of time.",
  },
  {
    id: 4,
    title: "Ethereal Visions",
    category: "illustration",
    imageUrl: "https://images.unsplash.com/photo-1578926078328-123456789013?w=400&h=400&fit=crop",
    description: "Digital art exploring abstract concepts and emotions.",
  },
];

export default function Gallery() {
  const [selectedArtwork, setSelectedArtwork] = useState<Artwork | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      illustration: "イラスト",
      manga: "漫画",
      novel: "小説",
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
            <Link href="/history" className="text-foreground hover:text-accent transition-colors">
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
            <Link href="/history" className="block text-foreground hover:text-accent transition-colors">
              活動履歴
            </Link>
            <Button variant="outline" className="w-full flex items-center justify-center gap-2">
              <ShoppingCart className="w-4 h-4" />
              カート
            </Button>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="py-16 md:py-24 border-b border-border">
        <div className="container text-center">
          <h2 className="text-4xl md:text-5xl font-serif font-bold mb-4 text-foreground">
            Welcome to My Creative Space
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            イラスト、漫画、小説の作品を展示・販売しています。<br />
            デジタルコンテンツから実物商品まで、様々な作品をお楽しみください。
          </p>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="py-16 md:py-24">
        <div className="container">
          <h3 className="text-3xl font-serif font-bold mb-12 text-foreground">
            ギャラリー
          </h3>

          {/* Filter Tabs */}
          <div className="flex gap-2 mb-12 flex-wrap">
            <Button variant="outline" className="rounded-full">
              すべて
            </Button>
            <Button variant="outline" className="rounded-full">
              イラスト
            </Button>
            <Button variant="outline" className="rounded-full">
              漫画
            </Button>
            <Button variant="outline" className="rounded-full">
              小説
            </Button>
          </div>

          {/* Gallery Grid */}
          <div className="gallery-grid">
            {mockArtworks.map((artwork) => (
              <div
                key={artwork.id}
                className="group relative overflow-hidden rounded-lg border border-border bg-card cursor-pointer transition-all duration-300 hover:shadow-lg"
                onClick={() => setSelectedArtwork(artwork)}
                style={{
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
                }}
              >
                <div className="aspect-square w-full object-cover transition-transform duration-300 group-hover:scale-105 bg-muted">
                  {artwork.imageUrl ? (
                    <img
                      src={artwork.imageUrl}
                      alt={artwork.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                      No Image
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-serif font-semibold text-foreground truncate">
                      {artwork.title}
                    </h4>
                    <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded">
                      {getCategoryLabel(artwork.category)}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {artwork.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Artwork Detail Modal */}
      <Dialog open={!!selectedArtwork} onOpenChange={(open) => !open && setSelectedArtwork(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl">
              {selectedArtwork?.title}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            {selectedArtwork?.imageUrl && (
              <img
                src={selectedArtwork.imageUrl}
                alt={selectedArtwork.title}
                className="w-full rounded-lg object-cover max-h-96"
              />
            )}
            <div>
              <p className="text-sm text-muted-foreground mb-2">
                カテゴリ: {getCategoryLabel(selectedArtwork?.category || "")}
              </p>
              <p className="text-foreground leading-relaxed">
                {selectedArtwork?.description}
              </p>
            </div>
            <div className="flex gap-3 pt-4 border-t border-border">
              <Button className="flex-1" variant="default">
                関連商品を見る
              </Button>
              <Button className="flex-1" variant="outline">
                閉じる
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-12">
        <div className="container text-center text-muted-foreground">
          <p>&copy; 2024 My Room Portfolio. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
