import { Link } from "react-router-dom";
import Shell from "@/components/Shell";
import { MangaIcon, IllustrationIcon, NovelIcon } from "@/components/CategoryIcons";

// カテゴリカードの定義。将来カテゴリが増えた場合はここに追記するだけでよい。
const categoryCards = [
  {
    key: "manga",
    label: "漫画",
    labelEn: "Manga",
    description: "ストーリー漫画・読み切り作品",
    icon: MangaIcon,
    colorVar: "var(--home-card-manga-bg, oklch(0.96 0.01 30))",
    to: "/gallery?category=manga",
  },
  {
    key: "illustration",
    label: "イラスト",
    labelEn: "Illustration",
    description: "デジタルイラスト・アート作品",
    icon: IllustrationIcon,
    colorVar: "var(--home-card-illust-bg, oklch(0.96 0.01 200))",
    to: "/gallery?category=illustration",
  },
  {
    key: "novel",
    label: "小説",
    labelEn: "Novel",
    description: "短編・長編テキスト作品",
    icon: NovelIcon,
    colorVar: "var(--home-card-novel-bg, oklch(0.96 0.01 120))",
    to: "/gallery?category=novel",
  },
] as const;

export default function Home() {
  return (
    <Shell>
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 hero-bg" aria-hidden="true">
          <div className="absolute inset-0 bg-gradient-to-br from-muted/80 via-background to-background" />
          <div className="absolute -top-20 left-8 h-72 w-72 rounded-full bg-accent/10 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-56 w-56 rounded-full bg-accent/8 blur-3xl" />
        </div>

        {/* 見出しは小さくして、3つの入口が最初の画面に収まるようにする */}
        <div className="container pt-7 md:pt-12 text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
          <h1 className="text-2xl md:text-4xl leading-tight">木陰の作品棚</h1>
          <p className="mt-2 text-sm md:text-base text-muted-foreground">どれから見ますか？</p>
        </div>

        {/* ---- 入口（漫画 / イラスト / 小説）---- */}
        <nav id="categories" className="container pt-6 md:pt-10" aria-label="カテゴリ一覧">
          <ul className="grid grid-cols-3 gap-3 sm:gap-5">
            {categoryCards.map((card) => {
              const Icon = card.icon;
              return (
                <li key={card.key} className="flex">
                  <Link
                    to={card.to}
                    className="group flex w-full flex-col items-center gap-2 sm:gap-4 rounded-2xl border border-border/70 bg-card px-2 py-4 sm:p-8 text-center shadow-sm
                               transition-all duration-300 hover:-translate-y-1.5 hover:shadow-lg hover:border-border
                               focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                    aria-label={`${card.label}の作品を見る`}
                  >
                    {/* 角の丸さを不揃いにして、手で塗ったような下地にする */}
                    <span
                      className="flex h-20 w-20 sm:h-28 sm:w-28 items-center justify-center transition-transform duration-300 group-hover:scale-105 group-hover:-rotate-3"
                      style={{
                        backgroundColor: card.colorVar,
                        borderRadius: "46% 54% 52% 48% / 55% 46% 54% 45%",
                      }}
                      aria-hidden="true"
                    >
                      <Icon className="h-16 w-16 sm:h-24 sm:w-24" />
                    </span>

                    <div className="sm:space-y-1">
                      <p className="hidden sm:block text-xs uppercase tracking-[0.3em] text-muted-foreground">
                        {card.labelEn}
                      </p>
                      <h2 className="text-base sm:text-2xl font-serif font-semibold text-foreground">
                        {card.label}
                      </h2>
                    </div>

                    <p className="hidden sm:block text-sm text-muted-foreground leading-relaxed">
                      {card.description}
                    </p>

                    <span
                      className="hidden sm:inline mt-auto text-xs font-medium text-accent transition-transform duration-300 group-hover:translate-x-1"
                      aria-hidden="true"
                    >
                      見る →
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* 紹介文は入口の下に置く */}
        <div className="container pt-10 pb-20 md:pt-14 md:pb-28 text-center">
          <p className="text-sm md:text-base text-muted-foreground leading-relaxed max-w-xl mx-auto">
            漫画・イラスト・小説。
            <br />
            日常の余白に置きたい作品をまとめた、小さな作品棚です。
          </p>
        </div>
      </section>
    </Shell>
  );
}
