import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Save, User, Link as LinkIcon, MessageSquare, Sparkles, Plus, Trash2 } from "lucide-react";
import ImageUploader from "./ImageUploader";

interface SkillItem {
  id: string;
  title: string;
  description: string;
}

export default function ProfileManager() {
  const { data: settings, refetch } = trpc.siteSettings.get.useQuery();
  const updateSettings = trpc.siteSettings.update.useMutation({
    onSuccess: () => {
      toast.success("プロフィールを保存しました");
      refetch();
    },
    onError: (err) => {
      toast.error("保存に失敗しました: " + err.message);
    },
  });

  const [form, setForm] = useState({
    creatorName: "",
    bio: "",
    profileImageUrl: "",
    twitterUrl: "",
    pixivUrl: "",
    message: "",
  });
  const [skills, setSkills] = useState<SkillItem[]>([]);

  useEffect(() => {
    if (settings) {
      setForm({
        creatorName: settings.creatorName || "",
        bio: settings.bio || "",
        profileImageUrl: settings.profileImageUrl || "",
        twitterUrl: settings.twitterUrl || "",
        pixivUrl: settings.pixivUrl || "",
        message: settings.message || "",
      });
      setSkills(settings.skills || []);
    }
  }, [settings]);

  const handleSave = () => {
    if (!form.creatorName.trim()) {
      toast.error("クリエイター名を入力してください");
      return;
    }
    for (const skill of skills) {
      if (!skill.title.trim()) {
        toast.error("スキルのタイトルを入力してください");
        return;
      }
    }
    updateSettings.mutate({
      ...form,
      skills,
    });
  };

  const addSkill = () => {
    setSkills([...skills, { id: crypto.randomUUID(), title: "", description: "" }]);
  };

  const updateSkill = (id: string, field: keyof SkillItem, value: string) => {
    setSkills(skills.map((s) => (s.id === id ? { ...s, [field]: value } : s)));
  };

  const removeSkill = (id: string) => {
    setSkills(skills.filter((s) => s.id !== id));
  };

  return (
    <div className="space-y-8">
      {/* Creator Profile */}
      <div className="rounded-lg border border-border bg-card p-6 space-y-4" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
        <div className="flex items-center gap-2 mb-2">
          <User className="w-5 h-5 text-accent" />
          <h3 className="text-lg font-serif font-bold text-foreground">基本情報</h3>
        </div>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="profile-creatorName">クリエイター名 <span className="text-red-500">*</span></Label>
            <Input
              id="profile-creatorName"
              value={form.creatorName}
              onChange={(e) => setForm({ ...form, creatorName: e.target.value })}
              placeholder="あなたのクリエイター名"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="profile-bio">自己紹介本文</Label>
            <Textarea
              id="profile-bio"
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
              placeholder="あなたの活動についてご紹介ください"
              rows={4}
            />
          </div>
          <div className="space-y-2">
            <Label>プロフィール画像</Label>
            {form.profileImageUrl && (
              <div className="mb-2">
                <img
                  src={form.profileImageUrl}
                  alt="プロフィール"
                  className="w-32 h-32 rounded-full object-cover border border-border"
                />
              </div>
            )}
            <ImageUploader
              onImageUrl={(url) => setForm({ ...form, profileImageUrl: url })}
              maxSize={10}
            />
          </div>
        </div>
      </div>

      {/* SNS Links */}
      <div className="rounded-lg border border-border bg-card p-6 space-y-4" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
        <div className="flex items-center gap-2 mb-2">
          <LinkIcon className="w-5 h-5 text-accent" />
          <h3 className="text-lg font-serif font-bold text-foreground">SNSリンク</h3>
        </div>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="profile-twitterUrl">X (Twitter) URL</Label>
            <Input
              id="profile-twitterUrl"
              value={form.twitterUrl}
              onChange={(e) => setForm({ ...form, twitterUrl: e.target.value })}
              placeholder="https://x.com/yourname"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="profile-pixivUrl">Pixiv URL</Label>
            <Input
              id="profile-pixivUrl"
              value={form.pixivUrl}
              onChange={(e) => setForm({ ...form, pixivUrl: e.target.value })}
              placeholder="https://www.pixiv.net/users/12345"
            />
          </div>
        </div>
      </div>

      {/* Message */}
      <div className="rounded-lg border border-border bg-card p-6 space-y-4" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
        <div className="flex items-center gap-2 mb-2">
          <MessageSquare className="w-5 h-5 text-accent" />
          <h3 className="text-lg font-serif font-bold text-foreground">メッセージ</h3>
        </div>
        <div className="space-y-2">
          <Label htmlFor="profile-message">メッセージ本文</Label>
          <Textarea
            id="profile-message"
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
            placeholder="サイト訪問者へのメッセージを入力してください"
            rows={5}
          />
        </div>
      </div>

      {/* Skills */}
      <div className="rounded-lg border border-border bg-card p-6 space-y-4" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-accent" />
            <h3 className="text-lg font-serif font-bold text-foreground">スキル項目</h3>
          </div>
          <Button variant="outline" size="sm" onClick={addSkill} className="flex items-center gap-1">
            <Plus className="w-4 h-4" />
            追加
          </Button>
        </div>

        {skills.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">
            スキル項目がありません。「追加」ボタンで追加してください。
          </p>
        ) : (
          <div className="space-y-4">
            {skills.map((skill, idx) => (
              <div key={skill.id} className="flex gap-3 items-start p-4 rounded-md border border-border bg-background">
                <span className="text-sm font-medium text-muted-foreground mt-2 min-w-[1.5rem]">{idx + 1}</span>
                <div className="flex-1 space-y-3">
                  <div className="space-y-1">
                    <Label>タイトル <span className="text-red-500">*</span></Label>
                    <Input
                      value={skill.title}
                      onChange={(e) => updateSkill(skill.id, "title", e.target.value)}
                      placeholder="スキル名"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>説明文</Label>
                    <Input
                      value={skill.description}
                      onChange={(e) => updateSkill(skill.id, "description", e.target.value)}
                      placeholder="スキルの説明"
                    />
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeSkill(skill.id)}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50 mt-2"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={updateSettings.isPending}
          className="bg-accent text-accent-foreground hover:bg-accent/90 px-8"
        >
          <Save className="w-4 h-4 mr-2" />
          {updateSettings.isPending ? "保存中..." : "プロフィールを保存"}
        </Button>
      </div>
    </div>
  );
}
