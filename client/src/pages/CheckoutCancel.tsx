import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { XCircle } from "lucide-react";
import Shell from "@/components/Shell";

export default function CheckoutCancel() {
  return (
    <Shell>
      <section className="py-24 text-center">
        <div className="container space-y-6 max-w-lg mx-auto">
          <XCircle className="w-20 h-20 text-muted-foreground mx-auto" />
          <h2 className="text-3xl font-serif font-bold text-foreground">
            お支払いがキャンセルされました
          </h2>
          <p className="text-muted-foreground">
            お支払いは完了していません。カートの商品はそのまま保持されていますので、いつでもお手続きいただけます。
          </p>
          <div className="flex gap-3 justify-center pt-4">
            <Link to="/cart">
              <Button className="bg-accent text-accent-foreground hover:bg-accent/90">
                カートに戻る
              </Button>
            </Link>
            <Link to="/shop">
              <Button variant="outline">
                ショップに戻る
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </Shell>
  );
}
