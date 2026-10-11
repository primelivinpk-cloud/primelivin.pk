import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { products } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { getProductById } from "@/lib/queries";
import { slugify } from "@/lib/format";
import { validateProductPayload } from "@/lib/validations/product";

type Ctx = { params: Promise<{ id: string }> };

/** GET /api/products/[id] */
export async function GET(_req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const product = await getProductById(id);
  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }
  return NextResponse.json(product);
}

/** PUT /api/products/[id] */
export async function PUT(request: Request, { params }: Ctx) {
  const { id } = await params;
  const current = await getProductById(id);
  if (!current) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = validateProductPayload(body);
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
      .select({ id: products.id })
      .from(products)
      .where(eq(products.slug, slug))
      .limit(1);
    if (clash.length > 0 && clash[0].id !== id) {
      return NextResponse.json({ error: "Slug already in use" }, { status: 409 });
    }
  }

  await db
    .update(products)
    .set({
      title: data.title,
      slug,
      description: data.description,
      shortDescription: data.shortDescription || null,
      price: data.price,
      compareAtPrice: data.compareAtPrice ?? null,
      categorySlug: data.categorySlug,
      tags: data.tags ? data.tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
      sku: data.sku || null,
      stockQuantity: data.stockQuantity ?? 0,
      images: data.images ?? [],
      seoTitle: data.seoTitle || null,
      seoDescription: data.seoDescription || null,
      isFeatured: Boolean(data.isFeatured),
      isActive: data.isActive !== false,
      updatedAt: new Date(),
    })
    .where(eq(products.id, id));

  const updated = await getProductById(id);
  return NextResponse.json(updated);
}

/** DELETE /api/products/[id] */
export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const current = await getProductById(id);
  if (!current) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  await db.delete(products).where(eq(products.id, id));
  return NextResponse.json({ success: true });
}
