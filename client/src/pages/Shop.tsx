import { Button } from "@/components/ui/button";
import Shell from "@/components/Shell";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Link } from "react-router-dom";

interface Product {
  id: number;
  title: string;
  price: number;
  productType: "digital" | "physical";
  imageUrl?: string;
  description?: string;
  stock?: number;
}

// Mock data for demo
const mockProducts: Product[] = [
  {
    id: 1,
    title: "Moonlight Dreams - Digital Edition",
    price: 1500,
    productType: "digital",
    imageUrl: "https://images.unsplash.com/photo-1579783902614-e3fb5141b0cb?w=400&h=400&fit=crop",
    description: "鬮倩ｧ｣蜒丞ｺｦ繝・ず繧ｿ繝ｫ繧｢繝ｼ繝育ｴ譚舌ヱ繝・け",
  },
  {
    id: 2,
    title: "Urban Tales - Manga Volume 1",
    price: 2800,
    productType: "physical",
    imageUrl: "https://images.unsplash.com/photo-1578926078328-123456789012?w=400&h=400&fit=crop",
    description: "髯仙ｮ夂沿貍ｫ逕ｻ譛ｬ・医し繧､繝ｳ蜈･繧奇ｼ・,
    stock: 5,
  },
  {
    id: 3,
    title: "Whispers of Time - eBook",
    price: 980,
    productType: "digital",
    imageUrl: "https://images.unsplash.com/photo-1507842217343-583f20270319?w=400&h=400&fit=crop",
    description: "螳悟・迚磯崕蟄先嶌邀・,
  },
  {
    id: 4,
    title: "Art Print Collection",
    price: 3500,
    productType: "physical",
    imageUrl: "https://images.unsplash.com/photo-1578926078328-123456789013?w=400&h=400&fit=crop",
    description: "髯仙ｮ夂沿繧｢繝ｼ繝医・繝ｪ繝ｳ繝茨ｼ・譫壹そ繝・ヨ・・,
    stock: 10,
  },
];

export default function Shop() {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const getProductTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      digital: "繝・ず繧ｿ繝ｫ",
      physical: "螳溽黄",
    };
    return labels[type] || type;
  };

  return (
    <Shell>

      {/* Header Section */}
      <section className="py-16 md:py-24 border-b border-border">
        <div className="container text-center">
          <h2 className="text-4xl md:text-5xl font-serif font-bold mb-4 text-foreground">
            繧ｷ繝ｧ繝・・
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            繝・ず繧ｿ繝ｫ繧ｳ繝ｳ繝・Φ繝・°繧牙ｮ溽黄蝠・刀縺ｾ縺ｧ縲∵ｧ倥・↑菴懷刀繧偵＃雉ｼ蜈･縺・◆縺縺代∪縺吶・
          </p>
        </div>
      </section>

      {/* Products Section */}
      <section className="py-16 md:py-24">
        <div className="container">
          {/* Filter Tabs */}
          <div className="flex gap-2 mb-12 flex-wrap">
            <Button variant="outline" className="rounded-full">
              縺吶∋縺ｦ
            </Button>
            <Button variant="outline" className="rounded-full">
              繝・ず繧ｿ繝ｫ
            </Button>
            <Button variant="outline" className="rounded-full">
              螳溽黄
            </Button>
          </div>

          {/* Products Grid */}
          <div className="gallery-grid">
            {mockProducts.map((product) => (
              <div
                key={product.id}
                className="group relative overflow-hidden rounded-lg border border-border bg-card cursor-pointer transition-all duration-300 hover:shadow-lg"
                onClick={() => setSelectedProduct(product)}
                style={{
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
                }}
              >
                <div className="aspect-square w-full object-cover transition-transform duration-300 group-hover:scale-105 bg-muted relative">
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={product.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                      No Image
                    </div>
                  )}
                  {product.productType === "digital" && (
                    <div className="absolute top-2 right-2 bg-accent text-accent-foreground px-2 py-1 rounded text-xs font-semibold">
                      繝・ず繧ｿ繝ｫ
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h4 className="font-serif font-semibold text-foreground mb-2 line-clamp-2">
                    {product.title}
                  </h4>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-accent">
                      ﾂ･{product.price.toLocaleString()}
                    </span>
                    {product.productType === "physical" && product.stock !== undefined && (
                      <span className="text-xs text-muted-foreground">
                        蝨ｨ蠎ｫ: {product.stock}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Product Detail Modal */}
      <Dialog open={!!selectedProduct} onOpenChange={(open) => !open && setSelectedProduct(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl">
              {selectedProduct?.title}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            {selectedProduct?.imageUrl && (
              <img
                src={selectedProduct.imageUrl}
                alt={selectedProduct.title}
                className="w-full rounded-lg object-cover max-h-96"
              />
            )}
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-3xl font-bold text-accent">
                  ﾂ･{selectedProduct?.price.toLocaleString()}
                </span>
                <span className="text-sm bg-muted text-muted-foreground px-3 py-1 rounded">
                  {getProductTypeLabel(selectedProduct?.productType || "")}
                </span>
              </div>
              {selectedProduct?.productType === "physical" && selectedProduct?.stock !== undefined && (
                <p className="text-sm text-muted-foreground mb-4">
                  蝨ｨ蠎ｫ: {selectedProduct.stock}蛟・
                </p>
              )}
              <p className="text-foreground leading-relaxed">
                {selectedProduct?.description}
              </p>
            </div>
            <div className="flex gap-3 pt-4 border-t border-border">
              <Button className="flex-1" variant="default">
                繧ｫ繝ｼ繝医↓霑ｽ蜉
              </Button>
              <Button className="flex-1" variant="outline">
                髢峨§繧・
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Shell>
  );
}








