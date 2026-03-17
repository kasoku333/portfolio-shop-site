import { Link } from "react-router-dom";
import Shell from "@/components/Shell";
import { Button } from "@/components/ui/button";
import { XCircle } from "lucide-react";

export default function PaymentCancel() {
  return (
    <Shell>
      <section className="py-24 md:py-32">
        <div className="container max-w-lg text-center space-y-8">
          <div className="flex justify-center">
            <XCircle className="h-20 w-20 text-muted-foreground" />
          </div>
          <div className="space-y-3">
            <h1 className="text-3xl md:text-4xl font-serif font-bold">お支払いをキャンセルしました</h1>
            <p className="text-muted-foreground text-lg">
              カートの内容はそのまま保存されています。後でいつでも購入手続きを再開できます。
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/cart">
              <Button variant="default" className="rounded-full px-6">
                カートに戻る
              </Button>
            </Link>
            <Link to="/shop">
              <Button variant="outline" className="rounded-full px-6">
                ショッピングを続ける
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </Shell>
  );
}
