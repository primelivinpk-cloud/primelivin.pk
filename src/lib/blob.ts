import { put, del, list } from "@vercel/blob";

/**
 * Resolve Blob auth.
 * - On Vercel: use `storeId` + automatic OIDC auth (no token needed).
 * - Locally / outside Vercel: fall back to the read-write token.
 */
function blobAuth(): { storeId?: string; token?: string } {
  const storeId = process.env.BLOB_STORE_ID ?? process.env.BLOB_PK_STORE_ID;
  const token = process.env.BLOB_READ_WRITE_TOKEN;

  // Vercel injects VERCEL_OIDC_TOKEN; prefer storeId there.
  if (process.env.VERCEL && storeId) return { storeId };
  if (token) return { token };
  if (storeId) return { storeId };
  return {};
}

/**
 * Upload a file to Vercel Blob and return its public URL.
 */
export async function uploadImage(
  file: File | Blob,
  filename: string
): Promise<string> {
  const blob = await put(filename, file, {
    access: "public",
    allowOverwrite: true,
    ...blobAuth(),
  });
  return blob.url;
}

/**
 * Delete a blob by URL. Returns true if deleted.
 */
export async function deleteImage(url: string): Promise<boolean> {
  await del(url, blobAuth());
  return true;
}

/**
 * List all blobs under an optional prefix.
 */
export async function listImages(prefix?: string) {
  const { blobs } = await list({ prefix, ...blobAuth() });
  return blobs;
}

/**
 * Generate a safe, unique filename for an uploaded product image.
 */
export function imageFilename(productSlug: string, ext = "webp"): string {
  const unique = Math.random().toString(36).slice(2, 10);
  return `products/${productSlug}-${unique}.${ext}`;
}
