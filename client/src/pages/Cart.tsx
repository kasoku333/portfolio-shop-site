import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Trash2, Minus, Plus, ShoppingBag } from "lucide-react";
import Shell from "@/components/Shell";
import { useCart } from "@/contexts/CartContext";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function Cart() {
  const { items, removeItem, updateQuantity, clearCart, totalPrice } = useCart();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const checkoutMutation = trpc.checkout.createSession.useMutation();

  const handleCheckout = async () => {
    setIsCheckingOut(true);
    try {
      const baseUrl = window.location.origin + window.location.pathname;
      const result = await checkoutMutation.mutateAsync({
        items: items.map((item) => ({
          productId: item.productId,
          name: item.title,
          price: item.price,
          quantity: item.quantity,
        })),
        successUrl: `${baseUrl}#/checkout/success`,
        cancelUrl: `${baseUrl}#/checkout/cancel`,
      });

      if (result.url) {
        window.location.href = result.url;
      }
    } catch (error) {
      toast.error(
        "決済サービスに接続できませんでした。STRIPE_SECRET_KEYが設定されているか確認してください。"
      );
    } finally {
      setIsCheckingOut(false);
    }
  };

  if (items.length === 0) {
    return (
      <Shell>
        <section className="py-24 text-center">
          <div className="container space-y-6">
            <ShoppingBag className="w-16 h-16 text-muted-foreground mx-auto" />
            <h2 className="text-3xl font-serif font-bold text-foreground">
              カートは空です
            </h2>
            <p className="text-muted-foreground">
              ショップで気になる作品を見つけてみましょう
            </p>
            <Link to="/shop">
              <Button className="bg-accent text-accent-foreground hover:bg-accent/90">
                ショップへ
              </Button>
            </Link>
          </div>
        </section>
      </Shell>
    );
  }

  return (
    <Shell>
      <section className="py-16 md:py-24">
        <div className="container space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-serif font-bold text-foreground">
              ショッピングカート
            </h2>
            <Button
              variant="outline"
              size="sm"
              onClick={clearCart}
              className="text-destructive hover:text-destructive"
            >
              カートを空にする
            </Button>
          </div>

          {/* Cart Items */}
          <div className="space-y-4">
            {items.map((item) => (
              <div
                key={item.productId}
                className="flex items-center gap-4 p-4 rounded-lg border border-border bg-card"
                style={{ boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)" }}
              >
                {/* Image */}
                <div className="w-20 h-20 rounded-lg bg-muted overflow-hidden flex-shrink-0">
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                      No Image
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h4 className="font-serif font-semibold text-foreground truncate">
                    {item.title}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {item.productType === "digital" ? "デジタル" : "実物"}
                  </p>
                  <p className="text-accent font-bold">
                    ¥{item.price.toLocaleString()}
                  </p>
                </div>

                {/* Quantity */}
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  <span className="w-8 text-center font-medium">{item.quantity}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>

                {/* Subtotal */}
                <div className="text-right w-24 flex-shrink-0">
                  <p className="font-bold text-foreground">
                    ¥{(item.price * item.quantity).toLocaleString()}
                  </p>
                </div>

                {/* Remove */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-destructive hover:text-destructive h-8 w-8 flex-shrink-0"
                  onClick={() => removeItem(item.productId)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="rounded-lg border border-border bg-card p-6 space-y-4" style={{ boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)" }}>
            <div className="flex items-center justify-between text-lg">
              <span className="font-medium text-foreground">合計</span>
              <span className="text-2xl font-bold text-accent">
                ¥{totalPrice.toLocaleString()}
              </span>
            </div>
            <Button
              className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
              size="lg"
              onClick={handleCheckout}
              disabled={isCheckingOut}
            >
              {isCheckingOut ? "処理中..." : "購入手続きへ"}
            </Button>
            <Link to="/shop" className="block">
              <Button variant="outline" className="w-full" size="lg">
                買い物を続ける
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </Shell>
  );
}
