import type { Metadata } from "next";
import { site } from "@/lib/site";
import { canonicalFor, isLocale, languagesFor, type Locale } from "@/lib/i18n";
import { t } from "@/lib/i18n/ui";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang: raw } = await params;
  const lang: Locale = raw && isLocale(raw) ? raw : "en";
  const d = t(lang);
  return {
    title: d.pages.about.title,
    description: d.pages.about.description(site.name),
    alternates: {
      canonical: canonicalFor("/about", lang),
      languages: languagesFor("/about"),
    },
  };
}

export default async function AboutPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang: raw } = await params;
  const lang: Locale = raw && isLocale(raw) ? raw : "en";
  const d = t(lang).pages.about;

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold tracking-tight">{d.heading(site.name)}</h1>
      <div className="mt-6 space-y-4 leading-relaxed text-foreground/90">
        <p>{d.p1(site.name)}</p>
        <p>{d.p2}</p>
        <p>{d.p3}</p>
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-3">
        {[
          { k: d.statRegions, v: `${site.regions.length}+` },
          { k: d.statPayments, v: `${site.paymentMethods.length}` },
          { k: d.statCurrency, v: site.currency },
        ].map((s) => (
          <div key={s.k} className="rounded-xl border border-border p-5 text-center">
            <p className="text-2xl font-bold">{s.v}</p>
            <p className="mt-1 text-sm text-muted">{s.k}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
