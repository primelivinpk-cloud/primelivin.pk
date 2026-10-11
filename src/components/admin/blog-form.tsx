"use client";

import { useState, useTransition, type ChangeEvent } from "react";
import { useActionState } from "react";
import { useRouter } from "next/navigation";
import type { BlogPost } from "@/lib/schema";
import { createPost, updatePost, type BlogActionState } from "@/app/actions/blog";

type Props = { post?: BlogPost };

const initial: BlogActionState = {};

export function BlogForm({ post }: Props) {
  const router = useRouter();
  const isEdit = Boolean(post);

  const [coverImage, setCoverImage] = useState<string>(post?.coverImage ?? "");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const boundAction = post ? updatePost.bind(null, post.id) : createPost;
  const [state, formAction] = useActionState(boundAction, initial);

  async function handleUpload(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError(null);
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("folder", "blog");

      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      setCoverImage(data.url);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    fd.set("coverImage", coverImage);
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
        <section className="rounded-2xl border border-border p-6">
          <h2 className="font-semibold">Post</h2>

          <Field label="Title" error={err("title")}>
            <input
              name="title"
              defaultValue={post?.title ?? ""}
              required
              className={inputCls}
              placeholder="e.g. Furniture Buying Guide for Pakistani Homes"
            />
          </Field>

          <Field label="Slug" error={err("slug")} hint="Leave blank to auto-generate">
            <input
              name="slug"
              defaultValue={post?.slug ?? ""}
              className={inputCls}
              placeholder="furniture-buying-guide-pakistan"
            />
          </Field>

          <Field label="Excerpt" error={err("excerpt")} hint="Shown on blog cards, ≤ 240 chars">
            <textarea
              name="excerpt"
              defaultValue={post?.excerpt ?? ""}
              rows={2}
              className={inputCls}
              placeholder="One or two sentence summary"
            />
          </Field>

          <Field label="Content" error={err("content")}>
            <textarea
              name="content"
              defaultValue={post?.content ?? ""}
              required
              rows={14}
              className={inputCls}
              placeholder="Write the post. Use blank lines between paragraphs."
            />
          </Field>
        </section>

        <section className="rounded-2xl border border-border p-6">
          <h2 className="font-semibold">SEO</h2>
          <Field label="SEO title" error={err("seoTitle")}>
            <input
              name="seoTitle"
              defaultValue={post?.seoTitle ?? ""}
              className={inputCls}
              placeholder="Recommended ≤ 60 characters"
            />
          </Field>
          <Field label="SEO description" error={err("seoDescription")}>
            <textarea
              name="seoDescription"
              defaultValue={post?.seoDescription ?? ""}
              rows={3}
              className={inputCls}
              placeholder="Recommended ≤ 160 characters"
            />
          </Field>
        </section>
      </div>

      <div className="space-y-6">
        <section className="rounded-2xl border border-border p-6">
          <h2 className="font-semibold">Publish</h2>
          <div className="mt-4 space-y-2">
            <label className="flex items-center gap-3">
              <input
                type="radio"
                name="status"
                value="draft"
                defaultChecked={!post || post.status === "draft"}
                className="h-4 w-4 accent-brand"
              />
              <span className="text-sm">Draft (hidden from visitors)</span>
            </label>
            <label className="flex items-center gap-3">
              <input
                type="radio"
                name="status"
                value="published"
                defaultChecked={post?.status === "published"}
                className="h-4 w-4 accent-brand"
              />
              <span className="text-sm">Published (live)</span>
            </label>
          </div>
          {err("status")}
        </section>

        <section className="rounded-2xl border border-border p-6">
          <h2 className="font-semibold">Details</h2>
          <Field label="Category" error={err("category")}>
            <input
              name="category"
              defaultValue={post?.category ?? ""}
              className={inputCls}
              placeholder="Buying Guides"
            />
          </Field>
          <Field label="Tags" error={err("tags")} hint="Comma-separated">
            <input
              name="tags"
              defaultValue={post?.tags?.join(", ") ?? ""}
              className={inputCls}
              placeholder="pakistan, furniture, buying-guide"
            />
          </Field>
        </section>

        <section className="rounded-2xl border border-border p-6">
          <h2 className="font-semibold">Cover image</h2>
          <p className="mt-1 text-xs text-muted">Uploaded to Vercel Blob.</p>

          <div className="mt-4 space-y-3">
            {coverImage && (
              <div className="relative aspect-video overflow-hidden rounded-lg border border-border">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={coverImage} alt="" className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={() => setCoverImage("")}
                  className="absolute right-1 top-1 rounded-full bg-black/60 px-2 py-0.5 text-xs text-white"
                  aria-label="Remove cover image"
                >
                  ✕
                </button>
              </div>
            )}

            <label className="flex cursor-pointer items-center justify-center rounded-lg border border-dashed border-border px-4 py-3 text-sm text-muted transition-colors hover:border-brand hover:text-foreground">
              {uploading ? "Uploading…" : coverImage ? "Replace image" : "Upload image"}
              <input
                type="file"
                accept="image/*"
                onChange={handleUpload}
                disabled={uploading}
                className="hidden"
              />
            </label>

            <input
              name="coverImageUrl"
              defaultValue={coverImage}
              onBlur={(e) => setCoverImage(e.target.value.trim())}
              className={inputCls}
              placeholder="…or paste an image URL"
            />
          </div>

          {uploadError && <p className="mt-2 text-xs text-red-500">{uploadError}</p>}
        </section>

        <section className="rounded-2xl border border-border p-6">
          {state.message && (
            <p className={`mb-4 text-sm ${state.success ? "text-green-600" : "text-red-500"}`}>
              {state.message}
            </p>
          )}
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={pending || uploading}
              className="flex-1 rounded-lg bg-brand px-5 py-3 text-sm font-semibold text-brand-fg transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {pending ? "Saving…" : isEdit ? "Save changes" : "Create post"}
            </button>
            <button
              type="button"
              onClick={() => router.push("/admin/blog")}
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
