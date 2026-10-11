import Link from "next/link";
import { getProducts, getCategories, getPublishedPosts, getStoreStats } from "@/lib/queries";
import { ProductCard } from "@/components/product-card";
import { site } from "@/lib/site";

export default async function HomePage() {
  const [featured, categories, posts, stats] = await Promise.all([
    getProducts({ featured: true, limit: 8 }),
    getCategories(),
    getPublishedPosts(3),
    getStoreStats(),
  ]);

  return (
    <>
      {/* Hero */}
      <section className="border-b border-border bg-brand text-brand-fg">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-wider opacity-80">
              Delivered across Pakistan
            </p>
            <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Furniture your home deserves.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed opacity-90">
              Office chairs, sofas, beds and dining sets — quality pieces at
              honest PKR prices. Cash on Delivery, EasyPaisa &amp; JazzCash accepted.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/shop"
                className="inline-flex items-center rounded-lg bg-brand-fg px-6 py-3 text-sm font-semibold text-brand transition-opacity hover:opacity-90"
              >
                Shop All Furniture
              </Link>
              <Link
                href="/blog"
                className="inline-flex items-center rounded-lg border border-brand-fg/40 px-6 py-3 text-sm font-semibold transition-colors hover:bg-brand-fg/10"
              >
                Buying Guides
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Trust strip */}
      <section className="border-b border-border bg-background">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-4 px-4 py-8 sm:px-6 lg:grid-cols-4 lg:px-8">
          {[
            { title: "Free Delivery", note: "Major cities" },
            { title: "Cash on Delivery", note: "Pay on arrival" },
            { title: "Easy & JazzCash", note: "Mobile wallets" },
            { title: "Warranty", note: "On every piece" },
          ].map((f) => (
            <div key={f.title} className="rounded-xl border border-border p-4">
              <p className="text-sm font-semibold">{f.title}</p>
              <p className="mt-1 text-xs text-muted">{f.note}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured products */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Featured Furniture
            </h2>
            <p className="mt-2 text-muted">
              Hand-picked pieces, ready to ship across Pakistan.
            </p>
          </div>
          <Link href="/shop" className="hidden text-sm font-semibold text-brand hover:underline sm:block">
            View all →
          </Link>
        </div>

        {featured.length === 0 ? (
          <p className="mt-10 text-muted">No products yet. Check back soon.</p>
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}

        <div className="mt-8 text-center sm:hidden">
          <Link href="/shop" className="text-sm font-semibold text-brand hover:underline">
            View all products →
          </Link>
        </div>
      </section>

      {/* Categories */}
      <section className="border-y border-border bg-background">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Shop by Category
          </h2>
          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {categories.map((c) => (
              <Link
                key={c.id}
                href={`/shop?category=${c.slug}`}
                className="group rounded-2xl border border-border p-6 transition-colors hover:border-brand"
              >
                <span className="text-sm font-semibold group-hover:text-brand">
                  {c.name}
                </span>
                <span className="mt-2 block text-xs text-muted">{c.description}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Blog teaser */}
      {posts.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                From the Blog
              </h2>
              <p className="mt-2 text-muted">
                Guides to help you buy better furniture in Pakistan.
              </p>
            </div>
            <Link href="/blog" className="hidden text-sm font-semibold text-brand hover:underline sm:block">
              All posts →
            </Link>
          </div>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="group rounded-2xl border border-border p-6 transition-shadow hover:shadow-md"
              >
                <p className="text-xs font-semibold uppercase tracking-wider text-accent">
                  {post.category ?? "Article"}
                </p>
                <h3 className="mt-2 text-lg font-semibold leading-snug group-hover:text-brand">
                  {post.title}
                </h3>
                {post.excerpt && (
                  <p className="mt-2 line-clamp-3 text-sm text-muted">{post.excerpt}</p>
                )}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Stats / SEO block */}
      <section className="border-t border-border bg-background">
        <div className="mx-auto max-w-7xl px-4 py-12 text-center sm:px-6 lg:px-8">
          <p className="text-sm text-muted">
            <span className="font-semibold text-foreground">{stats.products}</span> products ·{" "}
            <span className="font-semibold text-foreground">{stats.categories}</span> categories · Serving all of{" "}
            {site.regions.join(", ")}.
          </p>
        </div>
      </section>
    </>
  );
}
