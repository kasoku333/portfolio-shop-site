import { z } from "zod";
import { protectedProcedure, router } from "./_core/trpc";
import { storagePut } from "./storage";
import { nanoid } from "nanoid";
import { TRPCError } from "@trpc/server";

const ALLOWED_TYPES = ["image/png", "image/jpeg"] as const;
const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

export const uploadRouter = router({
  image: protectedProcedure
    .input(
      z.object({
        fileName: z.string(),
        fileData: z.string(), // base64 encoded
        contentType: z.enum(["image/png", "image/jpeg"]),
        fileSizeBytes: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN", message: "管理者のみ画像をアップロードできます" });
      }

      if (input.fileSizeBytes && input.fileSizeBytes > MAX_SIZE_BYTES) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "ファイルサイズは10MB以下にしてください" });
      }

      try {
        const buffer = Buffer.from(input.fileData, "base64");

        const ext = input.contentType === "image/png" ? "png" : "jpg";
        const safeName = input.fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
        const fileKey = `uploads/${nanoid()}-${safeName}`;

        const result = await storagePut(fileKey, buffer, input.contentType);

        return {
          success: true,
          url: result.url,
          key: result.key,
        };
      } catch (error) {
        console.error("Upload error:", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "アップロードに失敗しました" });
      }
    }),
});
