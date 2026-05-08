import { Button } from "@/components/ui/button";
import Shell from "@/components/Shell";
import { Link } from "react-router-dom";
import { trpc } from "@/lib/trpc";

const DEFAULT_BIO = `漫画・イラスト・小説を制作しています。
人外、異世界、ファンタジー、少し甘くて少し不穏な関係性が好きです。

日常のすき間に、ふっと覗きたくなるような物語や絵を置いています。
このサイト「木陰の部屋」は、作品をまとめて置いておくための小さな作品棚です。
気になるものがあれば、ゆっくり見ていってください。`;

export default function About() {
  const { data: settings } = trpc.siteSettings.get.useQuery(undefined, {
    staleTime: 1000 * 60 * 5,
  });

  const creatorName = settings?.creatorName || "けーざ";
  const bio = settings?.bio || DEFAULT_BIO;
  const profileImageUrl = settings?.profileImageUrl || "";
  const twitterUrl = settings?.twitterUrl || "";
  const pixivUrl = settings?.pixivUrl || "";
  const otherUrl = settings?.otherUrl || "";
  const message = settings?.message || "";
  const skills = settings?.skills || [];

  const hasSnsLinks = twitterUrl || pixivUrl || otherUrl;

  return (
    <Shell>
      {/* Header Section */}
      <section className="py-14 md:py-20 border-b border-border/60 bg-muted/40">
        <div className="container text-center space-y-3">
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">About</p>
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground">
            この部屋について
          </h2>
          <p className="text-sm md:text-base text-muted-foreground">
            木陰の部屋と、つくっている人について。
          </p>
        </div>
      </section>

      {/* About Content */}
      <section className="py-12 md:py-20">
        <div className="container max-w-3xl">
          <div className="space-y-12">
            {/* Profile Section（スマホでは縦並び、PCでは横並び） */}
            <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
              <div
                className="rounded-lg overflow-hidden border border-border"
                style={{ boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)" }}
              >
                {profileImageUrl ? (
                  <img
                    src={profileImageUrl}
                    alt={creatorName}
                    className="aspect-square w-full object-cover"
                  />
                ) : (
                  <div className="aspect-square bg-muted flex items-center justify-center">
                    <div className="text-center text-muted-foreground">
                      <p className="text-sm">プロフィール画像</p>
                    </div>
                  </div>
                )}
              </div>
              <div className="space-y-4">
                <h3 className="text-2xl md:text-3xl font-serif font-bold text-foreground">
                  {creatorName}
                </h3>
                <p className="text-foreground/90 leading-relaxed whitespace-pre-line">{bio}</p>

                {hasSnsLinks && (
                  <div className="flex flex-wrap gap-x-4 gap-y-2 pt-1">
                    {twitterUrl && (
                      <a
                        href={twitterUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-muted-foreground hover:text-accent transition-colors underline underline-offset-4"
                      >
                        X (Twitter)
                      </a>
                    )}
                    {pixivUrl && (
                      <a
                        href={pixivUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-muted-foreground hover:text-accent transition-colors underline underline-offset-4"
                      >
                        Pixiv
                      </a>
                    )}
                    {otherUrl && (
                      <a
                        href={otherUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-muted-foreground hover:text-accent transition-colors underline underline-offset-4"
                      >
                        Webサイト
                      </a>
                    )}
                  </div>
                )}

                <div className="pt-2 flex flex-wrap gap-3">
                  <Link to="/gallery">
                    <Button variant="outline">ギャラリーへ</Button>
                  </Link>
                  <Link to="/shop">
                    <Button>ショップへ</Button>
                  </Link>
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent"></div>

            {/* Skills Section */}
            {skills.length > 0 && (
              <div>
                <h3 className="text-xl md:text-2xl font-serif font-bold mb-6 md:mb-8 text-foreground">
                  制作しているもの
                </h3>
                <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                  {skills.map((skill) => (
                    <div
                      key={skill.id}
                      className="p-5 md:p-6 rounded-lg border border-border bg-card transition-all duration-300 hover:shadow-lg"
                      style={{ boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)" }}
                    >
                      <h4 className="font-serif font-semibold text-foreground mb-2">
                        {skill.title}
                      </h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {skill.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Divider */}
            {message && (
              <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent"></div>
            )}

            {/* Message Section */}
            {message && (
              <div
                className="bg-card border border-border rounded-lg p-6 md:p-8"
                style={{ boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)" }}
              >
                <h3 className="text-xl md:text-2xl font-serif font-bold mb-3 md:mb-4 text-foreground">
                  ひとこと
                </h3>
                <p className="text-foreground/90 leading-relaxed whitespace-pre-line">{message}</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </Shell>
  );
}
