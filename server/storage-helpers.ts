import { storagePut, storageGet } from "./storage";
import { nanoid } from "nanoid";

export async function uploadArtworkImage(
  buffer: Buffer,
  userId: number,
  filename: string
): Promise<{ url: string; key: string }> {
  const fileKey = `artworks/${userId}/${nanoid()}-${filename}`;
  const result = await storagePut(fileKey, buffer, "image/jpeg");
  return result;
}

export async function uploadProductImage(
  buffer: Buffer,
  userId: number,
  filename: string
): Promise<{ url: string; key: string }> {
  const fileKey = `products/${userId}/${nanoid()}-${filename}`;
  const result = await storagePut(fileKey, buffer, "image/jpeg");
  return result;
}

export async function uploadProductFile(
  buffer: Buffer,
  userId: number,
  filename: string,
  mimeType: string
): Promise<{ url: string; key: string }> {
  const fileKey = `product-files/${userId}/${nanoid()}-${filename}`;
  const result = await storagePut(fileKey, buffer, mimeType);
  return result;
}

export async function uploadProfileImage(
  buffer: Buffer,
  userId: number,
  filename: string
): Promise<{ url: string; key: string }> {
  const fileKey = `profiles/${userId}/${nanoid()}-${filename}`;
  const result = await storagePut(fileKey, buffer, "image/jpeg");
  return result;
}

export async function getSignedUrl(
  fileKey: string
): Promise<string> {
  const result = await storageGet(fileKey);
  return result.url;
}
