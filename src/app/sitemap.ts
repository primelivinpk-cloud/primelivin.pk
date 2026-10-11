import type { MetadataRoute } from "next";
import { site } from "@/lib/site";
import { getProducts, getPublishedPosts, getCategories } from "@/lib/queries";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, posts, categories] = await Promise.all([
    getProducts(),
    getPublishedPosts(),
    getCategories(),
  ]);

  const base = site.url.replace(/\/$/, "");

  /** hreflang alternates shared by the en/ur variants of a path. */
  const languages = (path: string) => ({
    "en-PK": path === "/" ? `${base}/` : `${base}${path}`,
    "ur-PK": path === "/" ? `${base}/ur` : `${base}/ur${path}`,
  });

  /** Emit the default (unprefixed) + Urdu entries for a path. */
  function entries(
    path: string,
    opts: Omit<MetadataRoute.Sitemap[number], "url" | "alternates"> = {}
  ): MetadataRoute.Sitemap {
    const urdu = { url: path === "/" ? `${base}/ur` : `${base}/ur${path}`, ...opts };
    const english = { url: path === "/" ? `${base}/` : `${base}${path}`, ...opts };
    const withAlt = (e: typeof english) => ({
      ...e,
      alternates: { languages: languages(path) },
    });
    return site.urduEnabled ? [withAlt(english), withAlt(urdu)] : [withAlt(english)];
  }

  const staticRoutes: MetadataRoute.Sitemap = [
    ...entries("/", { changeFrequency: "daily", priority: 1 }),
    ...entries("/shop", { changeFrequency: "daily", priority: 0.9 }),
    ...entries("/blog", { changeFrequency: "weekly", priority: 0.7 }),
    ...entries("/about", { changeFrequency: "monthly", priority: 0.5 }),
    ...entries("/contact", { changeFrequency: "monthly", priority: 0.5 }),
    ...entries("/shipping", { changeFrequency: "monthly", priority: 0.5 }),
    ...entries("/faq", { changeFrequency: "weekly", priority: 0.6 }),
  ];

  const productRoutes: MetadataRoute.Sitemap = products.flatMap((p) =>
    entries(`/shop/${p.slug}`, {
      lastModified: p.updatedAt,
      changeFrequency: "weekly",
      priority: 0.8,
    })
  );

  const categoryRoutes: MetadataRoute.Sitemap = categories.flatMap((c) =>
    entries(`/shop?category=${c.slug}`, {
      changeFrequency: "weekly",
      priority: 0.6,
    })
  );

  const postRoutes: MetadataRoute.Sitemap = posts.flatMap((p) =>
    entries(`/blog/${p.slug}`, {
      lastModified: p.updatedAt,
      changeFrequency: "monthly",
      priority: 0.6,
    })
  );

  return [...staticRoutes, ...productRoutes, ...categoryRoutes, ...postRoutes];
}
