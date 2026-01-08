import { z } from "zod";
import { publicProcedure, router } from "./_core/trpc";
import { storagePut } from "./storage";
import { nanoid } from "nanoid";

export const uploadRouter = router({
  image: publicProcedure
    .input(
      z.object({
        fileName: z.string(),
        fileData: z.string(), // base64 encoded
        contentType: z.string().default("image/jpeg"),
      })
    )
    .mutation(async ({ input }) => {
      try {
        // Decode base64 to buffer
        const buffer = Buffer.from(input.fileData, "base64");

        // Generate unique filename
        const fileKey = `uploads/${nanoid()}-${input.fileName}`;

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
