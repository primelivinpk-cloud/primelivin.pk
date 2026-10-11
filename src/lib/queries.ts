import { cache } from "react";
import { db } from "./db";
import {
  products,
  categories,
  blogPosts,
  type Product,
  type BlogPost,
  type Category,
} from "./schema";
import { eq, and, desc, sql } from "drizzle-orm";

// ---------- Products ----------

/** Get active products, newest first. */
export const getProducts = cache(
  async (opts?: { category?: string; featured?: boolean; limit?: number }): Promise<Product[]> => {
    const conditions = [eq(products.isActive, true)];
    if (opts?.category) conditions.push(eq(products.categorySlug, opts.category));
    if (opts?.featured) conditions.push(eq(products.isFeatured, true));

    let query = db
      .select()
      .from(products)
      .where(and(...conditions))
      .orderBy(desc(products.createdAt));

    if (opts?.limit) query = query.limit(opts.limit) as typeof query;

    return (await query) as Product[];
  }
);

/** Get a single active product by slug. */
export const getProductBySlug = cache(async (slug: string): Promise<Product | null> => {
  const rows = await db
    .select()
    .from(products)
    .where(and(eq(products.slug, slug), eq(products.isActive, true)))
    .limit(1);
  return (rows[0] ?? null) as Product | null;
});

/** Get a product by id. */
export const getProductById = cache(async (id: string): Promise<Product | null> => {
  const rows = await db.select().from(products).where(eq(products.id, id)).limit(1);
  return (rows[0] ?? null) as Product | null;
});

/** Related products in the same category, excluding the current one. */
export const getRelatedProducts = cache(
  async (categorySlug: string, excludeId: string, limit = 4): Promise<Product[]> => {
    const rows = await db
      .select()
      .from(products)
      .where(and(eq(products.categorySlug, categorySlug), eq(products.isActive, true)))
      .orderBy(desc(products.isFeatured), desc(products.createdAt))
      .limit(limit + 1);
    return rows.filter((p) => p.id !== excludeId).slice(0, limit) as Product[];
  }
);

// ---------- Categories ----------

export const getCategories = cache(async (): Promise<Category[]> => {
  return (await db.select().from(categories).orderBy(categories.name)) as Category[];
});

export const getCategoryBySlug = cache(async (slug: string): Promise<Category | null> => {
  const rows = await db.select().from(categories).where(eq(categories.slug, slug)).limit(1);
  return (rows[0] ?? null) as Category | null;
});

// ---------- Blog ----------

export const getPublishedPosts = cache(async (limit?: number): Promise<BlogPost[]> => {
  let query = db
    .select()
    .from(blogPosts)
    .where(eq(blogPosts.status, "published"))
    .orderBy(desc(blogPosts.createdAt));
  if (limit) query = query.limit(limit) as typeof query;
  return (await query) as BlogPost[];
});

export const getPostBySlug = cache(async (slug: string): Promise<BlogPost | null> => {
  const rows = await db
    .select()
    .from(blogPosts)
    .where(and(eq(blogPosts.slug, slug), eq(blogPosts.status, "published")))
    .limit(1);
  return (rows[0] ?? null) as BlogPost | null;
});

// ---------- Stats ----------

export const getStoreStats = cache(async (): Promise<{ products: number; categories: number }> => {
  const productCount = await db
    .select({ count: sql<number>`count(*)` })
    .from(products)
    .where(eq(products.isActive, true));
  const categoryCount = await db.select({ count: sql<number>`count(*)` }).from(categories);
  return {
    products: productCount[0]?.count ?? 0,
    categories: categoryCount[0]?.count ?? 0,
  };
});
