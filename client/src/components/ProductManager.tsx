import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Trash2, Edit2 } from "lucide-react";
import ImageUploader from "./ImageUploader";

interface Product {
  id: number;
  title: string;
  description?: string | null;
  price: number;
  productType: "digital" | "physical";
  imageUrl?: string | null;
  stock?: number | null;
  boothUrl?: string | null;
}

// 「xxx.booth.pm/items/123」のようにスキーマ無しで貼られることが多いため、https:// を補う。
// サーバー側の検証はURL形式を要求するので、ここで整えないと保存が弾かれる。
function normalizeUrl(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "";
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

function isValidUrl(value: string) {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

interface ProductManagerProps {
  products?: Product[];
  onAdd?: (product: Omit<Product, "id">) => void;
  onEdit?: (id: number, product: Partial<Product>) => void;
  onDelete?: (id: number) => void;
}

export default function ProductManager({
  products = [],
  onAdd,
  onEdit,
  onDelete,
}: ProductManagerProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    productType: "digital" as "digital" | "physical",
    stock: "",
    imageUrl: "",
    boothUrl: "",
  });

  const handleOpenDialog = (product?: Product) => {
    if (product) {
      setEditingId(product.id);
      setFormData({
        title: product.title,
        description: product.description || "",
        price: product.price.toString(),
        productType: product.productType,
        stock: product.stock?.toString() || "",
        imageUrl: product.imageUrl || "",
        boothUrl: product.boothUrl || "",
      });
    } else {
      setEditingId(null);
      setFormData({
        title: "",
        description: "",
        price: "",
        productType: "digital",
        stock: "",
        imageUrl: "",
        boothUrl: "",
      });
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!formData.title || !formData.price) {
      alert("タイトルと価格は必須です");
      return;
    }

    const boothUrl = normalizeUrl(formData.boothUrl);
    if (boothUrl && !isValidUrl(boothUrl)) {
      alert("BOOTHのURLの形式が正しくないようです。商品ページのURLをそのまま貼り付けてください。");
      return;
    }

    const productData = {
      title: formData.title,
      description: formData.description,
      price: parseFloat(formData.price),
      productType: formData.productType,
      // 空欄のまま parseInt すると NaN になり、サーバー側の検証で弾かれる
      stock:
        formData.productType === "physical" && formData.stock.trim()
          ? parseInt(formData.stock)
          : undefined,
      imageUrl: formData.imageUrl,
      boothUrl,
    };

    if (editingId) {
      onEdit?.(editingId, productData);
    } else {
      onAdd?.(productData);
    }

    setIsDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Add Button */}
      <Button
        onClick={() => handleOpenDialog()}
        className="bg-accent text-accent-foreground hover:bg-accent/90"
      >
        新規商品を追加
      </Button>

      {/* Products Table */}
      <div className="rounded-lg border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted border-b border-border">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                  商品名
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                  種類
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                  価格
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                  在庫
                </th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-foreground">
                  操作
                </th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                    商品がまだ登録されていません
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product.id} className="border-b border-border hover:bg-muted/50">
                    <td className="px-6 py-4 text-sm text-foreground">{product.title}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className="inline-block px-2 py-1 rounded bg-muted text-muted-foreground text-xs">
                        {product.productType === "digital" ? "デジタル" : "実物"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-foreground">
                      ¥{product.price.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-foreground">
                      {product.productType === "physical" ? product.stock : "-"}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenDialog(product)}
                          className="flex items-center gap-2"
                        >
                          <Edit2 className="w-4 h-4" />
                          編集
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onDelete?.(product.id)}
                          className="flex items-center gap-2 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                          削除
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

      {/* Product Form Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl">
              {editingId ? "商品を編集" : "新規商品を追加"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                商品名 *
              </label>
              <Input
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="商品名を入力"
                className="w-full"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                説明
              </label>
              <Textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="商品の説明を入力"
                className="w-full"
                rows={4}
              />
            </div>

            {/* Product Type */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                商品種類 *
              </label>
              <Select
                value={formData.productType}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    productType: value as "digital" | "physical",
                  })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="digital">デジタルコンテンツ</SelectItem>
                  <SelectItem value="physical">実物商品</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Price */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                価格（円） *
              </label>
              <Input
                type="number"
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: e.target.value })
                }
                placeholder="1000"
                className="w-full"
              />
            </div>

            {/* BOOTH URL */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                BOOTH商品ページURL
              </label>
              <Input
                type="url"
                value={formData.boothUrl}
                onChange={(e) =>
                  setFormData({ ...formData, boothUrl: e.target.value })
                }
                placeholder="https://xxxxx.booth.pm/items/1234567"
                className="w-full"
              />
              <p className="mt-1 text-xs text-muted-foreground">
                未入力の場合、ショップ一覧では「準備中」と表示され、クリックできません。
              </p>
            </div>

            {/* Stock (for physical products) */}
            {formData.productType === ("physical" as const) && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  在庫数
                </label>
                <Input
                  type="number"
                  value={formData.stock}
                  onChange={(e) =>
                    setFormData({ ...formData, stock: e.target.value })
                  }
                  placeholder="10"
                  className="w-full"
                />
              </div>
            )}

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                商品画像
              </label>
              <ImageUploader
                onImageUrl={(url) =>
                  setFormData({ ...formData, imageUrl: url })
                }
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-4 border-t border-border">
              <Button
                className="flex-1 bg-accent text-accent-foreground hover:bg-accent/90"
                onClick={handleSubmit}
              >
                {editingId ? "更新" : "追加"}
              </Button>
              <Button
                className="flex-1"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
              >
                キャンセル
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
