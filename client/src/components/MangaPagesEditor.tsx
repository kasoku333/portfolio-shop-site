import { useRef, useState } from "react";
import { ArrowDown, ArrowUp, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { MAX_MANGA_PAGES } from "@shared/manga";

interface MangaPagesEditorProps {
  pages: string[];
  onChange: (pages: string[]) => void;
}

const MAX_SIZE_MB = 100;

function readAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve((reader.result as string).split(",")[1]);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

// 漫画のページ画像を複数枚まとめて登録し、読む順に並べ替える。
// 1枚目が表紙としてギャラリーの一覧に出る。
export default function MangaPagesEditor({
  pages,
  onChange,
}: MangaPagesEditorProps) {
  const [progress, setProgress] = useState<{
    done: number;
    total: number;
  } | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadMutation = trpc.upload.image.useMutation();

  const handleFiles = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    // 選んだ順がばらつくことがあるので、ファイル名の自然順（p2 < p10）で並べてから足す
    const files = Array.from(fileList).sort((a, b) =>
      a.name.localeCompare(b.name, "ja", { numeric: true })
    );
    if (pages.length + files.length > MAX_MANGA_PAGES) {
      setErrorMessage(`ページは${MAX_MANGA_PAGES}枚までです`);
      return;
    }

    setErrorMessage("");
    setProgress({ done: 0, total: files.length });
    const added: string[] = [];
    try {
      // 1枚ずつ送る。まとめて送ると body の上限に当たりやすく、途中で失敗したときに分かりにくい
      for (const file of files) {
        if (file.size / (1024 * 1024) > MAX_SIZE_MB) {
          throw new Error(`${file.name} が${MAX_SIZE_MB}MBを超えています`);
        }
        const result = await uploadMutation.mutateAsync({
          fileName: file.name,
          fileData: await readAsBase64(file),
          contentType: file.type,
        });
        added.push(result.url);
        setProgress({ done: added.length, total: files.length });
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : "";
      setErrorMessage(
        `${added.length}枚目まで追加しました。続きでエラー：${msg || "アップロードに失敗しました"}`
      );
    } finally {
      // 失敗しても、それまでに上がったページは残す
      if (added.length > 0) onChange([...pages, ...added]);
      setProgress(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const move = (index: number, delta: number) => {
    const next = [...pages];
    const [page] = next.splice(index, 1);
    next.splice(index + delta, 0, page);
    onChange(next);
  };

  const remove = (index: number) => {
    onChange(pages.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      <div
        onClick={() => !progress && fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          progress
            ? "border-muted bg-muted/30"
            : "cursor-pointer border-border hover:bg-muted/50"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/jpeg,image/png,image/gif,image/webp,image/avif"
          onChange={e => handleFiles(e.currentTarget.files)}
          className="hidden"
        />
        <Upload className="w-7 h-7 text-muted-foreground mx-auto mb-2" />
        {progress ? (
          <p className="text-sm text-muted-foreground">
            アップロード中… {progress.done} / {progress.total}
          </p>
        ) : (
          <>
            <p className="text-sm text-muted-foreground">
              クリックしてページ画像を追加（複数選択できます）
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              ファイル名の順に後ろへ追加されます。1枚目が表紙になります
            </p>
          </>
        )}
      </div>

      {errorMessage && (
        <p className="text-sm text-destructive">{errorMessage}</p>
      )}

      {pages.length > 0 && (
        <ol className="grid grid-cols-3 sm:grid-cols-4 gap-3">
          {pages.map((url, index) => (
            <li key={`${url}-${index}`} className="space-y-1">
              <div className="relative aspect-[3/4] rounded border border-border bg-muted overflow-hidden">
                <img
                  src={url}
                  alt={`${index + 1}ページ目`}
                  className="w-full h-full object-contain"
                />
                {index === 0 && (
                  <span className="absolute top-1 left-1 text-[10px] bg-accent text-accent-foreground px-1.5 py-0.5 rounded">
                    表紙
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between gap-1">
                <span className="text-xs text-muted-foreground">
                  {index + 1}
                </span>
                <div className="flex gap-0.5">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    disabled={index === 0}
                    onClick={() => move(index, -1)}
                    aria-label={`${index + 1}ページ目を前へ`}
                  >
                    <ArrowUp className="w-3 h-3" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    disabled={index === pages.length - 1}
                    onClick={() => move(index, 1)}
                    aria-label={`${index + 1}ページ目を後ろへ`}
                  >
                    <ArrowDown className="w-3 h-3" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-destructive hover:text-destructive"
                    onClick={() => remove(index)}
                    aria-label={`${index + 1}ページ目を外す`}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
