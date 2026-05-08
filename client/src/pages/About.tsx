import { Button } from "@/components/ui/button";
import Shell from "@/components/Shell";
import { Link } from "react-router-dom";
import { trpc } from "@/lib/trpc";

export default function About() {
  const { data: settings } = trpc.siteSettings.get.useQuery(undefined, {
    staleTime: 1000 * 60 * 5,
  });

  const creatorName = settings?.creatorName || "けーざ";
  const bio = settings?.bio ||
    "漫画・イラスト・小説を制作しています。\n日常のすき間に、ふっと覗きたくなるような物語や絵を置いています。\nこのサイト「木陰の部屋」は、作品をまとめて置いておくための小さな作品棚です。\n気になるものがあれば、ゆっくり見ていってください。";
  const profileImageUrl = settings?.profileImageUrl || "";
  const twitterUrl = settings?.twitterUrl || "";
  const pixivUrl = settings?.pixivUrl || "";
  const otherUrl = settings?.otherUrl || "";
  const message = settings?.message || "";
  const skills = settings?.skills || [];

  const hasSnsLinks = twitterUrl || pixivUrl || otherUrl;

  return (
    <Shell>
      {/* ページヘッダー */}
      <section className="py-10 md:py-14 border-b border-border/60">
        <div className="container">
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-2">
            この部屋について
          </h1>
          <p className="text-sm text-muted-foreground">
            {creatorName} / 木陰の部屋
          </p>
        </div>
      </section>

      {/* プロフィール本文 */}
      <section className="py-10 md:py-16">
        <div className="container max-w-3xl">
          <div className="space-y-12">
            {/* プロフィールセクション */}
            <div className="grid md:grid-cols-2 gap-10 items-start">
              <div className="rounded-xl overflow-hidden border border-border shadow-sm">
                {profileImageUrl ? (
                  <img
                    src={profileImageUrl}
                    alt={creatorName}
                    className="aspect-square w-full object-cover"
                  />
                ) : (
                  <div className="aspect-square bg-muted flex items-center justify-center">
                    <p className="text-sm text-muted-foreground">プロフィール画像</p>
                  </div>
                )}
              </div>
              <div className="space-y-4">
                <h2 className="text-2xl font-serif font-bold text-foreground">
                  {creatorName}
                </h2>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-line text-sm md:text-base">
                  {bio}
                </p>

                {hasSnsLinks && (
                  <div className="flex flex-wrap gap-3 pt-1">
                    {twitterUrl && (
                      <a
                        href={twitterUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-muted-foreground hover:text-accent transition-colors underline"
                      >
                        X (Twitter)
                      </a>
                    )}
                    {pixivUrl && (
                      <a
                        href={pixivUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-muted-foreground hover:text-accent transition-colors underline"
                      >
                        Pixiv
                      </a>
                    )}
                    {otherUrl && (
                      <a
                        href={otherUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-muted-foreground hover:text-accent transition-colors underline"
                      >
                        Webサイト
                      </a>
                    )}
                  </div>
                )}

                <div className="flex flex-wrap gap-3 pt-2">
                  <Link to="/gallery">
                    <Button>作品を見る</Button>
                  </Link>
                  <Link to="/shop">
                    <Button variant="outline">ショップへ</Button>
                  </Link>
                </div>
              </div>
            </div>

            {/* 区切り線 */}
            <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />

            {/* 制作ジャンル */}
            {skills.length > 0 && (
              <div>
                <h2 className="text-xl font-serif font-bold mb-6 text-foreground">
                  制作ジャンル
                </h2>
                <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {skills.map((skill) => (
                    <div
                      key={skill.id}
                      className="p-5 rounded-xl border border-border bg-card shadow-sm"
                    >
                      <h3 className="font-serif font-semibold text-foreground mb-1.5 text-sm">
                        {skill.title}
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {skill.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* メッセージ */}
            {message && (
              <>
                <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />
                <div className="bg-muted/40 border border-border rounded-xl p-6">
                  <p className="text-foreground leading-relaxed whitespace-pre-line text-sm md:text-base">
                    {message}
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </section>
    </Shell>
  );
}
