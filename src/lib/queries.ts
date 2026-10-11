import { cache } from "react";
import { db } from "./db";
import {
  products,
  categories,
  blogPosts,
  orders,
  type Product,
  type BlogPost,
  type Category,
} from "./schema";
import { eq, and, desc, asc, sql, gte, lte, or, like } from "drizzle-orm";

// ---------- Products ----------

export type ProductSort = "newest" | "price-asc" | "price-desc" | "title";

export type ProductQuery = {
  category?: string;
  featured?: boolean;
  limit?: number;
  offset?: number;
  search?: string;
  sort?: ProductSort;
  minPrice?: number;
  maxPrice?: number;
  includeInactive?: boolean;
};

/** Get products with filtering, search, sorting and pagination. */
export const getProducts = cache(async (opts: ProductQuery = {}): Promise<Product[]> => {
  const conditions = [];

  if (!opts.includeInactive) {
    conditions.push(eq(products.isActive, true));
  }
  if (opts.category) conditions.push(eq(products.categorySlug, opts.category));
  if (opts.featured) conditions.push(eq(products.isFeatured, true));
  if (opts.search) {
    const term = `%${opts.search}%`;
    conditions.push(
      or(like(products.title, term), like(products.description, term), like(products.sku, term))
    );
  }
  if (typeof opts.minPrice === "number") conditions.push(gte(products.price, opts.minPrice));
  if (typeof opts.maxPrice === "number") conditions.push(lte(products.price, opts.maxPrice));

  const where = conditions.length ? and(...conditions) : undefined;

  const sort = opts.sort ?? "newest";
  const order =
    sort === "price-asc"
      ? asc(products.price)
      : sort === "price-desc"
        ? desc(products.price)
        : sort === "title"
          ? asc(products.title)
          : desc(products.createdAt);

  let query = db.select().from(products).where(where).orderBy(order);

  if (opts.offset) query = query.offset(opts.offset) as typeof query;
  if (opts.limit) query = query.limit(opts.limit) as typeof query;

  return (await query) as Product[];
});

/** Count products matching a filter (for pagination). */
export const countProducts = cache(async (opts: ProductQuery = {}): Promise<number> => {
  const conditions = [];
  if (!opts.includeInactive) conditions.push(eq(products.isActive, true));
  if (opts.category) conditions.push(eq(products.categorySlug, opts.category));
  if (opts.search) {
    const term = `%${opts.search}%`;
    conditions.push(
      or(like(products.title, term), like(products.description, term), like(products.sku, term))
    );
  }
  if (typeof opts.minPrice === "number") conditions.push(gte(products.price, opts.minPrice));
  if (typeof opts.maxPrice === "number") conditions.push(lte(products.price, opts.maxPrice));

  const where = conditions.length ? and(...conditions) : undefined;
  const rows = await db.select({ count: sql<number>`count(*)` }).from(products).where(where);
  return rows[0]?.count ?? 0;
});

/** Get a single product by slug. Pass includeInactive for admin use. */
export const getProductBySlug = cache(
  async (slug: string, includeInactive = false): Promise<Product | null> => {
    const conditions = [eq(products.slug, slug)];
    if (!includeInactive) conditions.push(eq(products.isActive, true));
    const rows = await db.select().from(products).where(and(...conditions)).limit(1);
    return (rows[0] ?? null) as Product | null;
  }
);

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

/** Admin: recent products regardless of status. */
export const getAllProducts = cache(
  async (opts: { limit?: number; offset?: number } = {}): Promise<Product[]> => {
    let query = db.select().from(products).orderBy(desc(products.createdAt));
    if (opts.offset) query = query.offset(opts.offset) as typeof query;
    if (opts.limit) query = query.limit(opts.limit) as typeof query;
    return (await query) as Product[];
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

export const getStoreStats = cache(async () => {
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

/** Admin dashboard stats. */
export const getAdminStats = cache(async () => {
  const totalProducts = await db.select({ count: sql<number>`count(*)` }).from(products);
  const activeProducts = await db
    .select({ count: sql<number>`count(*)` })
    .from(products)
    .where(eq(products.isActive, true));
  const featuredProducts = await db
    .select({ count: sql<number>`count(*)` })
    .from(products)
    .where(eq(products.isFeatured, true));
  const outOfStock = await db
    .select({ count: sql<number>`count(*)` })
    .from(products)
    .where(lte(products.stockQuantity, 0));
  const inventoryValue = await db
    .select({ total: sql<number>`coalesce(sum(price * stock_quantity), 0)` })
    .from(products);
  const publishedPosts = await db
    .select({ count: sql<number>`count(*)` })
    .from(blogPosts)
    .where(eq(blogPosts.status, "published"));
  const totalOrders = await db.select({ count: sql<number>`count(*)` }).from(orders);

  return {
    totalProducts: totalProducts[0]?.count ?? 0,
    activeProducts: activeProducts[0]?.count ?? 0,
    featuredProducts: featuredProducts[0]?.count ?? 0,
    outOfStock: outOfStock[0]?.count ?? 0,
    inventoryValue: inventoryValue[0]?.total ?? 0,
    publishedPosts: publishedPosts[0]?.count ?? 0,
    totalOrders: totalOrders[0]?.count ?? 0,
  };
});
