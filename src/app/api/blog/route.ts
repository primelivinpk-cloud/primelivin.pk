import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { blogPosts } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { getPublishedPosts, getAllPosts } from "@/lib/queries";
import { newId, slugify } from "@/lib/format";
import { validateBlogPayload } from "@/lib/validations/blog";

/**
 * GET /api/blog?status=published|all&limit=&offset=
 * Defaults to published posts only.
 */
export async function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams;
  const status = sp.get("status") ?? "published";
  const limit = sp.get("limit") ? Math.min(Number(sp.get("limit")), 100) : undefined;
  const offset = sp.get("offset") ? Number(sp.get("offset")) : undefined;

  let items = status === "all" ? await getAllPosts() : await getPublishedPosts();
  const total = items.length;
  if (offset) items = items.slice(offset);
  if (limit) items = items.slice(0, limit);

  return NextResponse.json({ items, total, limit, offset });
}

/**
 * POST /api/blog — create a post.
 */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = validateBlogPayload(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const data = parsed.data;
  const slug = data.slug && data.slug.length > 0 ? data.slug : slugify(data.title);

  const existing = await db
    .select({ id: blogPosts.id })
    .from(blogPosts)
    .where(eq(blogPosts.slug, slug))
    .limit(1);
  if (existing.length > 0) {
    return NextResponse.json({ error: "Slug already in use" }, { status: 409 });
  }

  const id = newId("post");
  const now = new Date();
  await db.insert(blogPosts).values({
    id,
    title: data.title,
    slug,
    excerpt: data.excerpt || null,
    content: data.content,
    coverImage: data.coverImage || null,
    category: data.category || null,
    tags: data.tags ? data.tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
    seoTitle: data.seoTitle || null,
    seoDescription: data.seoDescription || null,
    status: data.status ?? "draft",
    createdAt: now,
    updatedAt: now,
  });

  return NextResponse.json({ id, slug }, { status: 201 });
}
