import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { blogPosts } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { getPostById } from "@/lib/queries";
import { slugify } from "@/lib/format";
import { validateBlogPayload } from "@/lib/validations/blog";

type Ctx = { params: Promise<{ id: string }> };

/** GET /api/blog/[id] */
export async function GET(_req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const post = await getPostById(id);
  if (!post) return NextResponse.json({ error: "Post not found" }, { status: 404 });
  return NextResponse.json(post);
}

/** PUT /api/blog/[id] */
export async function PUT(request: Request, { params }: Ctx) {
  const { id } = await params;
  const current = await getPostById(id);
  if (!current) return NextResponse.json({ error: "Post not found" }, { status: 404 });

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

  if (slug !== current.slug) {
    const clash = await db
      .select({ id: blogPosts.id })
      .from(blogPosts)
      .where(eq(blogPosts.slug, slug))
      .limit(1);
    if (clash.length > 0 && clash[0].id !== id) {
      return NextResponse.json({ error: "Slug already in use" }, { status: 409 });
    }
  }

  await db
    .update(blogPosts)
    .set({
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
      updatedAt: new Date(),
    })
    .where(eq(blogPosts.id, id));

  const updated = await getPostById(id);
  return NextResponse.json(updated);
}

/** DELETE /api/blog/[id] */
export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const current = await getPostById(id);
  if (!current) return NextResponse.json({ error: "Post not found" }, { status: 404 });

  await db.delete(blogPosts).where(eq(blogPosts.id, id));
  return NextResponse.json({ success: true });
}
