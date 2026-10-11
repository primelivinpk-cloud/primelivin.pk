import type { Metadata } from "next";
import { getProducts, getCategories } from "@/lib/queries";
import { ProductCard } from "@/components/product-card";

export const metadata: Metadata = {
  title: "Shop Furniture in Pakistan",
  description:
    "Browse our full range of office chairs, sofas, beds, dining sets and desks. Delivered across Pakistan with Cash on Delivery.",
};

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const [products, categories] = await Promise.all([
    getProducts({ category }),
    getCategories(),
  ]);

  const activeCategory = categories.find((c) => c.slug === category);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="border-b border-border pb-6">
        <h1 className="text-3xl font-bold tracking-tight">
          {activeCategory ? activeCategory.name : "All Furniture"}
        </h1>
        <p className="mt-2 max-w-2xl text-muted">
          {activeCategory?.description ??
            "Quality furniture for Pakistani homes and offices. Prices in PKR, delivered nationwide."}
        </p>
      </div>

      {/* Category filter */}
      <div className="mt-6 flex flex-wrap gap-2">
        <FilterChip href="/shop" active={!category} label="All" />
        {categories.map((c) => (
          <FilterChip
            key={c.id}
            href={`/shop?category=${c.slug}`}
            active={category === c.slug}
            label={c.name}
          />
        ))}
      </div>

      {products.length === 0 ? (
        <div className="mt-16 rounded-2xl border border-border p-12 text-center">
          <p className="text-lg font-medium">No products found</p>
          <p className="mt-2 text-muted">
            {activeCategory
              ? "This category is empty right now."
              : "Check back soon — new stock arrives weekly."}
          </p>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}

function FilterChip({
  href,
  active,
  label,
}: {
  href: string;
  active: boolean;
  label: string;
}) {
  return (
    <a
      href={href}
      className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
        active
          ? "border-brand bg-brand text-brand-fg"
          : "border-border text-muted hover:border-brand hover:text-foreground"
      }`}
    >
      {label}
    </a>
  );
}
