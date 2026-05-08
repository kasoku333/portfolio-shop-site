import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Trash2, Minus, Plus, ShoppingBag } from "lucide-react";
import Shell from "@/components/Shell";
import { useCart } from "@/contexts/CartContext";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

function formatPrice(value: number) {
  return `¥${Math.round(value).toLocaleString("ja-JP")}`;
}

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
        <section className="py-20 md:py-28 text-center">
          <div className="container space-y-6">
            <ShoppingBag className="w-16 h-16 text-muted-foreground mx-auto" strokeWidth={1.25} />
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-foreground">
              カートは空です
            </h2>
            <p className="text-sm md:text-base text-muted-foreground">
              ショップで気になる作品を見つけてみましょう。
            </p>
            <Link to="/shop" className="inline-block">
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
      <section className="py-12 md:py-20">
        <div className="container space-y-8 max-w-4xl">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-foreground">
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
                className="rounded-lg border border-border bg-card p-4 sm:p-5"
                style={{ boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)" }}
              >
                {/* スマホでは縦寄りレイアウト、PCでは横並び */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex gap-4 flex-1 min-w-0">
                    {/* Image */}
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg bg-muted overflow-hidden flex-shrink-0">
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
                    <div className="flex-1 min-w-0 space-y-1">
                      <h4 className="font-serif font-semibold text-foreground line-clamp-2">
                        {item.title}
                      </h4>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider">
                        {item.productType === "digital" ? "デジタル" : "実物"}
                      </p>
                      <p className="text-accent font-bold">{formatPrice(item.price)}</p>
                    </div>
                  </div>

                  {/* 操作部（数量・小計・削除） */}
                  <div className="flex items-center justify-between gap-3 sm:gap-5 sm:justify-end">
                    {/* Quantity */}
                    <div className="flex items-center gap-1.5" aria-label="数量変更">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-9 w-9 sm:h-8 sm:w-8"
                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        aria-label="数量を減らす"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </Button>
                      <span className="w-8 text-center font-medium" aria-live="polite">
                        {item.quantity}
                      </span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-9 w-9 sm:h-8 sm:w-8"
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        aria-label="数量を増やす"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </Button>
                    </div>

                    {/* Subtotal */}
                    <div className="text-right min-w-[5rem]">
                      <p className="text-xs text-muted-foreground sm:hidden">小計</p>
                      <p className="font-bold text-foreground">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                    </div>

                    {/* Remove */}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive h-9 w-9 sm:h-8 sm:w-8 flex-shrink-0"
                      onClick={() => removeItem(item.productId)}
                      aria-label={`「${item.title}」をカートから削除`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div
            className="rounded-lg border border-border bg-card p-6 space-y-4"
            style={{ boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)" }}
          >
            <div className="flex items-center justify-between text-lg">
              <span className="font-medium text-foreground">合計</span>
              <span className="text-2xl font-bold text-accent">{formatPrice(totalPrice)}</span>
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
