import { put, del, list } from "@vercel/blob";
import { env } from "./env";

const token = env.BLOB_READ_WRITE_TOKEN ?? process.env.BLOB_READ_WRITE_TOKEN;

/**
 * Upload a file to Vercel Blob and return its public URL.
 */
export async function uploadImage(
  file: File | Blob,
  filename: string
): Promise<string> {
  const blob = await put(filename, file, {
    access: "public",
    token,
    allowOverwrite: true,
  });
  return blob.url;
}

/**
 * Delete a blob by URL. Returns true if deleted.
 */
export async function deleteImage(url: string): Promise<boolean> {
  await del(url, { token });
  return true;
}

/**
 * List all blobs under an optional prefix.
 */
export async function listImages(prefix?: string) {
  const { blobs } = await list({ prefix, token });
  return blobs;
}

/**
 * Generate a safe, unique filename for an uploaded product image.
 */
export function imageFilename(productSlug: string, ext = "webp"): string {
  const unique = Math.random().toString(36).slice(2, 10);
  return `products/${productSlug}-${unique}.${ext}`;
}
