import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { products } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { getProducts, countProducts, type ProductSort } from "@/lib/queries";
import { newId, slugify } from "@/lib/format";
import { validateProductPayload } from "@/lib/validations/product";

const SORTS: ProductSort[] = ["newest", "price-asc", "price-desc", "title"];

/**
 * GET /api/products?category=&search=&sort=&minPrice=&maxPrice=&limit=&offset=&featured=
 */
export async function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams;

  const category = sp.get("category") ?? undefined;
  const search = sp.get("search") ?? undefined;
  const sortParam = (sp.get("sort") as ProductSort) ?? "newest";
  const sort = SORTS.includes(sortParam) ? sortParam : "newest";
  const minPrice = sp.get("minPrice") ? Number(sp.get("minPrice")) : undefined;
  const maxPrice = sp.get("maxPrice") ? Number(sp.get("maxPrice")) : undefined;
  const limit = sp.get("limit") ? Math.min(Number(sp.get("limit")), 100) : undefined;
  const offset = sp.get("offset") ? Number(sp.get("offset")) : undefined;
  const featured = sp.get("featured") === "true";

  const query = {
    category,
    search,
    sort,
    minPrice: Number.isFinite(minPrice) ? minPrice : undefined,
    maxPrice: Number.isFinite(maxPrice) ? maxPrice : undefined,
    limit,
    offset,
    featured: featured || undefined,
  };

  const [items, total] = await Promise.all([getProducts(query), countProducts(query)]);

  return NextResponse.json({ items, total, limit, offset });
}

/**
 * POST /api/products — create a product.
 */
export async function POST(request: Request) {
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

  const existing = await db
    .select({ id: products.id })
    .from(products)
    .where(eq(products.slug, slug))
    .limit(1);
  if (existing.length > 0) {
    return NextResponse.json({ error: "Slug already in use" }, { status: 409 });
  }

  const id = newId("prod");
  const now = new Date();
  const values = {
    id,
    title: data.title,
    slug,
    description: data.description,
    shortDescription: data.shortDescription || null,
    price: data.price,
    compareAtPrice: data.compareAtPrice ?? null,
    currency: "PKR",
    categorySlug: data.categorySlug,
    tags: data.tags ? data.tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
    sku: data.sku || null,
    stockQuantity: data.stockQuantity ?? 0,
    images: data.images ?? [],
    seoTitle: data.seoTitle || null,
    seoDescription: data.seoDescription || null,
    isFeatured: Boolean(data.isFeatured),
    isActive: data.isActive !== false,
    createdAt: now,
    updatedAt: now,
  };

  await db.insert(products).values(values);

  return NextResponse.json({ id, slug }, { status: 201 });
}
