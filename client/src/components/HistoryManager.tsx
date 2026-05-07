import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Save, Plus, Pencil, Trash2, Clock, Eye, EyeOff, ArrowUpDown } from "lucide-react";

interface HistoryItem {
  id: string;
  date: string;
  category: "exhibition" | "publication" | "award" | "other";
  title: string;
  description: string;
  sortOrder: number;
  isPublished: boolean;
}

const CATEGORY_LABELS: Record<string, string> = {
  exhibition: "展示会",
  publication: "出版",
  award: "受賞",
  other: "その他",
};

const CATEGORY_COLORS: Record<string, string> = {
  exhibition: "bg-blue-100 text-blue-800",
  publication: "bg-purple-100 text-purple-800",
  award: "bg-amber-100 text-amber-800",
  other: "bg-gray-100 text-gray-800",
};

const emptyItem = (): HistoryItem => ({
  id: crypto.randomUUID(),
  date: "",
  category: "other",
  title: "",
  description: "",
  sortOrder: 0,
  isPublished: true,
});

export default function HistoryManager() {
  const { data: settings, refetch } = trpc.siteSettings.get.useQuery();
  const updateSettings = trpc.siteSettings.update.useMutation({
    onSuccess: () => {
      toast.success("履歴を保存しました");
      refetch();
    },
    onError: (err) => {
      toast.error("保存に失敗しました: " + err.message);
    },
  });

  const [items, setItems] = useState<HistoryItem[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<HistoryItem | null>(null);
  const [formData, setFormData] = useState<HistoryItem>(emptyItem());

  useEffect(() => {
    if (settings?.historyItems) {
      setItems(settings.historyItems);
    }
  }, [settings]);

  const handleSaveAll = () => {
    updateSettings.mutate({ historyItems: items });
  };

  const openAddDialog = () => {
    const maxOrder = items.length > 0 ? Math.max(...items.map((i) => i.sortOrder)) : 0;
    setEditingItem(null);
    setFormData({ ...emptyItem(), sortOrder: maxOrder + 1 });
    setDialogOpen(true);
  };

  const openEditDialog = (item: HistoryItem) => {
    setEditingItem(item);
    setFormData({ ...item });
    setDialogOpen(true);
  };

  const handleDialogSave = () => {
    if (!formData.title.trim()) {
      toast.error("タイトルを入力してください");
      return;
    }
    if (!formData.date.trim()) {
      toast.error("年月を入力してください");
      return;
    }

    if (editingItem) {
      setItems(items.map((i) => (i.id === editingItem.id ? formData : i)));
    } else {
      setItems([...items, formData]);
    }
    setDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    setItems(items.filter((i) => i.id !== id));
  };

  const togglePublished = (id: string) => {
    setItems(items.map((i) => (i.id === id ? { ...i, isPublished: !i.isPublished } : i)));
  };

  const sortedItems = [...items].sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="rounded-lg border border-border bg-card p-6" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-accent" />
            <h3 className="text-lg font-serif font-bold text-foreground">活動履歴一覧</h3>
            <span className="text-sm text-muted-foreground">({items.length}件)</span>
          </div>
          <Button onClick={openAddDialog} className="flex items-center gap-1">
            <Plus className="w-4 h-4" />
            新規追加
          </Button>
        </div>

        {sortedItems.length === 0 ? (
          <p className="text-sm text-muted-foreground py-8 text-center">
            履歴がありません。「新規追加」ボタンで追加してください。
          </p>
        ) : (
          <div className="space-y-3">
            {sortedItems.map((item) => (
              <div
                key={item.id}
                className={`flex items-center gap-4 p-4 rounded-md border bg-background ${
                  item.isPublished ? "border-border" : "border-dashed border-muted-foreground/30 opacity-60"
                }`}
              >
                <div className="flex items-center gap-2 min-w-[2.5rem]">
                  <ArrowUpDown className="w-3 h-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground font-mono">{item.sortOrder}</span>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-semibold text-accent">{item.date}</span>
                    <span className={`text-xs px-2 py-0.5 rounded font-medium ${CATEGORY_COLORS[item.category]}`}>
                      {CATEGORY_LABELS[item.category]}
                    </span>
                    {!item.isPublished && (
                      <span className="text-xs px-2 py-0.5 rounded bg-red-100 text-red-700 font-medium">非公開</span>
                    )}
                  </div>
                  <h4 className="font-medium text-foreground truncate">{item.title}</h4>
                  {item.description && (
                    <p className="text-sm text-muted-foreground truncate">{item.description}</p>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => togglePublished(item.id)}
                    title={item.isPublished ? "非公開にする" : "公開する"}
                  >
                    {item.isPublished ? (
                      <Eye className="w-4 h-4 text-green-600" />
                    ) : (
                      <EyeOff className="w-4 h-4 text-muted-foreground" />
                    )}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => openEditDialog(item)}>
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(item.id)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleSaveAll}
          disabled={updateSettings.isPending}
          className="bg-accent text-accent-foreground hover:bg-accent/90 px-8"
        >
          <Save className="w-4 h-4 mr-2" />
          {updateSettings.isPending ? "保存中..." : "履歴を保存"}
        </Button>
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingItem ? "履歴を編集" : "履歴を追加"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>年月 <span className="text-red-500">*</span></Label>
                <Input
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  placeholder="2024年1月"
                />
              </div>
              <div className="space-y-2">
                <Label>種別</Label>
                <Select
                  value={formData.category}
                  onValueChange={(val) =>
                    setFormData({ ...formData, category: val as HistoryItem["category"] })
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="exhibition">展示会</SelectItem>
                    <SelectItem value="publication">出版</SelectItem>
                    <SelectItem value="award">受賞</SelectItem>
                    <SelectItem value="other">その他</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>タイトル <span className="text-red-500">*</span></Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="活動のタイトル"
              />
            </div>
            <div className="space-y-2">
              <Label>説明文</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="活動の詳細を記入してください"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>表示順</Label>
                <Input
                  type="number"
                  value={formData.sortOrder}
                  onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2">
                <Label>公開状態</Label>
                <div className="flex items-center gap-2 pt-1">
                  <Switch
                    checked={formData.isPublished}
                    onCheckedChange={(checked) => setFormData({ ...formData, isPublished: checked })}
                  />
                  <span className="text-sm text-muted-foreground">
                    {formData.isPublished ? "公開" : "非公開"}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              キャンセル
            </Button>
            <Button onClick={handleDialogSave}>
              {editingItem ? "更新" : "追加"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
