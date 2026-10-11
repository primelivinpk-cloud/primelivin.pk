"use server";

import { db } from "@/lib/db";
import { blogPosts } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { parseBlogForm, blogFormErrors } from "@/lib/validations/blog";
import { newId, slugify } from "@/lib/format";
import { getPostById } from "@/lib/queries";

/** Slug lookup across all statuses (for uniqueness checks). */
async function slugExists(slug: string, exceptId?: string) {
  const rows = await db
    .select({ id: blogPosts.id })
    .from(blogPosts)
    .where(eq(blogPosts.slug, slug))
    .limit(1);
  return rows.length > 0 && rows[0].id !== exceptId;
}

export type BlogActionState = {
  errors?: Record<string, string>;
  message?: string;
  success?: boolean;
  id?: string;
};

function tagsToArray(tags: string | undefined): string[] {
  if (!tags) return [];
  return tags.split(",").map((t) => t.trim()).filter(Boolean);
}

function rowsFromInput(input: {
  title: string;
  slug?: string;
  excerpt?: string;
  content: string;
  coverImage?: string;
  category?: string;
  tags?: string;
  seoTitle?: string;
  seoDescription?: string;
  status?: string;
}) {
  return {
    title: input.title,
    slug: input.slug && input.slug.length > 0 ? input.slug : slugify(input.title),
    excerpt: input.excerpt || null,
    content: input.content,
    coverImage: input.coverImage || null,
    category: input.category || null,
    tags: tagsToArray(input.tags),
    seoTitle: input.seoTitle || null,
    seoDescription: input.seoDescription || null,
    status: input.status === "published" ? ("published" as const) : ("draft" as const),
  };
}

function revalidateBlog() {
  revalidatePath("/");
  revalidatePath("/blog");
  revalidatePath("/admin/blog");
}

/** Create a blog post from the admin form. */
export async function createPost(
  _prev: BlogActionState,
  formData: FormData
): Promise<BlogActionState> {
  const parsed = parseBlogForm(formData);
  if (!parsed.success) {
    return { errors: blogFormErrors(parsed), message: "Please fix the errors below." };
  }

  const data = parsed.data;
  const slug = data.slug && data.slug.length > 0 ? data.slug : slugify(data.title);
  if (await slugExists(slug)) {
    return {
      errors: { slug: "A post with this slug already exists." },
      message: "Please fix the errors below.",
    };
  }

  const id = newId("post");
  await db
    .insert(blogPosts)
    .values({ id, ...rowsFromInput({ ...data, slug }), createdAt: new Date(), updatedAt: new Date() });

  revalidateBlog();
  redirect("/admin/blog");
}

/** Update an existing blog post. */
export async function updatePost(
  id: string,
  _prev: BlogActionState,
  formData: FormData
): Promise<BlogActionState> {
  const parsed = parseBlogForm(formData);
  if (!parsed.success) {
    return { errors: blogFormErrors(parsed), message: "Please fix the errors below." };
  }

  const current = await getPostById(id);
  if (!current) return { message: "Post not found.", success: false };

  const data = parsed.data;
  const slug = data.slug && data.slug.length > 0 ? data.slug : slugify(data.title);
  if (await slugExists(slug, id)) {
    return {
      errors: { slug: "A post with this slug already exists." },
      message: "Please fix the errors below.",
    };
  }

  await db
    .update(blogPosts)
    .set({ ...rowsFromInput({ ...data, slug }), updatedAt: new Date() })
    .where(eq(blogPosts.id, id));

  revalidateBlog();
  if (current.slug !== slug) revalidatePath(`/blog/${current.slug}`);
  revalidatePath(`/blog/${slug}`);
  redirect("/admin/blog");
}

/** Delete a blog post by id. */
export async function deletePost(id: string): Promise<BlogActionState> {
  const current = await getPostById(id);
  if (!current) return { message: "Post not found." };

  await db.delete(blogPosts).where(eq(blogPosts.id, id));

  revalidateBlog();
  revalidatePath(`/blog/${current.slug}`);
  return { success: true, message: "Post deleted." };
}
