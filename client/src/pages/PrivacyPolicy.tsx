import Shell from "@/components/Shell";

export default function PrivacyPolicy() {
  return (
    <Shell>
      <section className="py-16 md:py-24 border-b border-border">
        <div className="container text-center">
          <h2 className="text-4xl md:text-5xl font-serif font-bold mb-4 text-foreground">
            プライバシーポリシー
          </h2>
          <p className="text-lg text-muted-foreground">
            個人情報の取り扱いについて
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="container max-w-3xl prose prose-neutral dark:prose-invert">
          <div className="space-y-8">
            <div>
              <h3 className="text-xl font-serif font-bold text-foreground mb-3">1. 個人情報の収集について</h3>
              <p className="text-muted-foreground leading-relaxed">
                当サイトは作品を掲載するためのサイトです。閲覧にあたって、お名前・メールアドレス・住所などの個人情報をお伺いすることはありません。
                作品の頒布は外部サービス（BOOTH）にて行っており、購入手続きに伴う個人情報は同サービスへ直接お預けいただく形になります。
                当サイトがその内容を受け取ったり保管したりすることはありません。
              </p>
            </div>

            <div>
              <h3 className="text-xl font-serif font-bold text-foreground mb-3">2. Cookieの使用について</h3>
              <p className="text-muted-foreground leading-relaxed">
                当サイトでは、管理者がログイン状態を維持するためにCookieを使用しています。
                作品を閲覧されるだけの場合、Cookieによる情報の記録は行っておりません。
                また、アクセス解析ツールは導入しておりません。
              </p>
            </div>

            <div>
              <h3 className="text-xl font-serif font-bold text-foreground mb-3">3. 外部サイトへのリンクについて</h3>
              <p className="text-muted-foreground leading-relaxed">
                当サイトにはBOOTHをはじめとする外部サイトへのリンクを掲載しています。
                リンク先での個人情報の取り扱いについては、各サイトが定めるプライバシーポリシーをご確認ください。
                当サイトは、リンク先における個人情報の取り扱いについて責任を負いかねます。
              </p>
            </div>

            <div>
              <h3 className="text-xl font-serif font-bold text-foreground mb-3">4. ポリシーの変更</h3>
              <p className="text-muted-foreground leading-relaxed">
                本プライバシーポリシーは、必要に応じて変更されることがあります。
                変更後のポリシーは当ページに掲載された時点から効力を生じるものとします。
              </p>
            </div>

            <div className="pt-4 border-t border-border">
              <p className="text-sm text-muted-foreground">最終更新日: 2026年7月25日</p>
            </div>
          </div>
        </div>
      </section>
    </Shell>
  );
}
