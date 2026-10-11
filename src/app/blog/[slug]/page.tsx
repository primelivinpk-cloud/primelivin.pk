import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPostBySlug, getPublishedPosts, getRelatedPosts, getCategoriesForPost } from "@/lib/queries";
import { formatDate } from "@/lib/format";
import { site } from "@/lib/site";

// Revalidate blog pages every 5 minutes (ISR).
export const revalidate = 300;

// Prerender all published posts at build time.
export async function generateStaticParams() {
  const all = await getPublishedPosts();
  return all.map((p) => ({ slug: p.slug }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return { title: "Post not found" };

  const title = post.seoTitle ?? post.title;
  const description = post.seoDescription ?? post.excerpt ?? post.content.slice(0, 160);

  return {
    title,
    description,
    keywords: post.tags ?? undefined,
    openGraph: {
      title,
      description,
      type: "article",
      publishedTime: post.createdAt.toISOString(),
      modifiedTime: post.updatedAt.toISOString(),
      authors: [site.name],
      tags: post.tags ?? undefined,
      images: post.coverImage ? [{ url: post.coverImage }] : undefined,
      url: `${site.url}/blog/${post.slug}`,
    },
    twitter: {
      card: post.coverImage ? "summary_large_image" : "summary",
      title,
      description,
      images: post.coverImage ? [post.coverImage] : undefined,
    },
    alternates: { canonical: `${site.url}/blog/${post.slug}` },
  };
}

/** Minimal markdown-ish renderer: #, ##, ###, paragraphs, **bold**, *italic*, - lists */
function renderContent(content: string) {
  const lines = content.split("\n");
  const blocks: React.ReactNode[] = [];
  let listItems: string[] = [];

  const flushList = () => {
    if (listItems.length > 0) {
      blocks.push(
        <ul key={`ul-${blocks.length}`} className="my-4 list-disc space-y-2 pl-6">
          {listItems.map((li, i) => (
            <li key={i} dangerouslySetInnerHTML={{ __html: inline(li) }} />
          ))}
        </ul>
      );
      listItems = [];
    }
  };

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) {
      flushList();
      continue;
    }
    if (line.startsWith("### ")) {
      flushList();
      blocks.push(<h3 key={blocks.length} className="mt-8 text-lg font-semibold">{line.slice(4)}</h3>);
    } else if (line.startsWith("## ")) {
      flushList();
      blocks.push(<h2 key={blocks.length} className="mt-10 text-2xl font-bold tracking-tight">{line.slice(3)}</h2>);
    } else if (line.startsWith("# ")) {
      flushList();
      blocks.push(<h1 key={blocks.length} className="mt-8 text-3xl font-bold tracking-tight">{line.slice(2)}</h1>);
    } else if (line.startsWith("- ")) {
      listItems.push(line.slice(2));
    } else {
      flushList();
      blocks.push(
        <p key={blocks.length} className="my-4 leading-relaxed" dangerouslySetInnerHTML={{ __html: inline(line) }} />
      );
    }
  }
  flushList();
  return blocks;
}

function inline(text: string) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>");
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  const related = await getRelatedPosts(post, 3);
  const shopCats = await getCategoriesForPost(post, 4);
  const canonicalUrl = `${site.url}/blog/${post.slug}`;

  // BlogPosting structured data (AEO)
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt ?? undefined,
    image: post.coverImage ? [post.coverImage] : undefined,
    datePublished: post.createdAt.toISOString(),
    dateModified: post.updatedAt.toISOString(),
    keywords: post.tags?.length ? post.tags.join(", ") : undefined,
    wordCount: post.content.split(/\s+/).filter(Boolean).length,
    inLanguage: "en-PK",
    articleSection: post.category ?? undefined,
    author: { "@type": "Organization", name: site.name, url: site.url },
    publisher: {
      "@type": "Organization",
      name: site.name,
      logo: { "@type": "ImageObject", url: `${site.url}/favicon.ico` },
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": canonicalUrl },
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: site.url },
      { "@type": "ListItem", position: 2, name: "Blog", item: `${site.url}/blog` },
      { "@type": "ListItem", position: 3, name: post.title, item: canonicalUrl },
    ],
  };

  return (
    <article className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />

      <nav className="text-sm text-muted" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-foreground">Home</Link>
        <span className="mx-2">/</span>
        <Link href="/blog" className="hover:text-foreground">Blog</Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">{post.title}</span>
      </nav>

      <header className="mt-6 border-b border-border pb-6">
        <div className="flex items-center gap-3 text-xs text-muted">
          {post.category && (
            <span className="font-semibold uppercase tracking-wider text-accent">
              {post.category}
            </span>
          )}
          <span>{formatDate(post.createdAt)}</span>
        </div>
        <h1 className="mt-3 text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
          {post.title}
        </h1>
      </header>

      {post.coverImage && (
        <div className="mt-8 overflow-hidden rounded-2xl border border-border">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={post.coverImage}
            alt={post.title}
            className="w-full object-cover"
          />
        </div>
      )}

      <div className="mt-8">{renderContent(post.content)}</div>

      {related.length > 0 && (
        <section className="mt-12 border-t border-border pt-8" aria-labelledby="related-heading">
          <h2 id="related-heading" className="text-lg font-semibold">
            Related posts
          </h2>
          <ul className="mt-4 grid gap-4 sm:grid-cols-3">
            {related.map((r) => (
              <li key={r.id}>
                <Link
                  href={`/blog/${r.slug}`}
                  className="group block rounded-xl border border-border p-4 transition-shadow hover:shadow-md"
                >
                  <p className="text-sm font-semibold leading-snug group-hover:text-brand">
                    {r.title}
                  </p>
                  <p className="mt-1 text-xs text-muted">{formatDate(r.createdAt)}</p>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {shopCats.length > 0 && (
        <section className="mt-12 rounded-2xl border border-border bg-background p-6" aria-labelledby="shop-topic-heading">
          <h2 id="shop-topic-heading" className="text-sm font-semibold">
            Shop this topic
          </h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {shopCats.map((c) => (
              <Link
                key={c.id}
                href={`/shop?category=${c.slug}`}
                className="rounded-full border border-border px-4 py-1.5 text-sm font-medium transition-colors hover:border-brand hover:text-brand"
              >
                {c.name}
              </Link>
            ))}
          </div>
        </section>
      )}

      <footer className="mt-8 rounded-2xl border border-border bg-background p-6">
        <p className="text-sm text-muted">
          Looking for furniture?{" "}
          <Link href="/shop" className="font-semibold text-brand hover:underline">
            Browse the shop →
          </Link>
        </p>
      </footer>
    </article>
  );
}
