import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProductBySlug, getRelatedProducts, getProducts, getPostsForShopCategory } from "@/lib/queries";
import { ProductCard } from "@/components/product-card";
import { AddToCartButton } from "@/components/cart/add-to-cart-button";
import { formatPKR } from "@/lib/format";
import { site } from "@/lib/site";
import { breadcrumbLd, faqLd, howToLd } from "@/lib/structured-data";
import { JsonLd } from "@/components/json-ld";
import { getFaqsForCategory, chairAssemblySteps } from "@/lib/seo-content";
import { canonicalFor, isLocale, languagesFor, localize, type Locale } from "@/lib/i18n";
import { t } from "@/lib/i18n/ui";

// Revalidate product pages every 5 minutes (ISR).
export const revalidate = 300;

// Prerender all known products at build time.
export async function generateStaticParams() {
  const all = await getProducts();
  return all.map((p) => ({ slug: p.slug }));
}

type Props = { params: Promise<{ lang: string; slug: string }> };

function resolveLang(raw: string): Locale {
  return raw && isLocale(raw) ? raw : "en";
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, lang: raw } = await params;
  const lang = resolveLang(raw);
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
    alternates: {
      canonical: canonicalFor(`/shop/${product.slug}`, lang),
      languages: languagesFor(`/shop/${product.slug}`),
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug, lang: raw } = await params;
  const lang = resolveLang(raw);
  const d = t(lang);
  const L = (path: string) => localize(path, lang);
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const related = await getRelatedProducts(product.categorySlug, product.id, 4);
  const guides = await getPostsForShopCategory(product.categorySlug, 3);
  const faqs = getFaqsForCategory(product.categorySlug);
  const isChair = product.categorySlug === "office-chairs";

  const categoryLabel = product.categorySlug.replace(/-/g, " ");
  const productUrl = `${site.url}/shop/${product.slug}`;

  const breadcrumb = breadcrumbLd([
    { name: "Home", url: site.url },
    { name: "Shop", url: `${site.url}/shop` },
    { name: categoryLabel, url: `${site.url}/shop?category=${product.categorySlug}` },
    { name: product.title },
  ]);

  const faq = faqLd(faqs);
  const howTo = isChair
    ? howToLd(
        `How to assemble ${product.title}`,
        `Step-by-step instructions to assemble ${product.title} in about 30 minutes with the included tools.`,
        chairAssemblySteps
      )
    : null;

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
    brand: { "@type": "Brand", name: site.name },
    category: categoryLabel,
    url: productUrl,
    image: product.images?.length ? product.images : undefined,
    offers: {
      "@type": "Offer",
      url: productUrl,
      priceCurrency: product.currency,
      price: product.price.toFixed(2),
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
      <JsonLd data={jsonLd} />
      <JsonLd data={breadcrumb} />
      <JsonLd data={faq} />
      {howTo && <JsonLd data={howTo} />}

      <nav className="text-sm text-muted" aria-label="Breadcrumb">
        <Link href={L("/")} className="hover:text-foreground">{d.product.home}</Link>
        <span className="mx-2">/</span>
        <Link href={L("/shop")} className="hover:text-foreground">{d.product.shop}</Link>
        <span className="mx-2">/</span>
        <Link href={L(`/shop?category=${product.categorySlug}`)} className="hover:text-foreground">
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
              {d.product.imageSoon}
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
              <span className="text-muted">({d.product.reviews(product.reviewCount ?? 0)})</span>
            </div>
          )}

          <div className="mt-5 flex items-baseline gap-3">
            <span className="text-3xl font-bold">{formatPKR(product.price)}</span>
            {product.compareAtPrice && discount !== null && (
              <>
                <span className="text-lg text-muted line-through">
                  {formatPKR(product.compareAtPrice)}
                </span>
                <span className="rounded-full bg-accent/10 px-2.5 py-1 text-sm font-semibold text-accent">
                  {d.product.save(discount)}
                </span>
              </>
            )}
          </div>
          <p className="mt-1 text-sm text-muted">{d.product.priceNote}</p>

          <p className="mt-6 leading-relaxed text-foreground/90">
            {product.description}
          </p>

          <div className="mt-6 flex items-center gap-2 text-sm">
            {product.stockQuantity > 0 ? (
              <span className="inline-flex items-center gap-2 text-green-600 dark:text-green-400">
                <span className="h-2 w-2 rounded-full bg-green-500" />
                {d.product.inStock(product.stockQuantity)}
              </span>
            ) : (
              <span className="inline-flex items-center gap-2 text-red-500">
                <span className="h-2 w-2 rounded-full bg-red-500" />
                {d.product.outOfStock}
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
            <h2 className="font-semibold">{d.product.deliveryTitle}</h2>
            <ul className="mt-3 space-y-1.5 text-muted">
              {d.product.deliveryPoints.map((point) => (
                <li key={point}>• {point}</li>
              ))}
            </ul>
          </div>

          <AddToCartButton productId={product.id} disabled={product.stockQuantity <= 0} lang={lang} />
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-20 border-t border-border pt-12">
          <h2 className="text-2xl font-bold tracking-tight">{d.product.relatedTitle}</h2>
          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} lang={lang} />
            ))}
          </div>
        </section>
      )}

      {guides.length > 0 && (
        <section className="mt-16 rounded-2xl border border-border bg-background p-8">
          <div className="flex items-baseline justify-between">
            <h2 className="text-lg font-bold tracking-tight">{d.product.buyingGuides}</h2>
            <Link href={L("/blog")} className="text-sm font-medium text-brand hover:underline">
              {d.product.allGuides} →
            </Link>
          </div>
          <ul className="mt-4 grid gap-4 sm:grid-cols-3">
            {guides.map((g) => (
              <li key={g.id}>
                <Link
                  href={L(`/blog/${g.slug}`)}
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

      {howTo && (
        <section className="mt-16" aria-labelledby="howto-heading">
          <h2 id="howto-heading" className="text-2xl font-bold tracking-tight">
            {d.product.howToTitle(categoryLabel.replace(/s$/, ""))}
          </h2>
          <ol className="mt-6 space-y-4">
            {chairAssemblySteps.map((step, i) => (
              <li key={i} className="rounded-xl border border-border p-5">
                <p className="text-sm font-semibold">
                  <span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-brand text-xs text-brand-fg">
                    {i + 1}
                  </span>
                  {step.name}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-muted">{step.text}</p>
              </li>
            ))}
          </ol>
        </section>
      )}

      <section className="mt-16" aria-labelledby="faq-heading">
        <h2 id="faq-heading" className="text-2xl font-bold tracking-tight">
          {d.product.faqTitle}
        </h2>
        <div className="mt-6 divide-y divide-border border-y border-border">
          {faqs.map((f, i) => (
            <details key={i} className="group py-4" open={i === 0}>
              <summary className="cursor-pointer list-none text-sm font-semibold marker:hidden">
                <span className="mr-2 inline-block transition-transform group-open:rotate-90">
                  ›
                </span>
                {f.question}
              </summary>
              <p className="mt-2 pl-6 text-sm leading-relaxed text-muted">{f.answer}</p>
            </details>
          ))}
        </div>
        <p className="mt-4 text-sm text-muted">
          {d.product.moreQuestions}{" "}
          <Link href={L("/faq")} className="font-semibold text-brand hover:underline">
            {d.product.seeFaq}
          </Link>
        </p>
      </section>
    </div>
  );
}
