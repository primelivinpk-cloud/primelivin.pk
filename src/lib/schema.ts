import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

// ---------- Helpers ----------
const timestamps = {
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .notNull()
    .default(sql`(unixepoch() * 1000)`),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" })
    .notNull()
    .default(sql`(unixepoch() * 1000)`),
};

// ---------- Categories ----------
export const categories = sqliteTable("categories", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  ...timestamps,
});

// ---------- Products ----------
export const products = sqliteTable("products", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description").notNull(),
  shortDescription: text("short_description"),

  // Pricing (stored in PKR, integer paisa-free)
  price: real("price").notNull(),
  compareAtPrice: real("compare_at_price"),
  currency: text("currency").notNull().default("PKR"),

  // Catalog
  categorySlug: text("category_slug").notNull(),
  tags: text("tags", { mode: "json" }).$type<string[]>().default([]),
  sku: text("sku"),
  stockQuantity: integer("stock_quantity").notNull().default(0),
  images: text("images", { mode: "json" }).$type<string[]>().default([]),

  // SEO
  seoTitle: text("seo_title"),
  seoDescription: text("seo_description"),

  // Flags
  isFeatured: integer("is_featured", { mode: "boolean" }).notNull().default(false),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),

  // Rating
  rating: real("rating").default(0),
  reviewCount: integer("review_count").default(0),

  ...timestamps,
});

// ---------- Blog Posts ----------
export const blogPosts = sqliteTable("blog_posts", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  excerpt: text("excerpt"),
  content: text("content").notNull(),
  coverImage: text("cover_image"),
  category: text("category"),
  tags: text("tags", { mode: "json" }).$type<string[]>().default([]),

  // SEO
  seoTitle: text("seo_title"),
  seoDescription: text("seo_description"),

  status: text("status", { enum: ["draft", "published"] })
    .notNull()
    .default("draft"),

  ...timestamps,
});

// ---------- Orders ----------
export const orders = sqliteTable("orders", {
  id: text("id").primaryKey(),
  userId: text("user_id"),
  customerName: text("customer_name").notNull(),
  customerEmail: text("customer_email"),
  customerPhone: text("customer_phone").notNull(),

  status: text("status", {
    enum: ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"],
  })
    .notNull()
    .default("pending"),

  totalAmount: real("total_amount").notNull(),
  currency: text("currency").notNull().default("PKR"),

  // Pakistan-specific shipping address
  shippingAddress: text("shipping_address", { mode: "json" }).$type<{
    line1: string;
    line2?: string;
    city: string;
    region: string; // province
    postalCode?: string;
  }>(),

  paymentMethod: text("payment_method"),
  paymentStatus: text("payment_status", {
    enum: ["unpaid", "paid", "refunded"],
  })
    .notNull()
    .default("unpaid"),

  ...timestamps,
});

// ---------- Order Items ----------
export const orderItems = sqliteTable("order_items", {
  id: text("id").primaryKey(),
  orderId: text("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  productId: text("product_id").references(() => products.id),
  title: text("title").notNull(),
  price: real("price").notNull(),
  quantity: integer("quantity").notNull().default(1),
  ...timestamps,
});

// ---------- Cart Items (server-side cart keyed by anonymous cart token) ----------
export const cartItems = sqliteTable("cart_items", {
  id: text("id").primaryKey(),
  cartToken: text("cart_token").notNull(),
  productId: text("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  quantity: integer("quantity").notNull().default(1),
  ...timestamps,
});

// ---------- Users (customer accounts) ----------
export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone"),
  passwordHash: text("password_hash").notNull(),
  role: text("role", { enum: ["customer", "admin"] }).notNull().default("customer"),
  ...timestamps,
});

// ---------- Sessions (opaque cookie token -> user) ----------
export const sessions = sqliteTable("sessions", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expiresAt: integer("expires_at", { mode: "timestamp_ms" }).notNull(),
  ...timestamps,
});

// ---------- Inferred types ----------
export type Category = typeof categories.$inferSelect;
export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;
export type BlogPost = typeof blogPosts.$inferSelect;
export type NewBlogPost = typeof blogPosts.$inferInsert;
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Session = typeof sessions.$inferSelect;
export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;
export type OrderItem = typeof orderItems.$inferSelect;
export type CartItem = typeof cartItems.$inferSelect;
