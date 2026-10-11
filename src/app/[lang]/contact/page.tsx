import type { Metadata } from "next";
import { canonicalFor, isLocale, languagesFor, type Locale } from "@/lib/i18n";
import { t } from "@/lib/i18n/ui";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang: raw } = await params;
  const lang: Locale = raw && isLocale(raw) ? raw : "en";
  const d = t(lang).pages.contact;
  return {
    title: d.title,
    description: d.description,
    alternates: {
      canonical: canonicalFor("/contact", lang),
      languages: languagesFor("/contact"),
    },
  };
}

export default async function ContactPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang: raw } = await params;
  const lang: Locale = raw && isLocale(raw) ? raw : "en";
  const d = t(lang).pages.contact;

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold tracking-tight">{d.title}</h1>
      <p className="mt-2 text-muted">{d.intro}</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-border p-6">
          <h2 className="font-semibold">{d.support}</h2>
          <p className="mt-2 text-sm text-muted">{d.hours}</p>
          <p className="mt-3 text-sm">{d.email} support@primelivin.pk</p>
          <p className="mt-1 text-sm">{d.phone} +92 300 0000000</p>
        </div>
        <div className="rounded-2xl border border-border p-6">
          <h2 className="font-semibold">{d.showroom}</h2>
          <p className="mt-2 text-sm text-muted">{d.showroomText}</p>
          <p className="mt-3 text-sm">Islamabad, Pakistan</p>
        </div>
      </div>

      <form className="mt-10 space-y-4 rounded-2xl border border-border p-6">
        <h2 className="font-semibold">{d.sendTitle}</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <input required placeholder={d.namePlaceholder} className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm outline-none focus:border-brand" />
          <input required type="email" placeholder={d.emailPlaceholder} className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm outline-none focus:border-brand" />
        </div>
        <textarea required placeholder={d.helpPlaceholder} rows={5} className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm outline-none focus:border-brand" />
        <button type="submit" className="rounded-lg bg-brand px-6 py-3 text-sm font-semibold text-brand-fg transition-opacity hover:opacity-90">
          {d.sendButton}
        </button>
      </form>
    </div>
  );
}
