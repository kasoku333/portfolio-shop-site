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
                当サイトでは、商品の購入時にお名前、メールアドレス、お届け先住所などの個人情報をお伺いすることがあります。
                これらの情報は、商品の発送やお問い合わせへの対応など、サービス提供に必要な範囲でのみ利用いたします。
              </p>
            </div>

            <div>
              <h3 className="text-xl font-serif font-bold text-foreground mb-3">2. 個人情報の利用目的</h3>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li>商品の発送およびサービスの提供</li>
                <li>お問い合わせへの対応</li>
                <li>注文内容の確認や発送通知</li>
                <li>サービスの改善・新サービスの開発</li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-serif font-bold text-foreground mb-3">3. 個人情報の第三者提供</h3>
              <p className="text-muted-foreground leading-relaxed">
                当サイトでは、以下の場合を除き、個人情報を第三者に提供することはありません。
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 mt-2">
                <li>ご本人の同意がある場合</li>
                <li>法令に基づく場合</li>
                <li>商品の配送業務のため、配送業者に必要な情報を提供する場合</li>
                <li>決済処理のため、決済サービス会社（Stripe）に必要な情報を提供する場合</li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-serif font-bold text-foreground mb-3">4. Cookieの使用について</h3>
              <p className="text-muted-foreground leading-relaxed">
                当サイトでは、ログイン状態の維持やカート情報の保存のためにCookieを使用しています。
                ブラウザの設定によりCookieを無効にすることも可能ですが、一部の機能が利用できなくなる場合があります。
              </p>
            </div>

            <div>
              <h3 className="text-xl font-serif font-bold text-foreground mb-3">5. セキュリティについて</h3>
              <p className="text-muted-foreground leading-relaxed">
                お客様の個人情報を適切に管理し、不正アクセス、紛失、破損、改ざん、漏洩などの防止に努めます。
                決済情報はStripeを通じて安全に処理され、当サイトではクレジットカード情報を直接保持しません。
              </p>
            </div>

            <div>
              <h3 className="text-xl font-serif font-bold text-foreground mb-3">6. ポリシーの変更</h3>
              <p className="text-muted-foreground leading-relaxed">
                本プライバシーポリシーは、必要に応じて変更されることがあります。
                変更後のポリシーは当ページに掲載された時点から効力を生じるものとします。
              </p>
            </div>

            <div className="pt-4 border-t border-border">
              <p className="text-sm text-muted-foreground">最終更新日: 2026年3月20日</p>
            </div>
          </div>
        </div>
      </section>
    </Shell>
  );
}
