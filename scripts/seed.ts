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

const now = Date.now();

const categories = [
  { id: "cat_office_chairs", name: "Office Chairs", slug: "office-chairs", description: "Ergonomic and executive chairs for home offices and workplaces across Pakistan." },
  { id: "cat_sofas", name: "Sofas & Living", slug: "sofas", description: "Comfortable sofas, loveseats and sectionals for the Pakistani living room." },
  { id: "cat_beds", name: "Beds & Bedroom", slug: "beds", description: "Beds, wardrobes and bedroom sets built for comfort and durability." },
  { id: "cat_dining", name: "Dining Sets", slug: "dining-sets", description: "Dining tables and chairs for family gatherings." },
  { id: "cat_tables", name: "Tables & Desks", slug: "tables-desks", description: "Office desks, coffee tables and study tables." },
];

const products = [
  {
    id: "prod_ergo_chair_01",
    title: "Prime Ergonomic Office Chair",
    slug: "prime-ergonomic-office-chair",
    description:
      "The Prime Ergonomic Office Chair is designed for long working hours. Features adjustable lumbar support, breathable mesh back, 3D armrests and a smooth gas-lift height mechanism. Ideal for home offices in Karachi, Lahore and Islamabad.",
    shortDescription: "Breathable mesh, adjustable lumbar support, 3D armrests.",
    price: 24500,
    compareAtPrice: 32000,
    currency: "PKR",
    categorySlug: "office-chairs",
    tags: ["ergonomic", "office", "mesh", "home-office"],
    sku: "PL-OFC-001",
    stockQuantity: 45,
    images: [] as string[],
    seoTitle: "Prime Ergonomic Office Chair — Best Price in Pakistan | Prime Livin",
    seoDescription: "Buy the Prime Ergonomic Office Chair online in Pakistan. Adjustable lumbar support, breathable mesh, 3-year warranty. Cash on Delivery available.",
    isFeatured: 1,
    isActive: 1,
    rating: 4.7,
    reviewCount: 128,
  },
  {
    id: "prod_exec_chair_02",
    title: "Executive Leather Chair",
    slug: "executive-leather-chair",
    description:
      "Premium bonded-leather executive chair with padded headrest, padded armrests and a heavy-duty 5-star base. A statement piece for the boss's cabin.",
    shortDescription: "Bonded leather, padded headrest, heavy-duty base.",
    price: 38900,
    compareAtPrice: 45000,
    currency: "PKR",
    categorySlug: "office-chairs",
    tags: ["executive", "leather", "office"],
    sku: "PL-OFC-002",
    stockQuantity: 20,
    images: [] as string[],
    seoTitle: "Executive Leather Office Chair Pakistan | Prime Livin",
    seoDescription: "Premium executive leather chair with padded headrest. Delivered across Pakistan with Cash on Delivery.",
    isFeatured: 1,
    isActive: 1,
    rating: 4.5,
    reviewCount: 64,
  },
  {
    id: "prod_sofa_03",
    title: "Lahore 3-Seater Fabric Sofa",
    slug: "lahore-3-seater-fabric-sofa",
    description:
      "A modern 3-seater fabric sofa with solid wood frame and high-density foam cushions. Available in charcoal, beige and olive. Perfect for the Pakistani family living room.",
    shortDescription: "Solid wood frame, high-density foam, 3-seater.",
    price: 89500,
    compareAtPrice: 110000,
    currency: "PKR",
    categorySlug: "sofas",
    tags: ["sofa", "3-seater", "fabric", "living-room"],
    sku: "PL-SOF-003",
    stockQuantity: 12,
    images: [] as string[],
    seoTitle: "3-Seater Fabric Sofa in Pakistan — Lahore | Prime Livin",
    seoDescription: "Buy a modern 3-seater fabric sofa online in Pakistan. Solid wood frame, high-density foam. Free delivery in Lahore, Karachi & Islamabad.",
    isFeatured: 1,
    isActive: 1,
    rating: 4.6,
    reviewCount: 87,
  },
  {
    id: "prod_bed_04",
    title: "Karachi King Bed with Storage",
    slug: "karachi-king-bed-with-storage",
    description:
      "King-size bed with hydraulic storage and a padded upholstered headboard. Engineered wood construction with a walnut finish. Generous under-bed storage for Karachi apartments.",
    shortDescription: "King size, hydraulic storage, upholstered headboard.",
    price: 125000,
    compareAtPrice: 145000,
    currency: "PKR",
    categorySlug: "beds",
    tags: ["bed", "king", "storage", "bedroom"],
    sku: "PL-BED-004",
    stockQuantity: 8,
    images: [] as string[],
    seoTitle: "King Bed with Storage in Pakistan | Prime Livin",
    seoDescription: "King-size bed with hydraulic storage and upholstered headboard. Best furniture prices in Pakistan with Cash on Delivery.",
    isFeatured: 0,
    isActive: 1,
    rating: 4.8,
    reviewCount: 45,
  },
  {
    id: "prod_dining_05",
    title: "Islamabad 6-Seater Dining Set",
    slug: "islamabad-6-seater-dining-set",
    description:
      "Solid sheesham wood 6-seater dining set with a sleek rectangular table and six upholstered chairs. Seats the whole family for Eid dinners and gatherings.",
    shortDescription: "Sheesham wood, 6 chairs, rectangular table.",
    price: 145000,
    compareAtPrice: 175000,
    currency: "PKR",
    categorySlug: "dining-sets",
    tags: ["dining", "6-seater", "sheesham", "wood"],
    sku: "PL-DIN-005",
    stockQuantity: 6,
    images: [] as string[],
    seoTitle: "6-Seater Dining Set in Pakistan — Sheesham Wood | Prime Livin",
    seoDescription: "Solid sheesham wood 6-seater dining set. Free delivery in Islamabad, Lahore and Karachi.",
    isFeatured: 1,
    isActive: 1,
    rating: 4.4,
    reviewCount: 32,
  },
  {
    id: "prod_desk_06",
    title: "Minimalist Study Desk",
    slug: "minimalist-study-desk",
    description:
      "Compact minimalist study desk with a cable-management groove and a single drawer. Ideal for students and small home offices.",
    shortDescription: "Compact, cable management, single drawer.",
    price: 18500,
    compareAtPrice: 22000,
    currency: "PKR",
    categorySlug: "tables-desks",
    tags: ["desk", "study", "minimalist", "home-office"],
    sku: "PL-TBL-006",
    stockQuantity: 30,
    images: [] as string[],
    seoTitle: "Minimalist Study Desk Pakistan | Prime Livin",
    seoDescription: "Compact minimalist study desk with cable management. Affordable furniture delivered across Pakistan.",
    isFeatured: 0,
    isActive: 1,
    rating: 4.3,
    reviewCount: 21,
  },
];

