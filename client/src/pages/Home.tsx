import { Link } from "react-router-dom";
import Shell from "@/components/Shell";
import { BookOpen, Image, ScrollText } from "lucide-react";
import { trpc } from "@/lib/trpc";

// カテゴリカードの定義。将来カテゴリが増えた場合はここに追記するだけでよい。
const categoryCards = [
  {
    key: "manga",
    label: "漫画",
    labelEn: "Manga",
    description: "ストーリー漫画・読み切り作品",
    icon: BookOpen,
    // カード個別の背景色をCSS変数で管理。後からindex.cssで上書き可能。
    colorVar: "var(--home-card-manga-bg, oklch(0.96 0.01 30))",
    iconColorVar: "var(--home-card-manga-icon, oklch(0.45 0.18 30))",
    to: "/gallery?category=manga",
  },
  {
    key: "illustration",
    label: "イラスト",
    labelEn: "Illustration",
    description: "デジタルイラスト・アート作品",
    icon: Image,
    colorVar: "var(--home-card-illust-bg, oklch(0.96 0.01 200))",
    iconColorVar: "var(--home-card-illust-icon, oklch(0.45 0.12 200))",
    to: "/gallery?category=illustration",
  },
  {
    key: "novel",
    label: "小説",
    labelEn: "Novel",
    description: "短編・長編テキスト作品",
    icon: ScrollText,
    colorVar: "var(--home-card-novel-bg, oklch(0.96 0.01 120))",
    iconColorVar: "var(--home-card-novel-icon, oklch(0.4 0.1 140))",
    to: "/gallery?category=novel",
  },
] as const;

export default function Home() {
  const { data: settings } = trpc.siteSettings.get.useQuery();
  const heroImageUrl = settings?.heroImageUrl || "";

  return (
    <Shell>
      {/* ---- ヒーローセクション ---- */}
      <section className="relative overflow-hidden">
        {/* 背景：管理画面で画像が設定されていれば画像、無ければ装飾グラデーション */}
        <div className="absolute inset-0 -z-10 hero-bg" aria-hidden="true">
          {heroImageUrl ? (
            <>
              <img
                src={heroImageUrl}
                alt=""
                className="absolute inset-0 h-full w-full object-cover"
              />
              {/* テキスト可読性のためのオーバーレイ */}
              <div className="absolute inset-0 bg-background/60" />
            </>
          ) : (
            <>
              <div className="absolute inset-0 bg-gradient-to-br from-muted/80 via-background to-background" />
              <div className="absolute -top-20 left-8 h-72 w-72 rounded-full bg-accent/10 blur-3xl" />
              <div className="absolute bottom-0 right-0 h-56 w-56 rounded-full bg-accent/8 blur-3xl" />
            </>
          )}
        </div>

        <div className="container py-20 md:py-32 text-center animate-in fade-in slide-in-from-bottom-6 duration-700">
          {/* ブランドロゴ相当の表示 */}
          <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground mb-4">
            Portfolio &amp; Shop
          </p>
          <h1 className="text-5xl md:text-6xl lg:text-7xl leading-tight mb-6">
            Atelier Shelf
          </h1>
          <p className="text-base md:text-lg text-muted-foreground leading-relaxed max-w-xl mx-auto">
            漫画・イラスト・小説。<br />
            日常の余白に置きたい作品をまとめた、小さな作品棚です。
          </p>
        </div>
      </section>

      {/* ---- カテゴリカードセクション ---- */}
      <section className="container pb-24 pt-4" aria-label="カテゴリ一覧">
        <div className="grid gap-5 sm:grid-cols-3">
          {categoryCards.map((card) => {
            const Icon = card.icon;
            return (
              <Link
                key={card.key}
                to={card.to}
                className="group relative flex flex-col items-center gap-5 rounded-2xl border border-border/70 bg-card p-8 text-center shadow-sm
                           transition-all duration-300 hover:-translate-y-1.5 hover:shadow-lg hover:border-border
                           focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                aria-label={`${card.label}の作品を見る`}
              >
                {/* アイコン背景サークル */}
                <span
                  className="flex h-16 w-16 items-center justify-center rounded-2xl transition-transform duration-300 group-hover:scale-110"
                  style={{ backgroundColor: card.colorVar }}
                  aria-hidden="true"
                >
                  <Icon
                    className="h-7 w-7"
                    style={{ color: card.iconColorVar }}
                    strokeWidth={1.5}
                  />
                </span>

                {/* カテゴリ名 */}
                <div className="space-y-1">
                  <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                    {card.labelEn}
                  </p>
                  <h2 className="text-2xl font-serif font-semibold text-foreground">
                    {card.label}
                  </h2>
                </div>

                {/* 説明文 */}
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {card.description}
                </p>

                {/* 矢印（ホバーで右にスライド） */}
                <span
                  className="mt-auto text-xs font-medium text-accent transition-transform duration-300 group-hover:translate-x-1"
                  aria-hidden="true"
                >
                  見る →
                </span>
              </Link>
            );
          })}
        </div>
      </section>
    </Shell>
  );
}
