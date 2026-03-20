import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Eye } from "lucide-react";

interface Order {
  id: number;
  userId: number;
  status: "pending" | "completed" | "failed" | "cancelled";
  totalAmount: string;
  customerEmail: string;
  customerName: string;
  shippingAddress?: string | null;
  stripePaymentIntentId?: string | null;
  createdAt: Date;
}

interface OrderManagerProps {
  orders: Order[];
  onStatusChange?: (id: number, status: Order["status"]) => void;
}

const statusLabels: Record<string, string> = {
  pending: "処理中",
  completed: "完了",
  failed: "失敗",
  cancelled: "キャンセル",
};

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  completed: "bg-green-100 text-green-800",
  failed: "bg-red-100 text-red-800",
  cancelled: "bg-gray-100 text-gray-600",
};

export default function OrderManager({ orders, onStatusChange }: OrderManagerProps) {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatAmount = (amount: string) => {
    return `¥${parseFloat(amount).toLocaleString()}`;
  };

  return (
    <div className="space-y-6">
      {/* Orders Table */}
      <div className="rounded-lg border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted border-b border-border">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                  注文ID
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                  顧客名
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                  メール
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                  金額
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                  ステータス
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                  日時
                </th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-foreground">
                  操作
                </th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-muted-foreground">
                    注文がまだありません
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="border-b border-border hover:bg-muted/50">
                    <td className="px-6 py-4 text-sm text-foreground font-mono">
                      #{order.id}
                    </td>
                    <td className="px-6 py-4 text-sm text-foreground">
                      {order.customerName}
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {order.customerEmail}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-foreground">
                      {formatAmount(order.totalAmount)}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${statusColors[order.status]}`}>
                        {statusLabels[order.status]}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {formatDate(order.createdAt)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedOrder(order)}
                          className="flex items-center gap-1"
                        >
                          <Eye className="w-3 h-3" />
                          詳細
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl">
              注文詳細 #{selectedOrder?.id}
            </DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">顧客名</p>
                  <p className="font-medium text-foreground">{selectedOrder.customerName}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">メール</p>
                  <p className="font-medium text-foreground">{selectedOrder.customerEmail}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">合計金額</p>
                  <p className="font-bold text-accent text-lg">{formatAmount(selectedOrder.totalAmount)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">注文日時</p>
                  <p className="font-medium text-foreground">{formatDate(selectedOrder.createdAt)}</p>
                </div>
                {selectedOrder.shippingAddress && (
                  <div className="col-span-2">
                    <p className="text-muted-foreground">配送先</p>
                    <p className="font-medium text-foreground">{selectedOrder.shippingAddress}</p>
                  </div>
                )}
                {selectedOrder.stripePaymentIntentId && (
                  <div className="col-span-2">
                    <p className="text-muted-foreground">Stripe Payment ID</p>
                    <p className="font-mono text-xs text-foreground">{selectedOrder.stripePaymentIntentId}</p>
                  </div>
                )}
              </div>

              {/* Status Change */}
              <div className="border-t border-border pt-4">
                <label className="block text-sm font-medium text-foreground mb-2">
                  ステータス変更
                </label>
                <div className="flex gap-2">
                  <Select
                    value={selectedOrder.status}
                    onValueChange={(value) => {
                      onStatusChange?.(selectedOrder.id, value as Order["status"]);
                      setSelectedOrder({ ...selectedOrder, status: value as Order["status"] });
                    }}
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">処理中</SelectItem>
                      <SelectItem value="completed">完了</SelectItem>
                      <SelectItem value="failed">失敗</SelectItem>
                      <SelectItem value="cancelled">キャンセル</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button
                variant="outline"
                className="w-full"
                onClick={() => setSelectedOrder(null)}
              >
                閉じる
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
