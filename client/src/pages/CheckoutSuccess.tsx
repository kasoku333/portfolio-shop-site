import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import Shell from "@/components/Shell";
import { useCart } from "@/contexts/CartContext";
import { useEffect } from "react";

export default function CheckoutSuccess() {
  const { clearCart } = useCart();

  // Clear cart on successful purchase
  useEffect(() => {
    clearCart();
  }, []);

  return (
    <Shell>
      <section className="py-24 text-center">
        <div className="container space-y-6 max-w-lg mx-auto">
          <CheckCircle className="w-20 h-20 text-green-500 mx-auto" />
          <h2 className="text-3xl font-serif font-bold text-foreground">
            ご購入ありがとうございます！
          </h2>
          <p className="text-muted-foreground">
            お支払いが完了しました。ご注文の確認メールをお送りしますので、しばらくお待ちください。
          </p>
          <p className="text-sm text-muted-foreground">
            デジタルコンテンツはメールにてお届けいたします。
            <br />
            実物商品は発送準備が整い次第、発送いたします。
          </p>
          <div className="flex gap-3 justify-center pt-4">
            <Link to="/shop">
              <Button className="bg-accent text-accent-foreground hover:bg-accent/90">
                ショップに戻る
              </Button>
            </Link>
            <Link to="/">
              <Button variant="outline">
                トップへ
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </Shell>
  );
}
