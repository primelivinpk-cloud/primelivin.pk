import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/lib/site";
import { faqLd, breadcrumbLd } from "@/lib/structured-data";
import { JsonLd } from "@/components/json-ld";
import { siteFaqs, categoryFaqs } from "@/lib/seo-content";
import { canonicalFor, isLocale, languagesFor, localize, type Locale } from "@/lib/i18n";
import { t } from "@/lib/i18n/ui";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang: raw } = await params;
  const lang: Locale = raw && isLocale(raw) ? raw : "en";
  const d = t(lang).pages.faq;
  return {
    title: d.title,
    description: d.description,
    alternates: {
      canonical: canonicalFor("/faq", lang),
      languages: languagesFor("/faq"),
    },
    openGraph: {
      title: "FAQ — Prime Livin",
      description: "Delivery, payments, returns and order tracking answers.",
      url: canonicalFor("/faq", lang),
    },
  };
}

export const revalidate = 3600;

export default async function FaqPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang: raw } = await params;
  const lang: Locale = raw && isLocale(raw) ? raw : "en";
  const d = t(lang).pages.faq;
  const categoryEntries = Object.entries(categoryFaqs);

  const jsonLd = faqLd(siteFaqs);
  const breadcrumb = breadcrumbLd([
    { name: "Home", url: site.url },
    { name: "FAQ" },
  ]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <JsonLd data={jsonLd} />
      <JsonLd data={breadcrumb} />

      <nav className="text-sm text-muted" aria-label="Breadcrumb">
        <Link href={localize("/", lang)} className="hover:text-foreground">{t(lang).common.home}</Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">FAQ</span>
      </nav>

      <h1 className="mt-6 text-3xl font-bold tracking-tight">{d.heading}</h1>
      <p className="mt-2 text-muted">{d.intro(site.name)}</p>

      <section className="mt-8" aria-label="General questions">
        <div className="divide-y divide-border border-y border-border">
          {siteFaqs.map((f, i) => (
            <details key={i} className="group py-4" open={i === 0}>
              <summary className="cursor-pointer list-none text-sm font-semibold marker:hidden">
                <span className="me-2 inline-block transition-transform group-open:rotate-90">
                  ›
                </span>
                {f.question}
              </summary>
              <p className="mt-2 ps-6 text-sm leading-relaxed text-muted">{f.answer}</p>
            </details>
          ))}
        </div>
      </section>

      {categoryEntries.map(([slug, faqs]) => (
        <section key={slug} className="mt-12" aria-label={`${slug} questions`}>
          <h2 className="text-xl font-bold tracking-tight">
            {d.catHeading(slug.replace(/-/g, " ").replace(/^\w/, (c) => c.toUpperCase()))}
          </h2>
          <div className="mt-4 divide-y divide-border border-y border-border">
            {faqs.map((f, i) => (
              <details key={i} className="group py-4">
                <summary className="cursor-pointer list-none text-sm font-semibold marker:hidden">
                  <span className="me-2 inline-block transition-transform group-open:rotate-90">
                    ›
                  </span>
                  {f.question}
                </summary>
                <p className="mt-2 ps-6 text-sm leading-relaxed text-muted">{f.answer}</p>
              </details>
            ))}
          </div>
        </section>
      ))}

      <div className="mt-12 rounded-2xl border border-border bg-background p-6 text-center">
        <p className="text-sm text-muted">
          {d.stillQuestion}{" "}
          <Link href={localize("/contact", lang)} className="font-semibold text-brand hover:underline">
            {d.contactTeam}
          </Link>
        </p>
      </div>
    </div>
  );
}
