import type { Metadata } from "next";
import Link from "next/link";
import { getProducts, getCategories, countProducts, getPostsForShopCategory, type ProductSort } from "@/lib/queries";
import { ProductCard } from "@/components/product-card";

export const metadata: Metadata = {
  title: "Shop Furniture in Pakistan",
  description:
    "Browse our full range of office chairs, sofas, beds, dining sets and desks. Delivered across Pakistan with Cash on Delivery.",
};

const SORT_OPTIONS: { value: ProductSort; label: string }[] = [
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "title", label: "Name: A–Z" },
];

const PAGE_SIZE = 12;

type Search = {
  category?: string;
  q?: string;
  sort?: string;
  minPrice?: string;
  maxPrice?: string;
  page?: string;
};

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  const sp = await searchParams;
  const category = sp.category || undefined;
  const search = sp.q?.trim() || undefined;
  const sortParam = (sp.sort as ProductSort) || "newest";
  const sort = SORT_OPTIONS.some((s) => s.value === sortParam) ? sortParam : "newest";
  const minPrice = sp.minPrice ? Number(sp.minPrice) : undefined;
  const maxPrice = sp.maxPrice ? Number(sp.maxPrice) : undefined;
  const page = Math.max(1, Number(sp.page) || 1);

  const query = {
    category,
    search,
    sort,
    minPrice: Number.isFinite(minPrice) ? minPrice : undefined,
    maxPrice: Number.isFinite(maxPrice) ? maxPrice : undefined,
    limit: PAGE_SIZE,
    offset: (page - 1) * PAGE_SIZE,
  };

  const [products, categories, total, guides] = await Promise.all([
    getProducts(query),
    getCategories(),
    countProducts({ category, search, minPrice: query.minPrice, maxPrice: query.maxPrice }),
    category && !search ? getPostsForShopCategory(category, 3) : Promise.resolve([]),
  ]);

  const activeCategory = categories.find((c) => c.slug === category);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

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

      {/* Filters */}
      <form method="get" className="mt-6 space-y-4">
        <div className="flex flex-wrap gap-2">
          <FilterChip href={buildHref({ ...sp, category: undefined, page: undefined })} active={!category} label="All" />
          {categories.map((c) => (
            <FilterChip
              key={c.id}
              href={buildHref({ ...sp, category: c.slug, page: undefined })}
              active={category === c.slug}
              label={c.name}
            />
          ))}
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <input
            type="search"
            name="q"
            defaultValue={sp.q ?? ""}
            placeholder="Search products…"
            className="rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-brand lg:col-span-2"
          />
          <select
            name="sort"
            defaultValue={sort}
            className="rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-brand"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <input
            type="number"
            name="minPrice"
            defaultValue={sp.minPrice ?? ""}
            min={0}
            placeholder="Min price"
            className="rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-brand"
          />
          <input
            type="number"
            name="maxPrice"
            defaultValue={sp.maxPrice ?? ""}
            min={0}
            placeholder="Max price"
            className="rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-brand"
          />
        </div>

        {/* Preserve category when submitting search */}
        {category && <input type="hidden" name="category" value={category} />}

        <div className="flex gap-2">
          <button
            type="submit"
            className="rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-brand-fg transition-opacity hover:opacity-90"
          >
            Apply filters
          </button>
          <Link
            href="/shop"
            className="rounded-lg border border-border px-5 py-2.5 text-sm font-medium transition-colors hover:border-brand"
          >
            Reset
          </Link>
        </div>
      </form>

      <p className="mt-6 text-sm text-muted">
        {total} {total === 1 ? "product" : "products"} found
      </p>

      {products.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-border p-12 text-center">
          <p className="text-lg font-medium">No products found</p>
          <p className="mt-2 text-muted">Try adjusting your filters or search term.</p>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}

      {guides.length > 0 && (
        <section className="mt-12 rounded-2xl border border-border bg-background p-6" aria-labelledby="guides-heading">
          <div className="flex items-baseline justify-between">
            <h2 id="guides-heading" className="text-sm font-bold tracking-tight">
              Buying guides for {activeCategory?.name ?? "this category"}
            </h2>
            <Link href="/blog" className="text-sm font-medium text-brand hover:underline">
              All guides →
            </Link>
          </div>
          <ul className="mt-3 grid gap-3 sm:grid-cols-3">
            {guides.map((g) => (
              <li key={g.id}>
                <Link
                  href={`/blog/${g.slug}`}
                  className="group block rounded-xl border border-border p-4 transition-shadow hover:shadow-md"
                >
                  <p className="text-sm font-semibold leading-snug group-hover:text-brand">
                    {g.title}
                  </p>
                  <p className="mt-1 text-xs text-muted">Read guide →</p>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <nav className="mt-10 flex items-center justify-center gap-2" aria-label="Pagination">
          {page > 1 && (
            <Link
              href={buildHref({ ...sp, page: String(page - 1) })}
              className="rounded-lg border border-border px-4 py-2 text-sm font-medium transition-colors hover:border-brand"
            >
              ← Previous
            </Link>
          )}
          <span className="px-3 text-sm text-muted">
            Page {page} of {totalPages}
          </span>
          {page < totalPages && (
            <Link
              href={buildHref({ ...sp, page: String(page + 1) })}
              className="rounded-lg border border-border px-4 py-2 text-sm font-medium transition-colors hover:border-brand"
            >
              Next →
            </Link>
          )}
        </nav>
      )}
    </div>
  );
}

function FilterChip({ href, active, label }: { href: string; active: boolean; label: string }) {
  return (
    <Link
      href={href}
      className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
        active
          ? "border-brand bg-brand text-brand-fg"
          : "border-border text-muted hover:border-brand hover:text-foreground"
      }`}
    >
      {label}
    </Link>
  );
}

/** Build a /shop href preserving existing query params. */
function buildHref(params: Record<string, string | undefined>) {
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (!v || k === "page" && v === "1") continue;
    if (["category", "q", "sort", "minPrice", "maxPrice", "page"].includes(k)) {
      qs.set(k, v);
    }
  }
  const s = qs.toString();
  return s ? `/shop?${s}` : "/shop";
}
