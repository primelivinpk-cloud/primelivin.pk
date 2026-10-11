import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProductBySlug, getRelatedProducts, getProducts, getPostsForShopCategory } from "@/lib/queries";
import { ProductCard } from "@/components/product-card";
import { AddToCartButton } from "@/components/cart/add-to-cart-button";
import { formatPKR } from "@/lib/format";
import { site } from "@/lib/site";

// Revalidate product pages every 5 minutes (ISR).
export const revalidate = 300;

// Prerender all known products at build time.
export async function generateStaticParams() {
  const all = await getProducts();
  return all.map((p) => ({ slug: p.slug }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Product not found" };

  return {
    title: product.seoTitle ?? product.title,
    description:
      product.seoDescription ??
      product.shortDescription ??
      product.description.slice(0, 160),
    openGraph: {
      title: product.seoTitle ?? product.title,
      description: product.seoDescription ?? product.shortDescription ?? undefined,
      type: "website",
      images: product.images?.length ? [{ url: product.images[0] }] : undefined,
    },
    alternates: { canonical: `${site.url}/shop/${product.slug}` },
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const related = await getRelatedProducts(product.categorySlug, product.id, 4);
  const guides = await getPostsForShopCategory(product.categorySlug, 3);

  const discount =
    product.compareAtPrice && product.compareAtPrice > product.price
      ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
      : null;

  // Schema.org Product structured data (AEO)
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: product.shortDescription ?? product.description,
    sku: product.sku ?? undefined,
    image: product.images?.length ? product.images : undefined,
    offers: {
      "@type": "Offer",
      url: `${site.url}/shop/${product.slug}`,
      priceCurrency: product.currency,
      price: product.price,
      availability: product.stockQuantity > 0
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
    },
    ...(product.rating && product.rating > 0
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: product.rating,
            reviewCount: product.reviewCount,
          },
        }
      : {}),
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <nav className="text-sm text-muted" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-foreground">Home</Link>
        <span className="mx-2">/</span>
        <Link href="/shop" className="hover:text-foreground">Shop</Link>
        <span className="mx-2">/</span>
        <Link href={`/shop?category=${product.categorySlug}`} className="hover:text-foreground">
          {product.categorySlug.replace(/-/g, " ")}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">{product.title}</span>
      </nav>

      <div className="mt-6 grid gap-10 lg:grid-cols-2">
        {/* Image */}
        <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-border bg-brand/10">
          {product.images && product.images.length > 0 ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.images[0]}
              alt={product.title}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-muted">
              Product image coming soon
            </div>
          )}
        </div>

        {/* Details */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{product.title}</h1>

          {product.rating && product.rating > 0 && (
            <div className="mt-3 flex items-center gap-2 text-sm">
              <span className="text-accent">★</span>
              <span className="font-medium">{product.rating.toFixed(1)}</span>
              <span className="text-muted">({product.reviewCount} reviews)</span>
            </div>
          )}

          <div className="mt-5 flex items-baseline gap-3">
            <span className="text-3xl font-bold">{formatPKR(product.price)}</span>
            {product.compareAtPrice && product.compareAtPrice > product.price && (
              <>
                <span className="text-lg text-muted line-through">
                  {formatPKR(product.compareAtPrice)}
                </span>
                <span className="rounded-full bg-accent/10 px-2.5 py-1 text-sm font-semibold text-accent">
                  Save {discount}%
                </span>
              </>
            )}
          </div>
          <p className="mt-1 text-sm text-muted">Inclusive of all taxes. Prices in PKR.</p>

          <p className="mt-6 leading-relaxed text-foreground/90">
            {product.description}
          </p>

          <div className="mt-6 flex items-center gap-2 text-sm">
            {product.stockQuantity > 0 ? (
              <span className="inline-flex items-center gap-2 text-green-600 dark:text-green-400">
                <span className="h-2 w-2 rounded-full bg-green-500" />
                In stock ({product.stockQuantity} available)
              </span>
            ) : (
              <span className="inline-flex items-center gap-2 text-red-500">
                <span className="h-2 w-2 rounded-full bg-red-500" />
                Out of stock
              </span>
            )}
          </div>

          {product.tags && product.tags.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-2">
              {product.tags.map((t) => (
                <span key={t} className="rounded-full border border-border px-3 py-1 text-xs text-muted">
                  #{t}
                </span>
              ))}
            </div>
          )}

          <div className="mt-8 rounded-2xl border border-border bg-background p-5 text-sm">
            <h2 className="font-semibold">Delivery & Payment</h2>
            <ul className="mt-3 space-y-1.5 text-muted">
              <li>• Free delivery in major cities across Pakistan</li>
              <li>• Cash on Delivery, EasyPaisa, JazzCash & Bank Transfer</li>
              <li>• Standard delivery 3–7 working days</li>
            </ul>
          </div>

          <AddToCartButton productId={product.id} disabled={product.stockQuantity <= 0} />
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-20 border-t border-border pt-12">
          <h2 className="text-2xl font-bold tracking-tight">You may also like</h2>
          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {guides.length > 0 && (
        <section className="mt-16 rounded-2xl border border-border bg-background p-8">
          <div className="flex items-baseline justify-between">
            <h2 className="text-lg font-bold tracking-tight">Buying guides</h2>
            <Link href="/blog" className="text-sm font-medium text-brand hover:underline">
              All guides →
            </Link>
          </div>
          <ul className="mt-4 grid gap-4 sm:grid-cols-3">
            {guides.map((g) => (
              <li key={g.id}>
                <Link
                  href={`/blog/${g.slug}`}
                  className="group block rounded-xl border border-border p-4 transition-shadow hover:shadow-md"
                >
                  <p className="text-sm font-semibold leading-snug group-hover:text-brand">
                    {g.title}
                  </p>
                  {g.excerpt && (
                    <p className="mt-1 line-clamp-2 text-xs text-muted">{g.excerpt}</p>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
