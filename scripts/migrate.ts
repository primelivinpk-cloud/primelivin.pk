import { loadEnvConfig } from "@next/env";
import { createClient } from "@libsql/client";

loadEnvConfig(process.cwd());

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url) {
  console.error("❌ TURSO_DATABASE_URL is not set");
  process.exit(1);
}

const client = createClient({ url, authToken });

const migrations = [
  `CREATE TABLE IF NOT EXISTS categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000),
    updated_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000)
  );`,

  `CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT NOT NULL,
    short_description TEXT,
    price REAL NOT NULL,
    compare_at_price REAL,
    currency TEXT NOT NULL DEFAULT 'PKR',
    category_slug TEXT NOT NULL,
    tags TEXT DEFAULT '[]',
    sku TEXT,
    stock_quantity INTEGER NOT NULL DEFAULT 0,
    images TEXT DEFAULT '[]',
    seo_title TEXT,
    seo_description TEXT,
    is_featured INTEGER NOT NULL DEFAULT 0,
    is_active INTEGER NOT NULL DEFAULT 1,
    rating REAL DEFAULT 0,
    review_count INTEGER DEFAULT 0,
    created_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000),
    updated_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000)
  );`,

  `CREATE TABLE IF NOT EXISTS blog_posts (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    excerpt TEXT,
    content TEXT NOT NULL,
    cover_image TEXT,
    category TEXT,
    tags TEXT DEFAULT '[]',
    seo_title TEXT,
    seo_description TEXT,
    status TEXT NOT NULL DEFAULT 'draft',
    created_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000),
    updated_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000)
  );`,

  `CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    customer_name TEXT NOT NULL,
    customer_email TEXT,
    customer_phone TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    total_amount REAL NOT NULL,
    currency TEXT NOT NULL DEFAULT 'PKR',
    shipping_address TEXT,
    payment_method TEXT,
    payment_status TEXT NOT NULL DEFAULT 'unpaid',
    created_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000),
    updated_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000)
  );`,

  `CREATE TABLE IF NOT EXISTS order_items (
    id TEXT PRIMARY KEY,
    order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id TEXT REFERENCES products(id),
    title TEXT NOT NULL,
    price REAL NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    created_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000),
    updated_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000)
  );`,

  `CREATE TABLE IF NOT EXISTS cart_items (
    id TEXT PRIMARY KEY,
    cart_token TEXT NOT NULL,
    product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1,
    created_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000),
    updated_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000)
  );`,

  `CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone TEXT,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'customer',
    created_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000),
    updated_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000)
  );`,

  `CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires_at INTEGER NOT NULL,
    created_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000),
    updated_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000)
  );`,

  // Indexes for common lookups
  `CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_slug);`,
  `CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active);`,
  `CREATE INDEX IF NOT EXISTS idx_products_featured ON products(is_featured);`,
  `CREATE INDEX IF NOT EXISTS idx_blog_status ON blog_posts(status);`,
  `CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);`,
  `CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);`,
  `CREATE INDEX IF NOT EXISTS idx_cart_items_token ON cart_items(cart_token);`,
  `CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);`,
  `CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions(expires_at);`,
  `CREATE UNIQUE INDEX IF NOT EXISTS idx_cart_items_token_product ON cart_items(cart_token, product_id);`,
];

async function migrate() {
  console.log("🚀 Running migrations against Turso…");
  for (const sql of migrations) {
    await client.execute(sql);
  }
  console.log("✅ All tables created / up to date.");
  client.close();
}

migrate().catch((err) => {
  console.error("❌ Migration failed:", err);
  process.exit(1);
});
