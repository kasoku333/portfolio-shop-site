import { Button } from "@/components/ui/button";
import Shell from "@/components/Shell";
import { Link } from "react-router-dom";
import { trpc } from "@/lib/trpc";

export default function About() {
  const { data: settings } = trpc.siteSettings.get.useQuery(undefined, {
    staleTime: 1000 * 60 * 5,
  });

  const creatorName = settings?.creatorName || "クリエイター名";
  const bio = settings?.bio || "イラスト、漫画、小説を制作するクリエイターです。";
  const profileImageUrl = settings?.profileImageUrl || "";
  const twitterUrl = settings?.twitterUrl || "";
  const pixivUrl = settings?.pixivUrl || "";
  const otherUrl = settings?.otherUrl || "";

  const hasSnsLinks = twitterUrl || pixivUrl || otherUrl;

  return (
    <Shell>

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
                {profileImageUrl ? (
                  <img
                    src={profileImageUrl}
                    alt={creatorName}
                    className="aspect-square w-full object-cover"
                  />
                ) : (
                  <div className="aspect-square bg-muted flex items-center justify-center">
                    <div className="text-center text-muted-foreground">
                      <p className="text-lg">プロフィール画像</p>
                    </div>
                  </div>
                )}
              </div>
              <div className="space-y-4">
                <h3 className="text-3xl font-serif font-bold text-foreground">
                  {creatorName}
                </h3>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                  {bio}
                </p>

                {hasSnsLinks && (
                  <div className="flex gap-3 pt-2">
                    {twitterUrl && (
                      <a href={twitterUrl} target="_blank" rel="noopener noreferrer"
                        className="text-sm text-muted-foreground hover:text-accent transition-colors underline">
                        X (Twitter)
                      </a>
                    )}
                    {pixivUrl && (
                      <a href={pixivUrl} target="_blank" rel="noopener noreferrer"
                        className="text-sm text-muted-foreground hover:text-accent transition-colors underline">
                        Pixiv
                      </a>
                    )}
                    {otherUrl && (
                      <a href={otherUrl} target="_blank" rel="noopener noreferrer"
                        className="text-sm text-muted-foreground hover:text-accent transition-colors underline">
                        Webサイト
                      </a>
                    )}
                  </div>
                )}

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
                スキル・使用ツール
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
                皆様のご応援とご感想が、私の創作活動の糧となります。
                ぜひ、作品をご覧いただき、ご感想をお聞かせください。
              </p>
            </div>
          </div>
        </div>
      </section>
    </Shell>
  );
}
