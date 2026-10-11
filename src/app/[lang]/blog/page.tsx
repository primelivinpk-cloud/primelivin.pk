import type { Metadata } from "next";
import Link from "next/link";
import { getPublishedPosts } from "@/lib/queries";
import { formatDate, truncate } from "@/lib/format";
import { site } from "@/lib/site";
import { canonicalFor, isLocale, languagesFor, localize, type Locale } from "@/lib/i18n";
import { t } from "@/lib/i18n/ui";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang: raw } = await params;
  const lang: Locale = raw && isLocale(raw) ? raw : "en";
  return {
    title: "Furniture Blog — Guides for Pakistani Homes",
    description:
      "Buying guides, home-office tips and furniture care advice for Pakistani homes. Learn before you buy.",
    alternates: {
      canonical: canonicalFor("/blog", lang),
      languages: languagesFor("/blog"),
      types: { "application/rss+xml": `${site.url}/rss.xml` },
    },
    openGraph: {
      title: "Furniture Blog — Guides for Pakistani Homes",
      description:
        "Buying guides, home-office tips and furniture care advice for Pakistani homes.",
      url: canonicalFor("/blog", lang),
      siteName: site.name,
      type: "website",
    },
    twitter: {
      card: "summary",
      title: "Furniture Blog — Guides for Pakistani Homes",
      description:
        "Buying guides, home-office tips and furniture care advice for Pakistani homes.",
    },
  };
}

export const revalidate = 300;

export default async function BlogPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang: raw } = await params;
  const lang: Locale = raw && isLocale(raw) ? raw : "en";
  const d = t(lang);
  const posts = await getPublishedPosts();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: `${site.name} Blog`,
    description: "Buying guides, home-office tips and furniture care advice for Pakistani homes.",
    url: `${site.url}/blog`,
    publisher: { "@type": "Organization", name: site.name },
    blogPost: posts.slice(0, 20).map((p) => ({
      "@type": "BlogPosting",
      headline: p.title,
      url: `${site.url}/blog/${p.slug}`,
      datePublished: p.createdAt.toISOString(),
    })),
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="flex items-end justify-between border-b border-border pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{d.blog.title}</h1>
          <p className="mt-2 text-muted">{d.blog.description}</p>
        </div>
        <a
          href="/rss.xml"
          className="shrink-0 text-sm font-medium text-muted hover:text-foreground"
          title={d.blog.rssTitle}
        >
          RSS ↗
        </a>
      </div>

      {posts.length === 0 ? (
        <div className="mt-12 rounded-2xl border border-border p-12 text-center">
          <p className="text-lg font-medium">{d.blog.empty}</p>
          <p className="mt-2 text-muted">{d.blog.emptyText}</p>
        </div>
      ) : (
        <div className="mt-8 space-y-6">
          {posts.map((post) => (
            <Link
              key={post.id}
              href={localize(`/blog/${post.slug}`, lang)}
              className="group block rounded-2xl border border-border p-6 transition-shadow hover:shadow-md"
            >
              <div className="flex items-center gap-3 text-xs text-muted">
                {post.category && (
                  <span className="font-semibold uppercase tracking-wider text-accent">
                    {post.category}
                  </span>
                )}
                <span>{formatDate(post.createdAt)}</span>
              </div>
              <h2 className="mt-2 text-xl font-semibold leading-snug group-hover:text-brand">
                {post.title}
              </h2>
              {post.excerpt && (
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  {truncate(post.excerpt, 180)}
                </p>
              )}
              <span className="mt-3 inline-block text-sm font-semibold text-brand">
                {d.common.readMore} →
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
