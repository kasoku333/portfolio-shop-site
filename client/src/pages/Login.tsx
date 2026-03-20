import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Lock, AlertCircle } from "lucide-react";

export default function Login() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const loginMutation = trpc.auth.adminLogin.useMutation({
    onSuccess: () => {
      navigate("/admin");
    },
    onError: (err) => {
      setError(err.message || "ログインに失敗しました");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!password.trim()) {
      setError("パスワードを入力してください");
      return;
    }
    loginMutation.mutate({ password });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mb-4">
            <Lock className="w-6 h-6 text-accent" />
          </div>
          <h1 className="text-2xl font-serif font-bold text-foreground">
            管理者ログイン
          </h1>
          <p className="text-sm text-muted-foreground mt-2">
            管理ダッシュボードにアクセスするにはパスワードを入力してください
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              type="password"
              placeholder="パスワード"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loginMutation.isPending}
              autoFocus
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 text-sm text-red-600">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <Button
            type="submit"
            className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
            disabled={loginMutation.isPending}
          >
            {loginMutation.isPending ? "ログイン中..." : "ログイン"}
          </Button>
        </form>
      </div>
    </div>
  );
}
