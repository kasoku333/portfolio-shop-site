import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { adminProcedure, router } from "./_core/trpc";
import { storagePut } from "./storage";
import { nanoid } from "nanoid";

// /uploads は同じオリジンで配信されるので、スクリプトを含み得る SVG や HTML は受け付けない
const ALLOWED_IMAGE_TYPES: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/gif": ".gif",
  "image/webp": ".webp",
  "image/avif": ".avif",
};

export const uploadRouter = router({
  image: adminProcedure
    .input(
      z.object({
        fileName: z.string(),
        fileData: z.string(), // base64 encoded
        contentType: z.string().default("image/jpeg"),
      })
    )
    .mutation(async ({ input }) => {
      const ext = ALLOWED_IMAGE_TYPES[input.contentType];
      if (!ext) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "JPEG・PNG・GIF・WebP・AVIF の画像を選択してください",
        });
      }

      try {
        // Decode base64 to buffer
        const buffer = Buffer.from(input.fileData, "base64");

        // 元のファイル名はパスに使わない（"../" でアップロード先の外に書き込めてしまうため）
        const fileKey = `uploads/${nanoid()}${ext}`;

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
