import type { Metadata } from "next";
import Link from "next/link";
import { getProducts, getCategories, getPublishedPosts, getStoreStats } from "@/lib/queries";
import { ProductCard } from "@/components/product-card";
import { site } from "@/lib/site";
import { canonicalFor, isLocale, languagesFor, localize, type Locale } from "@/lib/i18n";
import { t } from "@/lib/i18n/ui";

async function langOf(params: Promise<{ lang?: string }>): Promise<Locale> {
  const { lang } = await params;
  return lang && isLocale(lang) ? lang : "en";
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const lang = await langOf(params);
  return {
    alternates: {
      canonical: canonicalFor("/", lang),
      languages: languagesFor("/"),
    },
  };
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const lang = await langOf(params);
  const d = t(lang);
  const L = (path: string) => localize(path, lang);

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
              {d.home.heroKicker}
            </p>
            <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              {d.home.heroTitle}
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed opacity-90">
              {d.home.heroText}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href={L("/shop")}
                className="inline-flex items-center rounded-lg bg-brand-fg px-6 py-3 text-sm font-semibold text-brand transition-opacity hover:opacity-90"
              >
                {d.home.shopAll}
              </Link>
              <Link
                href={L("/blog")}
                className="inline-flex items-center rounded-lg border border-brand-fg/40 px-6 py-3 text-sm font-semibold transition-colors hover:bg-brand-fg/10"
              >
                {d.home.buyingGuides}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Trust strip */}
      <section className="border-b border-border bg-background">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-4 px-4 py-8 sm:px-6 lg:grid-cols-4 lg:px-8">
          {d.home.trust.map((f) => (
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
              {d.home.featuredTitle}
            </h2>
            <p className="mt-2 text-muted">
              {d.home.featuredText}
            </p>
          </div>
          <Link href={L("/shop")} className="hidden text-sm font-semibold text-brand hover:underline sm:block">
            {d.common.viewAll} →
          </Link>
        </div>

        {featured.length === 0 ? (
          <p className="mt-10 text-muted">{d.home.noProducts}</p>
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((p) => (
              <ProductCard key={p.id} product={p} lang={lang} />
            ))}
          </div>
        )}

        <div className="mt-8 text-center sm:hidden">
          <Link href={L("/shop")} className="text-sm font-semibold text-brand hover:underline">
            {d.common.viewAllProducts} →
          </Link>
        </div>
      </section>

      {/* Categories */}
      <section className="border-y border-border bg-background">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            {d.home.categoriesTitle}
          </h2>
          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {categories.map((c) => (
              <Link
                key={c.id}
                href={L(`/shop?category=${c.slug}`)}
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
                {d.home.blogTitle}
              </h2>
              <p className="mt-2 text-muted">
                {d.home.blogText}
              </p>
            </div>
            <Link href={L("/blog")} className="hidden text-sm font-semibold text-brand hover:underline sm:block">
              {d.home.allPosts} →
            </Link>
          </div>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <Link
                key={post.id}
                href={L(`/blog/${post.slug}`)}
                className="group rounded-2xl border border-border p-6 transition-shadow hover:shadow-md"
              >
                <p className="text-xs font-semibold uppercase tracking-wider text-accent">
                  {post.category ?? d.common.article}
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
            {d.home.stats(stats.products, stats.categories, site.regions.join(", "))}
          </p>
        </div>
      </section>
    </>
  );
}
