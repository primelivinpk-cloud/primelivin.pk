"use client";

import { useState, useTransition, type ChangeEvent } from "react";
import { useActionState } from "react";
import { useRouter } from "next/navigation";
import type { Category, Product } from "@/lib/schema";
import { createProduct, updateProduct, type ProductActionState } from "@/app/actions/products";

type Props = {
  categories: Category[];
  product?: Product;
};

const initial: ProductActionState = {};

export function ProductForm({ categories, product }: Props) {
  const router = useRouter();
  const isEdit = Boolean(product);

  const [images, setImages] = useState<string[]>(product?.images ?? []);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const boundAction = product
    ? updateProduct.bind(null, product.id)
    : createProduct;

  const [state, formAction] = useActionState(boundAction, initial);

  async function handleUpload(e: ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadError(null);
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        const fd = new FormData();
        fd.append("file", file);
        fd.append("folder", "products");

        const res = await fetch("/api/upload", { method: "POST", body: fd });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Upload failed");
        setImages((prev) => [...prev, data.url]);
      }
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  function removeImage(url: string) {
    setImages((prev) => prev.filter((u) => u !== url));
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    fd.set("images", JSON.stringify(images));
    startTransition(() => {
      formAction(fd);
    });
  }

  const err = (field: string) =>
    state.errors?.[field] ? (
      <p className="mt-1 text-xs text-red-500">{state.errors[field]}</p>
    ) : null;

  return (
    <form onSubmit={handleSubmit} className="grid gap-8 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        {/* Basics */}
        <section className="rounded-2xl border border-border p-6">
          <h2 className="font-semibold">Basics</h2>

          <Field label="Title" error={err("title")}>
            <input
              name="title"
              defaultValue={product?.title ?? ""}
              required
              className={inputCls}
              placeholder="e.g. Prime Ergonomic Office Chair"
            />
          </Field>

          <Field label="Slug" error={err("slug")} hint="Leave blank to auto-generate from title">
            <input
              name="slug"
              defaultValue={product?.slug ?? ""}
              className={inputCls}
              placeholder="prime-ergonomic-office-chair"
            />
          </Field>

          <Field label="Description" error={err("description")}>
            <textarea
              name="description"
              defaultValue={product?.description ?? ""}
              required
              rows={5}
              className={inputCls}
              placeholder="Describe the product, materials, dimensions, use case…"
            />
          </Field>

          <Field label="Short description" error={err("shortDescription")}>
            <input
              name="shortDescription"
              defaultValue={product?.shortDescription ?? ""}
              className={inputCls}
              placeholder="One-line summary shown on cards"
            />
          </Field>
        </section>

        {/* Pricing */}
        <section className="rounded-2xl border border-border p-6">
          <h2 className="font-semibold">Pricing</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Price (PKR)" error={err("price")}>
              <input
                name="price"
                type="number"
                min="0"
                step="1"
                defaultValue={product?.price ?? ""}
                required
                className={inputCls}
              />
            </Field>
            <Field label="Compare-at price (PKR)" error={err("compareAtPrice")}>
              <input
                name="compareAtPrice"
                type="number"
                min="0"
                step="1"
                defaultValue={product?.compareAtPrice ?? ""}
                className={inputCls}
                placeholder="Optional"
              />
            </Field>
          </div>
        </section>

        {/* Inventory */}
        <section className="rounded-2xl border border-border p-6">
          <h2 className="font-semibold">Inventory</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Category" error={err("categorySlug")}>
              <select
                name="categorySlug"
                defaultValue={product?.categorySlug ?? ""}
                required
                className={inputCls}
              >
                <option value="" disabled>
                  Select a category
                </option>
                {categories.map((c) => (
                  <option key={c.id} value={c.slug}>
                    {c.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Stock quantity" error={err("stockQuantity")}>
              <input
                name="stockQuantity"
                type="number"
                min="0"
                step="1"
                defaultValue={product?.stockQuantity ?? 0}
                className={inputCls}
              />
            </Field>
            <Field label="SKU" error={err("sku")}>
              <input
                name="sku"
                defaultValue={product?.sku ?? ""}
                className={inputCls}
                placeholder="PL-OFC-001"
              />
            </Field>
            <Field label="Tags" error={err("tags")} hint="Comma-separated">
              <input
                name="tags"
                defaultValue={product?.tags?.join(", ") ?? ""}
                className={inputCls}
                placeholder="ergonomic, office, mesh"
              />
            </Field>
          </div>
        </section>

        {/* SEO */}
        <section className="rounded-2xl border border-border p-6">
          <h2 className="font-semibold">SEO</h2>
          <Field label="SEO title" error={err("seoTitle")}>
            <input
              name="seoTitle"
              defaultValue={product?.seoTitle ?? ""}
              className={inputCls}
              placeholder="Recommended ≤ 60 characters"
            />
          </Field>
          <Field label="SEO description" error={err("seoDescription")}>
            <textarea
              name="seoDescription"
              defaultValue={product?.seoDescription ?? ""}
              rows={3}
              className={inputCls}
              placeholder="Recommended ≤ 160 characters"
            />
          </Field>
        </section>
      </div>

      {/* Sidebar */}
      <div className="space-y-6">
        <section className="rounded-2xl border border-border p-6">
          <h2 className="font-semibold">Status</h2>
          <label className="mt-4 flex items-center gap-3">
            <input
              type="checkbox"
              name="isActive"
              defaultChecked={product ? product.isActive : true}
              className="h-4 w-4 rounded border-border"
            />
            <span className="text-sm">Active (visible in store)</span>
          </label>
          <label className="mt-3 flex items-center gap-3">
            <input
              type="checkbox"
              name="isFeatured"
              defaultChecked={product?.isFeatured ?? false}
              className="h-4 w-4 rounded border-border"
            />
            <span className="text-sm">Featured on homepage</span>
          </label>
        </section>

        <section className="rounded-2xl border border-border p-6">
          <h2 className="font-semibold">Images</h2>
          <p className="mt-1 text-xs text-muted">
            Uploaded to Vercel Blob. First image is the main one.
          </p>

          <div className="mt-4 grid grid-cols-3 gap-2">
            {images.map((url, i) => (
              <div key={url + i} className="group relative aspect-square overflow-hidden rounded-lg border border-border">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt="" className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeImage(url)}
                  className="absolute right-1 top-1 rounded-full bg-black/60 px-2 py-0.5 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100"
                  aria-label="Remove image"
                >
                  ✕
                </button>
              </div>
            ))}

            <label className="flex aspect-square cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-border text-xs text-muted transition-colors hover:border-brand hover:text-foreground">
              <span className="text-lg">+</span>
              <span>{uploading ? "Uploading…" : "Add"}</span>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleUpload}
                disabled={uploading}
                className="hidden"
              />
            </label>
          </div>

          {uploadError && <p className="mt-2 text-xs text-red-500">{uploadError}</p>}
        </section>

        <section className="rounded-2xl border border-border p-6">
          {state.message && (
            <p
              className={`mb-4 text-sm ${state.success ? "text-green-600" : "text-red-500"}`}
            >
              {state.message}
            </p>
          )}
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={pending || uploading}
              className="flex-1 rounded-lg bg-brand px-5 py-3 text-sm font-semibold text-brand-fg transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {pending ? "Saving…" : isEdit ? "Save changes" : "Create product"}
            </button>
            <button
              type="button"
              onClick={() => router.push("/admin/products")}
              className="rounded-lg border border-border px-5 py-3 text-sm font-semibold transition-colors hover:border-brand"
            >
              Cancel
            </button>
          </div>
        </section>
      </div>
    </form>
  );
}

const inputCls =
  "w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none transition-colors focus:border-brand";

function Field({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: string;
  error?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <label className="mt-4 block first:mt-0">
      <span className="text-sm font-medium">{label}</span>
      {hint && <span className="ml-2 text-xs text-muted">{hint}</span>}
      <div className="mt-1.5">{children}</div>
      {error}
    </label>
  );
}
