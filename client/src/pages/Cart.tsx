import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Shell from "@/components/Shell";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import { toast } from "sonner";

export default function Cart() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const utils = trpc.useUtils();
  const [checkingOut, setCheckingOut] = useState(false);

  const { data: items, isLoading } = trpc.cart.getItems.useQuery(undefined, {
    enabled: !!user,
  });

  const updateItem = trpc.cart.updateItem.useMutation({
    onSuccess: () => utils.cart.getItems.invalidate(),
  });

  const removeItem = trpc.cart.removeItem.useMutation({
    onSuccess: () => {
      utils.cart.getItems.invalidate();
      utils.cart.getItemCount.invalidate();
      toast.success("商品をカートから削除しました");
    },
  });

  const checkout = trpc.cart.checkout.useMutation({
    onSuccess: (data) => {
      if (data.url) {
        window.location.href = data.url;
      }
    },
    onError: (err) => {
      toast.error(err.message);
      setCheckingOut(false);
    },
  });

  const total = items?.reduce((sum, item) => {
    return sum + parseFloat(item.product?.price ?? "0") * item.quantity;
  }, 0) ?? 0;

  const handleCheckout = () => {
    if (!user) {
      toast.error("購入するにはログインが必要です");
      return;
    }
    setCheckingOut(true);
    checkout.mutate({
      successUrl: `${window.location.origin}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${window.location.origin}/cart`,
    });
  };

  if (authLoading) {
    return (
      <Shell>
        <div className="container py-24 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto" />
        </div>
      </Shell>
    );
  }

  if (!user) {
    return (
      <Shell>
        <section className="py-24">
          <div className="container max-w-md text-center space-y-6">
            <ShoppingBag className="mx-auto h-16 w-16 text-muted-foreground" />
            <h1 className="text-2xl font-serif font-bold">カートを見るにはログインが必要です</h1>
            <p className="text-muted-foreground">ログインしてショッピングを続けましょう。</p>
            <Link to="/shop">
              <Button variant="outline">ショップに戻る</Button>
            </Link>
          </div>
        </section>
      </Shell>
    );
  }

  return (
    <Shell>
      <section className="py-12 md:py-20">
        <div className="container max-w-4xl">
          <h1 className="text-3xl md:text-4xl font-serif font-bold mb-10">カート</h1>

          {isLoading ? (
            <div className="py-24 text-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-accent mx-auto" />
            </div>
          ) : !items || items.length === 0 ? (
            <div className="py-24 text-center space-y-6">
              <ShoppingBag className="mx-auto h-16 w-16 text-muted-foreground" />
              <p className="text-lg text-muted-foreground">カートは空です</p>
              <Link to="/shop">
                <Button>ショップを見る</Button>
              </Link>
            </div>
          ) : (
            <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
              {/* Cart Items */}
              <div className="space-y-4">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-4 rounded-2xl border border-border bg-card p-4 shadow-sm"
                  >
                    {item.product?.imageUrl ? (
                      <img
                        src={item.product.imageUrl}
                        alt={item.product.title}
                        className="h-24 w-24 rounded-xl object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="h-24 w-24 rounded-xl bg-muted flex-shrink-0 flex items-center justify-center text-muted-foreground text-xs">
                        No Image
                      </div>
                    )}
                    <div className="flex flex-1 flex-col gap-2">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-serif font-semibold text-foreground leading-snug">
                            {item.product?.title}
                          </h3>
                          <span className="text-xs text-muted-foreground">
                            {item.product?.productType === "digital" ? "デジタル" : "実物"}
                          </span>
                        </div>
                        <button
                          onClick={() => removeItem.mutate({ cartItemId: item.id })}
                          className="text-muted-foreground hover:text-destructive transition-colors"
                          aria-label="削除"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="flex items-center justify-between mt-auto">
                        <div className="flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1">
                          <button
                            onClick={() =>
                              item.quantity > 1
                                ? updateItem.mutate({ cartItemId: item.id, quantity: item.quantity - 1 })
                                : removeItem.mutate({ cartItemId: item.id })
                            }
                            className="text-muted-foreground hover:text-foreground"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="min-w-[20px] text-center text-sm font-medium">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateItem.mutate({ cartItemId: item.id, quantity: item.quantity + 1 })
                            }
                            className="text-muted-foreground hover:text-foreground"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                        <span className="font-bold text-accent">
                          ¥{(parseFloat(item.product?.price ?? "0") * item.quantity).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Summary */}
              <div className="space-y-4">
                <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-4">
                  <h2 className="font-serif font-bold text-lg">注文サマリー</h2>
                  <div className="space-y-2 text-sm">
                    {items.map((item) => (
                      <div key={item.id} className="flex justify-between text-muted-foreground">
                        <span className="truncate max-w-[180px]">{item.product?.title} × {item.quantity}</span>
                        <span>¥{(parseFloat(item.product?.price ?? "0") * item.quantity).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-border pt-4 flex justify-between font-bold text-lg">
                    <span>合計</span>
                    <span className="text-accent">¥{total.toLocaleString()}</span>
                  </div>
                  <Button
                    className="w-full rounded-full gap-2"
                    size="lg"
                    onClick={handleCheckout}
                    disabled={checkingOut || checkout.isPending}
                  >
                    {checkingOut ? "処理中..." : "購入手続きへ"}
                    {!checkingOut && <ArrowRight className="h-4 w-4" />}
                  </Button>
                  <Link to="/shop">
                    <Button variant="outline" className="w-full rounded-full" size="sm">
                      ショッピングを続ける
                    </Button>
                  </Link>
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  決済はStripeで安全に処理されます
                </p>
              </div>
            </div>
          )}
        </div>
      </section>
    </Shell>
  );
}
