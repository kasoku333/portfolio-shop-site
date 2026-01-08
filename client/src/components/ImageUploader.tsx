import { useState, useRef } from "react";
import { Upload, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";

interface ImageUploaderProps {
  onUpload?: (file: File, preview: string) => void;
  onImageUrl?: (url: string) => void;
  maxSize?: number; // in MB
}

export default function ImageUploader({
  onUpload,
  onImageUrl,
  maxSize = 10,
}: ImageUploaderProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<"idle" | "success" | "error">(
    "idle"
  );
  const [errorMessage, setErrorMessage] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadMutation = trpc.upload.image.useMutation();

  const handleFileSelect = async (file: File) => {
    // Validate file type
    if (!file.type.startsWith("image/")) {
      setErrorMessage("画像ファイルを選択してください");
      setUploadStatus("error");
      return;
    }

    // Validate file size
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxSize) {
      setErrorMessage(`ファイルサイズは${maxSize}MB以下にしてください`);
      setUploadStatus("error");
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = async (e) => {
      const previewUrl = e.target?.result as string;
      setPreview(previewUrl);
      setFileName(file.name);
      setErrorMessage("");
      setUploadStatus("idle");

      // Call onUpload callback
      onUpload?.(file, previewUrl);

      // Upload to server
      await uploadToServer(file, previewUrl);
    };
    reader.readAsDataURL(file);
  };

  const uploadToServer = async (file: File, previewUrl: string) => {
    setIsUploading(true);
    try {
      // Convert file to base64
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const base64String = e.target?.result as string;
          const base64Data = base64String.split(",")[1];

          const result = await uploadMutation.mutateAsync({
            fileName: file.name,
            fileData: base64Data,
            contentType: file.type,
          });

          setUploadStatus("success");
          onImageUrl?.(result.url);

          // Reset after 2 seconds
          setTimeout(() => {
            setUploadStatus("idle");
          }, 2000);
        } catch (error) {
          setErrorMessage(
            error instanceof Error ? error.message : "アップロードエラーが発生しました"
          );
          setUploadStatus("error");
        } finally {
          setIsUploading(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "アップロードエラーが発生しました"
      );
      setUploadStatus("error");
      setIsUploading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isUploading
            ? "border-muted bg-muted/30"
            : uploadStatus === "success"
              ? "border-green-500 bg-green-50"
              : uploadStatus === "error"
                ? "border-red-500 bg-red-50"
                : "border-border hover:bg-muted/50"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileInputChange}
          className="hidden"
        />

        {isUploading ? (
          <>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent mx-auto mb-2"></div>
            <p className="text-sm text-muted-foreground">アップロード中...</p>
          </>
        ) : uploadStatus === "success" ? (
          <>
            <Check className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <p className="text-sm text-green-700 font-medium">
              アップロード完了
            </p>
          </>
        ) : uploadStatus === "error" ? (
          <>
            <X className="w-8 h-8 text-red-500 mx-auto mb-2" />
            <p className="text-sm text-red-700">{errorMessage}</p>
          </>
        ) : (
          <>
            <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              クリックして画像をアップロード
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              またはドラッグ&ドロップ (JPG, PNG - 最大 {maxSize}MB)
            </p>
          </>
        )}
      </div>

      {/* Preview */}
      {preview && uploadStatus !== "error" && (
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
              onClick={() => {
                setPreview(null);
                setFileName("");
                setUploadStatus("idle");
                if (fileInputRef.current) {
                  fileInputRef.current.value = "";
                }
              }}
              className="absolute top-2 right-2 bg-background/80 hover:bg-background"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">{fileName}</p>
        </div>
      )}
    </div>
  );
}
