import { useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Shell from "@/components/Shell";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const { user } = useAuth();
  const utils = trpc.useUtils();

  useEffect(() => {
    // Invalidate cart count after successful payment
    if (user) {
      utils.cart.getItems.invalidate();
      utils.cart.getItemCount.invalidate();
    }
  }, [user, utils]);

  return (
    <Shell>
      <section className="py-24 md:py-32">
        <div className="container max-w-lg text-center space-y-8">
          <div className="flex justify-center">
            <CheckCircle2 className="h-20 w-20 text-green-500" />
          </div>
          <div className="space-y-3">
            <h1 className="text-3xl md:text-4xl font-serif font-bold">ご購入ありがとうございます！</h1>
            <p className="text-muted-foreground text-lg">
              お支払いが完了しました。ご注文の確認メールをお送りします。
            </p>
            {sessionId && (
              <p className="text-xs text-muted-foreground font-mono bg-muted rounded px-3 py-1 inline-block">
                注文ID: {sessionId.slice(0, 24)}...
              </p>
            )}
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/orders">
              <Button variant="default" className="rounded-full px-6">
                注文履歴を見る
              </Button>
            </Link>
            <Link to="/shop">
              <Button variant="outline" className="rounded-full px-6">
                ショップに戻る
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </Shell>
  );
}
