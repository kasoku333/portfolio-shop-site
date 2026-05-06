import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Save, Globe, User, Mail, Link as LinkIcon, ImageIcon } from "lucide-react";
import ImageUploader from "./ImageUploader";

export default function SiteSettingsManager() {
  const { data: settings, refetch } = trpc.siteSettings.get.useQuery();
  const updateSettings = trpc.siteSettings.update.useMutation({
    onSuccess: () => {
      toast.success("設定を保存しました");
      refetch();
    },
    onError: (err) => {
      toast.error("保存に失敗しました: " + err.message);
    },
  });

  const [form, setForm] = useState({
    siteName: "",
    siteSubtitle: "",
    creatorName: "",
    email: "",
    bio: "",
    profileImageUrl: "",
    heroImageUrl: "",
    twitterUrl: "",
    pixivUrl: "",
    otherUrl: "",
  });

  useEffect(() => {
    if (settings) {
      setForm({
        siteName: settings.siteName || "",
        siteSubtitle: settings.siteSubtitle || "",
        creatorName: settings.creatorName || "",
        email: settings.email || "",
        bio: settings.bio || "",
        profileImageUrl: settings.profileImageUrl || "",
        heroImageUrl: settings.heroImageUrl || "",
        twitterUrl: settings.twitterUrl || "",
        pixivUrl: settings.pixivUrl || "",
        otherUrl: settings.otherUrl || "",
      });
    }
  }, [settings]);

  const handleSave = () => {
    updateSettings.mutate(form);
  };

  return (
    <div className="space-y-8">
      {/* Site Info */}
      <div className="rounded-lg border border-border bg-card p-6 space-y-4" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
        <div className="flex items-center gap-2 mb-2">
          <Globe className="w-5 h-5 text-accent" />
          <h3 className="text-lg font-serif font-bold text-foreground">サイト情報</h3>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="siteName">サイト名</Label>
            <Input
              id="siteName"
              value={form.siteName}
              onChange={(e) => setForm({ ...form, siteName: e.target.value })}
              placeholder="Atelier Shelf"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="siteSubtitle">サブタイトル</Label>
            <Input
              id="siteSubtitle"
              value={form.siteSubtitle}
              onChange={(e) => setForm({ ...form, siteSubtitle: e.target.value })}
              placeholder="Portfolio Shop"
            />
          </div>
        </div>
      </div>

      {/* Hero Image */}
      <div className="rounded-lg border border-border bg-card p-6 space-y-4" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
        <div className="flex items-center gap-2 mb-2">
          <ImageIcon className="w-5 h-5 text-accent" />
          <h3 className="text-lg font-serif font-bold text-foreground">トップページのヒーロー画像</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          トップページ上部の背景に表示される画像です。設定しない場合はデフォルトのグラデーション背景になります。
        </p>
        {form.heroImageUrl && (
          <div className="space-y-2">
            <div className="relative rounded-lg overflow-hidden border border-border">
              <img
                src={form.heroImageUrl}
                alt="ヒーロー画像プレビュー"
                className="w-full h-48 object-cover"
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setForm({ ...form, heroImageUrl: "" })}
            >
              画像を削除
            </Button>
          </div>
        )}
        <ImageUploader
          onImageUrl={(url) => setForm({ ...form, heroImageUrl: url })}
          maxSize={20}
        />
      </div>

      {/* Creator Profile */}
      <div className="rounded-lg border border-border bg-card p-6 space-y-4" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
        <div className="flex items-center gap-2 mb-2">
          <User className="w-5 h-5 text-accent" />
          <h3 className="text-lg font-serif font-bold text-foreground">クリエイタープロフィール</h3>
        </div>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="creatorName">クリエイター名</Label>
            <Input
              id="creatorName"
              value={form.creatorName}
              onChange={(e) => setForm({ ...form, creatorName: e.target.value })}
              placeholder="あなたのクリエイター名"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bio">自己紹介</Label>
            <Textarea
              id="bio"
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

      {/* Contact */}
      <div className="rounded-lg border border-border bg-card p-6 space-y-4" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
        <div className="flex items-center gap-2 mb-2">
          <Mail className="w-5 h-5 text-accent" />
          <h3 className="text-lg font-serif font-bold text-foreground">連絡先</h3>
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">メールアドレス</Label>
          <Input
            id="email"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="hello@example.com"
          />
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
            <Label htmlFor="twitterUrl">X (Twitter) URL</Label>
            <Input
              id="twitterUrl"
              value={form.twitterUrl}
              onChange={(e) => setForm({ ...form, twitterUrl: e.target.value })}
              placeholder="https://x.com/yourname"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pixivUrl">Pixiv URL</Label>
            <Input
              id="pixivUrl"
              value={form.pixivUrl}
              onChange={(e) => setForm({ ...form, pixivUrl: e.target.value })}
              placeholder="https://www.pixiv.net/users/12345"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="otherUrl">その他のURL</Label>
            <Input
              id="otherUrl"
              value={form.otherUrl}
              onChange={(e) => setForm({ ...form, otherUrl: e.target.value })}
              placeholder="https://example.com"
            />
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={updateSettings.isPending}
          className="bg-accent text-accent-foreground hover:bg-accent/90 px-8"
        >
          <Save className="w-4 h-4 mr-2" />
          {updateSettings.isPending ? "保存中..." : "設定を保存"}
        </Button>
      </div>
    </div>
  );
}
