import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { imageFilename } from "@/lib/blob";

export const runtime = "nodejs";

/** Resolve Blob auth — OIDC+storeId on Vercel, RW token elsewhere. */
function blobAuth() {
  const storeId = process.env.BLOB_STORE_ID ?? process.env.BLOB_PK_STORE_ID;
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (process.env.VERCEL && storeId) return { storeId };
  if (token) return { token };
  if (storeId) return { storeId };
  return {};
}

/**
 * POST /api/upload
 * multipart/form-data with a single `file` field (image).
 * Returns { url }.
 */
export async function POST(request: Request) {
  const auth = blobAuth();
  if (!auth.storeId && !auth.token) {
    return NextResponse.json(
      { error: "Blob storage is not configured (set BLOB_STORE_ID or BLOB_READ_WRITE_TOKEN)" },
      { status: 500 }
    );
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Expected multipart/form-data" }, { status: 400 });
  }

  const file = formData.get("file");
  const folder = (formData.get("folder") as string) || "products";

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  // Validate it's an image and under 5MB
  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "File must be an image" }, { status: 400 });
  }
  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json({ error: "Image must be under 5MB" }, { status: 400 });
  }

  const ext = file.name.split(".").pop()?.toLowerCase() || "webp";
  const filename = `${folder}/${imageFilename(file.name.replace(/\.[^.]+$/, ""), ext)}`;

  try {
    const blob = await put(filename, file, {
      access: "public",
      allowOverwrite: true,
      ...auth,
    });
    return NextResponse.json({ url: blob.url, pathname: blob.pathname });
  } catch (err) {
    console.error("Blob upload failed:", err);
    const message = err instanceof Error ? err.message : "Upload failed";
    if (message.toLowerCase().includes("private store")) {
      return NextResponse.json(
        {
          error:
            "This Blob store is private. Create/use a public store, or set BLOB_STORE_ID to a public store.",
        },
        { status: 500 }
      );
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