const posts = [
  {
    id: "blog_buying_guide",
    title: "The Complete Furniture Buying Guide for Pakistan (2026)",
    slug: "furniture-buying-guide-pakistan-2026",
    excerpt:
      "From budget to premium — how to choose furniture that lasts in Pakistan's climate, and what to check before you buy online.",
    content: `# Furniture Buying Guide for Pakistan (2026)

Buying furniture in Pakistan has changed. More people now shop online, compare prices and get furniture delivered to their doorstep with Cash on Delivery.

## Start with the room, not the product

Measure your room first. A 3-seater sofa needs roughly 8–10 feet of wall space. Leave 3 feet for walkways.

## Pick materials for the climate

Karachi's humidity and Lahore's dry winters affect wood differently. Sheesham (rosewood) and engineered wood with a good laminate perform well across most of Pakistan.

## Check what's included

- Delivery to your city
- Assembly charges
- Warranty on frame and foam
- Return window

## Payment

Look for stores offering EasyPaisa, JazzCash, bank transfer and Cash on Delivery so you can inspect the piece before paying.

## Final tip

Always check the return policy and read recent reviews before ordering large furniture online.`,
    category: "Guides",
    tags: ["buying-guide", "pakistan", "furniture"],
    seoTitle: "Furniture Buying Guide for Pakistan 2026 | Prime Livin",
    seoDescription: "Complete guide to buying furniture online in Pakistan — materials, budget, delivery and payment options explained.",
    status: "published",
    coverImage: null,
  },
  {
    id: "blog_office_setup",
    title: "Setting Up a Home Office in Pakistan: Chairs, Desks & Budget",
    slug: "home-office-setup-pakistan",
    excerpt:
      "Working from home? Here's how to build a comfortable, affordable home office — starting with the right chair.",
    content: `# Setting Up a Home Office in Pakistan

Remote work is here to stay. A good home office setup reduces back pain and boosts focus.

## The chair matters most

Invest in an ergonomic chair with adjustable height, lumbar support and breathable fabric. Your back will thank you after 8-hour days.

## Desk height

Your desk should be about 28–30 inches high so your elbows sit at 90 degrees when typing.

## Budget breakdown (PKR)

- Ergonomic chair: Rs 20,000 – 40,000
- Study desk: Rs 15,000 – 30,000
- Monitor stand: Rs 3,000 – 6,000

## Lighting

Place your desk perpendicular to a window to avoid glare. Add a warm task lamp for evening work.

## Cable management

Use a cable tray or clips under the desk. A tidy desk helps you focus.

Start with the chair — everything else can wait.`,
    category: "Guides",
    tags: ["home-office", "ergonomic", "pakistan"],
    seoTitle: "Home Office Setup Guide Pakistan | Prime Livin",
    seoDescription: "How to set up a home office in Pakistan — best ergonomic chairs, desks and budget tips.",
    status: "published",
    coverImage: null,
  },
];

async function seed() {
  console.log("🌱 Seeding database…");

  // Clear existing
  await client.execute("DELETE FROM order_items");
  await client.execute("DELETE FROM orders");
  await client.execute("DELETE FROM blog_posts");
  await client.execute("DELETE FROM products");
  await client.execute("DELETE FROM categories");

  // Categories
  for (const c of categories) {
    await client.execute({
      sql: `INSERT INTO categories (id, name, slug, description, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?)`,
      args: [c.id, c.name, c.slug, c.description, now, now],
    });
  }

  // Products
  for (const p of products) {
    await client.execute({
      sql: `INSERT INTO products (
              id, title, slug, description, short_description,
              price, compare_at_price, currency, category_slug, tags, sku,
              stock_quantity, images, seo_title, seo_description,
              is_featured, is_active, rating, review_count, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        p.id, p.title, p.slug, p.description, p.shortDescription,
        p.price, p.compareAtPrice, p.currency, p.categorySlug,
        JSON.stringify(p.tags), p.sku, p.stockQuantity, JSON.stringify(p.images),
        p.seoTitle, p.seoDescription, p.isFeatured, p.isActive, p.rating,
        p.reviewCount, now, now,
      ],
    });
  }

  // Blog posts
  for (const b of posts) {
    await client.execute({
      sql: `INSERT INTO blog_posts (
              id, title, slug, excerpt, content, cover_image, category, tags,
              seo_title, seo_description, status, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        b.id, b.title, b.slug, b.excerpt, b.content, b.coverImage, b.category,
        JSON.stringify(b.tags), b.seoTitle, b.seoDescription, b.status, now, now,
      ],
    });
  }

  console.log(`✅ Seeded ${categories.length} categories, ${products.length} products, ${posts.length} blog posts.`);
  client.close();
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
