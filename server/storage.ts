// Local file storage for uploaded images
// Saves files to <data dir>/uploads/ and serves them via Express static middleware

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { resolveDataPath } from "./dataDir";

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const UPLOADS_DIR = resolveDataPath("uploads", currentDir);

// Ensure uploads directory exists
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

export async function storagePut(
  relKey: string,
  data: Buffer | Uint8Array | string,
  contentType = "application/octet-stream"
): Promise<{ key: string; url: string }> {
  const key = relKey.replace(/^\/+/, "");
  const filePath = path.resolve(UPLOADS_DIR, key);
  if (!filePath.startsWith(UPLOADS_DIR + path.sep)) {
    throw new Error(`Invalid storage key: ${relKey}`);
  }

  // Ensure subdirectory exists
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  // Write file
  const buffer = typeof data === "string" ? Buffer.from(data) : Buffer.from(data);
  fs.writeFileSync(filePath, buffer);

  // Return URL that will be served by Express static middleware
  const url = `/uploads/${key}`;
  return { key, url };
}

export async function storageGet(relKey: string): Promise<{ key: string; url: string }> {
  const key = relKey.replace(/^\/+/, "");
  return {
    key,
    url: `/uploads/${key}`,
  };
}

export { UPLOADS_DIR };
