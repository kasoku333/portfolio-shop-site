import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Trash2, Edit2 } from "lucide-react";
import ImageUploader from "./ImageUploader";

interface Artwork {
  id: number;
  title: string;
  description?: string;
  category: "illustration" | "manga" | "novel";
  imageUrl?: string;
}

interface ArtworkManagerProps {
  artworks?: Artwork[];
  onAdd?: (artwork: Omit<Artwork, "id">) => void;
  onEdit?: (id: number, artwork: Partial<Artwork>) => void;
  onDelete?: (id: number) => void;
}

export default function ArtworkManager({
  artworks = [],
  onAdd,
  onEdit,
  onDelete,
}: ArtworkManagerProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "illustration" as "illustration" | "manga" | "novel",
    imageUrl: "",
  });

  const handleOpenDialog = (artwork?: Artwork) => {
    if (artwork) {
      setEditingId(artwork.id);
      setFormData({
        title: artwork.title,
        description: artwork.description || "",
        category: artwork.category,
        imageUrl: artwork.imageUrl || "",
      });
    } else {
      setEditingId(null);
      setFormData({
        title: "",
        description: "",
        category: "illustration",
        imageUrl: "",
      });
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!formData.title) {
      alert("タイトルは必須です");
      return;
    }

    const artworkData = {
      title: formData.title,
      description: formData.description,
      category: formData.category,
      imageUrl: formData.imageUrl,
    };

    if (editingId) {
      onEdit?.(editingId, artworkData);
    } else {
      onAdd?.(artworkData);
    }

    setIsDialogOpen(false);
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      illustration: "イラスト",
      manga: "漫画",
      novel: "小説",
    };
    return labels[category] || category;
  };

  return (
    <div className="space-y-6">
      {/* Artworks Grid */}
      <div className="gallery-grid">
        {artworks.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <p className="text-muted-foreground mb-4">作品がまだ登録されていません</p>
          </div>
        ) : (
          artworks.map((artwork) => (
            <div
              key={artwork.id}
              className="group relative overflow-hidden rounded-lg border border-border bg-card"
              style={{ boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)" }}
            >
              <div className="aspect-square w-full object-cover transition-transform duration-300 group-hover:scale-105 bg-muted">
                {artwork.imageUrl ? (
                  <img
                    src={artwork.imageUrl}
                    alt={artwork.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                    No Image
                  </div>
                )}
              </div>
              <div className="p-4">
                <h4 className="font-serif font-semibold text-foreground mb-2 line-clamp-2">
                  {artwork.title}
                </h4>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded">
                    {getCategoryLabel(artwork.category)}
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenDialog(artwork)}
                    className="flex-1 flex items-center justify-center gap-1"
                  >
                    <Edit2 className="w-3 h-3" />
                    編集
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onDelete?.(artwork.id)}
                    className="flex-1 flex items-center justify-center gap-1 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-3 h-3" />
                    削除
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Artwork Form Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl">
              {editingId ? "作品を編集" : "新規作品を追加"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                作品名 *
              </label>
              <Input
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="作品名を入力"
                className="w-full"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                カテゴリ *
              </label>
              <Select
                value={formData.category}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    category: value as "illustration" | "manga" | "novel",
                  })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="illustration">イラスト</SelectItem>
                  <SelectItem value="manga">漫画</SelectItem>
                  <SelectItem value="novel">小説</SelectItem>
                </SelectContent>
              </Select>
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
                placeholder="作品の説明を入力"
                className="w-full"
                rows={4}
              />
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                作品画像
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
