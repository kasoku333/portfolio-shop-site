import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { trpc } from "@/lib/trpc";
import Shell from "@/components/Shell";

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
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // Fetch artworks from database
  const { data: dbArtworks = [], isLoading } = trpc.artworks.list.useQuery({
    category: selectedCategory as any,
  });

  // Combine database artworks with mock data (fallback)
  const artworks = dbArtworks.length > 0 ? dbArtworks : mockArtworks;

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      illustration: "繧､繝ｩ繧ｹ繝・,
      manga: "貍ｫ逕ｻ",
      novel: "蟆剰ｪｬ",
    };
    return labels[category] || category;
  };

  return (
    <Shell>

      {/* Hero Section */}
      <section className="py-16 md:py-24 text-center bg-muted/50">
        <div className="container space-y-4">
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-foreground">
            繧ｮ繝｣繝ｩ繝ｪ繝ｼ縺ｸ繧医≧縺薙◎・・
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            繧､繝ｩ繧ｹ繝医∵ｼｫ逕ｻ縲∝ｰ剰ｪｬ縺ｮ菴懷刀繧貞ｱ慕､ｺ繝ｻ雋ｩ螢ｲ縺励※縺・∪縺吶・
            <br />
            繝・ず繧ｿ繝ｫ繧ｳ繝ｳ繝・Φ繝・°繧牙ｮ溽黄蝠・刀縺ｾ縺ｧ縲∵ｧ倥・↑菴懷刀繧偵♀讌ｽ縺励∩縺上□縺輔＞縲・
          </p>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="py-16 md:py-24">
        <div className="container space-y-8">
          <h3 className="text-3xl font-serif font-bold text-foreground">繧ｮ繝｣繝ｩ繝ｪ繝ｼ</h3>

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
                {cat === "all" ? "縺吶∋縺ｦ" : getCategoryLabel(cat)}
              </button>
            ))}
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">隱ｭ縺ｿ霎ｼ縺ｿ荳ｭ...</p>
            </div>
          )}

          {/* Artworks Grid */}
          {!isLoading && (
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
          {!isLoading && artworks.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">菴懷刀縺後∪縺繧｢繝・・繝ｭ繝ｼ繝峨＆繧後※縺・∪縺帙ｓ</p>
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
                  <Button className="flex-1 bg-accent text-accent-foreground hover:bg-accent/90">
                    髢｢騾｣蝠・刀繧定ｦ九ｋ
                  </Button>
                  <Button variant="outline" className="flex-1">
                    繧ｫ繝ｼ繝医↓霑ｽ蜉
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





