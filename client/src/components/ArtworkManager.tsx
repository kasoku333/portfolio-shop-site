import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Trash2, Edit2, Plus } from "lucide-react";
import ImageUploader from "./ImageUploader";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

type Category = "illustration" | "manga" | "novel";

const categoryLabels: Record<Category, string> = {
  illustration: "イラスト",
  manga: "漫画",
  novel: "小説",
};

interface FormData {
  title: string;
  description: string;
  category: Category;
  imageUrl: string;
  imageKey: string;
}

const emptyForm: FormData = {
  title: "",
  description: "",
  category: "illustration",
  imageUrl: "",
  imageKey: "",
};

export default function ArtworkManager() {
  const utils = trpc.useUtils();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<FormData>(emptyForm);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  const { data: artworks = [], isLoading } = trpc.artworks.list.useQuery({ category: "all" });

  const createArtwork = trpc.artworks.create.useMutation({
    onSuccess: () => {
      utils.artworks.list.invalidate();
      toast.success("作品を追加しました");
      setIsDialogOpen(false);
    },
    onError: (e) => toast.error(e.message),
  });

  const updateArtwork = trpc.artworks.update.useMutation({
    onSuccess: () => {
      utils.artworks.list.invalidate();
      toast.success("作品を更新しました");
      setIsDialogOpen(false);
    },
    onError: (e) => toast.error(e.message),
  });

  const deleteArtwork = trpc.artworks.delete.useMutation({
    onSuccess: () => {
      utils.artworks.list.invalidate();
      toast.success("作品を削除しました");
      setDeleteConfirmId(null);
    },
    onError: (e) => toast.error(e.message),
  });

  const openCreate = () => {
    setEditingId(null);
    setFormData(emptyForm);
    setIsDialogOpen(true);
  };

  const openEdit = (artwork: typeof artworks[number]) => {
    setEditingId(artwork.id);
    setFormData({
      title: artwork.title,
      description: artwork.description ?? "",
      category: artwork.category as Category,
      imageUrl: artwork.imageUrl ?? "",
      imageKey: artwork.imageKey ?? "",
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!formData.title.trim()) {
      toast.error("タイトルは必須です");
      return;
    }
    if (editingId) {
      updateArtwork.mutate({ id: editingId, ...formData });
    } else {
      createArtwork.mutate(formData);
    }
  };

  const isPending = createArtwork.isPending || updateArtwork.isPending;

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button onClick={openCreate} className="flex items-center gap-2 rounded-full">
          <Plus className="w-4 h-4" />
          作品を追加
        </Button>
      </div>

      {isLoading ? (
        <div className="py-12 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent mx-auto" />
        </div>
      ) : artworks.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">作品がまだ登録されていません</p>
        </div>
      ) : (
        <div className="gallery-grid">
          {artworks.map((artwork) => (
            <div
              key={artwork.id}
              className="group relative overflow-hidden rounded-lg border border-border bg-card"
              style={{ boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)" }}
            >
              <div className="aspect-square w-full bg-muted overflow-hidden">
                {artwork.imageUrl ? (
                  <img
                    src={artwork.imageUrl}
                    alt={artwork.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">
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
                    {categoryLabels[artwork.category as Category] ?? artwork.category}
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEdit(artwork)}
                    className="flex-1 flex items-center justify-center gap-1"
                  >
                    <Edit2 className="w-3 h-3" />
                    編集
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setDeleteConfirmId(artwork.id)}
                    className="flex-1 flex items-center justify-center gap-1 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-3 h-3" />
                    削除
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl">
              {editingId ? "作品を編集" : "新規作品を追加"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                作品名 <span className="text-destructive">*</span>
              </label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="作品名を入力"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                カテゴリ <span className="text-destructive">*</span>
              </label>
              <Select
                value={formData.category}
                onValueChange={(v) => setFormData({ ...formData, category: v as Category })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="illustration">イラスト</SelectItem>
                  <SelectItem value="manga">漫画</SelectItem>
                  <SelectItem value="novel">小説</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                説明
              </label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="作品の説明を入力"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                作品画像（PNG・JPG）
              </label>
              <ImageUploader
                currentImageUrl={formData.imageUrl || undefined}
                onImageUrl={(url, key) => setFormData({ ...formData, imageUrl: url, imageKey: key })}
              />
            </div>

            <div className="flex gap-3 pt-4 border-t border-border">
              <Button className="flex-1" onClick={handleSubmit} disabled={isPending}>
                {isPending ? "保存中..." : editingId ? "更新" : "追加"}
              </Button>
              <Button
                className="flex-1"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                disabled={isPending}
              >
                キャンセル
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <Dialog
        open={deleteConfirmId !== null}
        onOpenChange={(open) => !open && setDeleteConfirmId(null)}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>削除の確認</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground text-sm">
            この作品を削除しますか？この操作は取り消せません。
          </p>
          <div className="flex gap-3 pt-4">
            <Button
              variant="destructive"
              className="flex-1"
              disabled={deleteArtwork.isPending}
              onClick={() =>
                deleteConfirmId !== null && deleteArtwork.mutate({ id: deleteConfirmId })
              }
            >
              {deleteArtwork.isPending ? "削除中..." : "削除する"}
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setDeleteConfirmId(null)}
            >
              キャンセル
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
