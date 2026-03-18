import { useState, useRef } from "react";
import { Upload, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";

const ALLOWED_TYPES = ["image/png", "image/jpeg"] as const;
type AllowedType = (typeof ALLOWED_TYPES)[number];

interface ImageUploaderProps {
  onImageUrl?: (url: string, key: string) => void;
  maxSizeMB?: number;
  currentImageUrl?: string;
}

export default function ImageUploader({
  onImageUrl,
  maxSizeMB = 10,
  currentImageUrl,
}: ImageUploaderProps) {
  const [preview, setPreview] = useState<string | null>(currentImageUrl ?? null);
  const [fileName, setFileName] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadMutation = trpc.upload.image.useMutation();

  const handleFileSelect = async (file: File) => {
    if (!ALLOWED_TYPES.includes(file.type as AllowedType)) {
      setErrorMessage("PNG または JPG ファイルを選択してください");
      setStatus("error");
      return;
    }

    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxSizeMB) {
      setErrorMessage(`ファイルサイズは ${maxSizeMB}MB 以下にしてください`);
      setStatus("error");
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      const dataUrl = e.target?.result as string;
      setPreview(dataUrl);
      setFileName(file.name);
      setErrorMessage("");
      setStatus("idle");
      await uploadToServer(file, dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const uploadToServer = async (file: File, dataUrl: string) => {
    setIsUploading(true);
    try {
      const base64Data = dataUrl.split(",")[1];
      const result = await uploadMutation.mutateAsync({
        fileName: file.name,
        fileData: base64Data,
        contentType: file.type as AllowedType,
        fileSizeBytes: file.size,
      });
      setStatus("success");
      onImageUrl?.(result.url, result.key);
      setTimeout(() => setStatus("idle"), 2000);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "アップロードエラーが発生しました"
      );
      setStatus("error");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files.length > 0) handleFileSelect(e.dataTransfer.files[0]);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.currentTarget.files?.[0]) handleFileSelect(e.currentTarget.files[0]);
  };

  const handleClear = () => {
    setPreview(null);
    setFileName("");
    setStatus("idle");
    setErrorMessage("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="space-y-4">
      <div
        onClick={() => fileInputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isUploading
            ? "border-muted bg-muted/30"
            : status === "success"
              ? "border-green-500 bg-green-50"
              : status === "error"
                ? "border-red-500 bg-red-50"
                : "border-border hover:bg-muted/50"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png, image/jpeg"
          onChange={handleFileInputChange}
          className="hidden"
        />

        {isUploading ? (
          <>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">アップロード中...</p>
          </>
        ) : status === "success" ? (
          <>
            <Check className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <p className="text-sm text-green-700 font-medium">アップロード完了</p>
          </>
        ) : status === "error" ? (
          <>
            <X className="w-8 h-8 text-red-500 mx-auto mb-2" />
            <p className="text-sm text-red-700">{errorMessage}</p>
            <p className="text-xs text-muted-foreground mt-1">クリックして再試行</p>
          </>
        ) : (
          <>
            <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              クリックまたはドラッグ＆ドロップで画像を選択
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              PNG・JPG のみ（最大 {maxSizeMB}MB）
            </p>
          </>
        )}
      </div>

      {preview && status !== "error" && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-foreground">プレビュー</p>
          <div className="relative rounded-lg overflow-hidden border border-border">
            <img
              src={preview}
              alt="Preview"
              className="w-full h-auto max-h-64 object-cover"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => { e.stopPropagation(); handleClear(); }}
              className="absolute top-2 right-2 bg-background/80 hover:bg-background"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          {fileName && <p className="text-xs text-muted-foreground">{fileName}</p>}
        </div>
      )}
    </div>
  );
}
