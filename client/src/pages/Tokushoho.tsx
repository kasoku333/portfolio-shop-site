import Shell from "@/components/Shell";

export default function Tokushoho() {
  return (
    <Shell>
      <section className="py-16 md:py-24 border-b border-border">
        <div className="container text-center">
          <h2 className="text-4xl md:text-5xl font-serif font-bold mb-4 text-foreground">
            特定商取引法に基づく表記
          </h2>
          <p className="text-lg text-muted-foreground">
            Act on Specified Commercial Transactions
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="container max-w-3xl">
          <div className="rounded-lg border border-border overflow-hidden">
            <table className="w-full">
              <tbody>
                {[
                  { label: "販売業者", value: "Atelier Shelf（個人事業）" },
                  { label: "運営統括責任者", value: "※ご本人のお名前を設定してください" },
                  { label: "所在地", value: "お問い合わせいただいた方にお知らせいたします" },
                  { label: "電話番号", value: "お問い合わせいただいた方にお知らせいたします" },
                  { label: "メールアドレス", value: "hello@atelier-shelf.example" },
                  { label: "販売価格", value: "各商品ページに表示された価格（税込）" },
                  { label: "商品代金以外の必要料金", value: "送料（実物商品の場合）、振込手数料（銀行振込の場合）" },
                  { label: "支払方法", value: "クレジットカード（Stripe決済）" },
                  { label: "支払時期", value: "クレジットカード：ご注文時に即時決済" },
                  { label: "商品の引渡時期", value: "デジタルコンテンツ：決済完了後即時\n実物商品：ご注文後7営業日以内に発送" },
                  { label: "返品・交換について", value: "デジタルコンテンツ：商品の性質上、返品・返金はお受けできません\n実物商品：商品到着後7日以内にご連絡ください。不良品の場合は交換いたします" },
                  { label: "動作環境", value: "デジタルコンテンツ：各商品ページに記載" },
                ].map((row, idx) => (
                  <tr
                    key={idx}
                    className={idx % 2 === 0 ? "bg-muted/30" : "bg-card"}
                  >
                    <th className="text-left p-4 font-semibold text-foreground w-1/3 align-top border-b border-border">
                      {row.label}
                    </th>
                    <td className="p-4 text-muted-foreground border-b border-border whitespace-pre-line">
                      {row.value}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-8 p-6 rounded-lg bg-muted/30 border border-border">
            <p className="text-sm text-muted-foreground">
              ※ 上記の内容は、実際の運営情報に合わせて更新してください。
              特定商取引法では、個人事業主の場合でも事業者の氏名・住所・電話番号の表示が義務付けられています。
              ただし、請求があった場合に遅滞なく提供する旨を記載することで、住所・電話番号は省略可能です。
            </p>
          </div>
        </div>
      </section>
    </Shell>
  );
}
