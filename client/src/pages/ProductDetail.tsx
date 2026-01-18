import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { products } from "@/data/products";
import Shell from "@/components/Shell";
import { Button } from "@/components/ui/button";
import { Minus, Plus, Star } from "lucide-react";
import NotFound from "@/pages/NotFound";

export default function ProductDetail() {
  const { id } = useParams();
  const product = useMemo(() => products.find((item) => item.id === id), [id]);
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

  if (!product) {
    return <NotFound />;
  }

  return (
    <Shell>
      <section className="relative overflow-hidden pb-16 pt-12">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-rose-50 via-white to-amber-50" />
        <div className="container grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-4">
            <div className="overflow-hidden rounded-[36px] border border-border/70 bg-card shadow-sm">
              <img
                src={product.images[activeImage]}
                alt={product.name}
                className="h-[420px] w-full object-cover"
              />
            </div>
            <div className="grid grid-cols-3 gap-3">
              {product.images.map((src, index) => (
                <button
                  key={src}
                  onClick={() => setActiveImage(index)}
                  className={`overflow-hidden rounded-2xl border transition ${
                    index === activeImage
                      ? "border-accent/70 ring-2 ring-accent/40"
                      : "border-border/60 hover:border-accent/50"
                  }`}
                >
                  <img src={src} alt="" className="h-24 w-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {product.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-border/60 bg-background px-3 py-1 text-xs text-muted-foreground"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <h1 className="text-3xl md:text-4xl">{product.name}</h1>
              <p className="text-lg text-muted-foreground">
                {product.shortDescription}
              </p>
              <div className="flex items-center gap-2 text-2xl font-semibold">
                ¥{product.price.toLocaleString()}
                <span className="text-xs text-muted-foreground">税込</span>
              </div>
            </div>

            <div className="rounded-3xl border border-border/70 bg-card p-6 shadow-sm">
              <p className="text-sm text-muted-foreground mb-3">数量</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 rounded-full border border-border/70 bg-background px-4 py-2">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-1 text-muted-foreground hover:text-foreground"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="min-w-[24px] text-center text-sm font-medium">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-1 text-muted-foreground hover:text-foreground"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                <Button
                  size="lg"
                  className="rounded-full px-8 shadow-sm"
                  onClick={() => {
                    window.alert("カートに追加しました");
                  }}
                >
                  カートに入れる
                </Button>
              </div>
            </div>

            <div className="rounded-3xl border border-border/70 bg-card p-6 shadow-sm">
              <h2 className="text-lg font-semibold mb-3">作品について</h2>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {product.description}
              </p>
            </div>

            <div className="rounded-3xl border border-border/70 bg-card p-6 shadow-sm">
              <h2 className="text-lg font-semibold mb-4">スペック</h2>
              <dl className="space-y-3 text-sm">
                {product.specs.map((spec) => (
                  <div key={spec.label} className="flex justify-between gap-4">
                    <dt className="text-muted-foreground">{spec.label}</dt>
                    <dd className="font-medium text-foreground">{spec.value}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="rounded-3xl border border-border/70 bg-card p-6 shadow-sm">
              <h2 className="text-lg font-semibold mb-3">レビュー</h2>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="flex text-amber-500">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Star key={index} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <span>4.9 (128)</span>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">
                レビュー機能は準備中です。公開までしばらくお待ちください。
              </p>
            </div>
          </div>
        </div>
      </section>
    </Shell>
  );
}
