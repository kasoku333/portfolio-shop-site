import { Link } from "react-router-dom";
import ProductCard from "@/components/ProductCard";
import Shell from "@/components/Shell";
import { products } from "@/data/products";
import { ArrowRight, Sparkles } from "lucide-react";

export default function Home() {
  const featured = products.slice(0, 6);

  return (
    <Shell>
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute -top-24 left-10 h-64 w-64 rounded-full bg-amber-200/40 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-rose-200/40 blur-3xl" />
          <div className="absolute inset-0 bg-gradient-to-b from-muted/60 via-background to-background" />
        </div>

        <div className="container grid gap-10 py-16 md:grid-cols-[1.1fr_0.9fr] md:py-24">
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-700">
            <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/80 px-4 py-1 text-xs uppercase tracking-[0.3em] text-muted-foreground">
              <Sparkles className="h-3 w-3 text-accent" />
              New Collection
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl leading-tight">
              物語を飾るための
              <br />
              小さな作品棚
            </h1>
            <p className="text-base md:text-lg text-muted-foreground leading-relaxed max-w-xl">
              イラスト、短編、プリントなど、日常の余白に置きたい作品を丁寧にまとめています。
              今日の気分に寄り添う一冊を見つけてください。
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/shop"
                className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-medium text-accent-foreground shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
              >
                ショップへ
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/gallery"
                className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-background px-6 py-3 text-sm font-medium text-foreground shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
              >
                ギャラリーを見る
              </Link>
            </div>
          </div>

          <div className="relative animate-in fade-in slide-in-from-bottom-6 duration-700 delay-150">
            <div className="absolute -right-6 top-8 h-24 w-24 rounded-3xl bg-accent/10 blur-xl" />
            <div className="grid gap-4">
              <div className="rounded-[32px] border border-border/60 bg-card p-6 shadow-sm">
                <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                  Highlight
                </p>
                <p className="mt-3 text-lg font-semibold">
                  「Aurora Print」先行予約スタート
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  2日間限定でエディション番号入り。
                </p>
              </div>
              <div className="rounded-[32px] border border-border/60 bg-card p-6 shadow-sm">
                <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                  Studio Note
                </p>
                <p className="mt-3 text-lg font-semibold">
                  作品の裏側を毎週お届け
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  制作過程や素材選びを記録したメモを公開中。
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container pb-20 pt-10">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
              Popular Picks
            </p>
            <h2 className="text-3xl md:text-4xl">人気のプロダクト</h2>
          </div>
          <Link
            to="/shop"
            className="text-sm font-medium text-accent hover:text-accent/80"
          >
            すべて見る →
          </Link>
        </div>

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </Shell>
  );
}
