import { z } from "zod";
import { adminProcedure, router } from "./_core/trpc";
import { storagePut } from "./storage";
import { nanoid } from "nanoid";

// storagePut は path.join でキーを解決するため、ファイル名に "../" や区切り文字が混ざると
// アップロード先ディレクトリの外へ書き込めてしまう。保存前に落としておく。
function sanitizeFileName(fileName: string) {
  const cleaned = fileName
    .replace(/[/\\]/g, "_")
    .replace(/\.{2,}/g, "_")
    .trim()
    .slice(0, 100);
  return cleaned || "upload";
}

export const uploadRouter = router({
  image: adminProcedure
    .input(
      z.object({
        fileName: z.string(),
        fileData: z.string(), // base64 encoded
        contentType: z
          .string()
          .regex(/^image\//, "画像ファイルのみアップロードできます")
          .default("image/jpeg"),
      })
    )
    .mutation(async ({ input }) => {
      try {
        // Decode base64 to buffer
        const buffer = Buffer.from(input.fileData, "base64");

        // Generate unique filename
        const fileKey = `uploads/${nanoid()}-${sanitizeFileName(input.fileName)}`;

        // Upload to S3
        const result = await storagePut(fileKey, buffer, input.contentType);

        return {
          success: true,
          url: result.url,
          key: result.key,
        };
      } catch (error) {
        console.error("Upload error:", error);
        throw new Error("Failed to upload image");
      }
    }),
});
