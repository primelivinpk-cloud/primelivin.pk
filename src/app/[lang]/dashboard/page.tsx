import type { Metadata } from "next";
import Link from "next/link";
import { isLocale, localize, type Locale } from "@/lib/i18n";
import { t } from "@/lib/i18n/ui";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang: raw } = await params;
  const lang: Locale = raw && isLocale(raw) ? raw : "en";
  const d = t(lang).dashboard;
  return {
    title: d.title,
    description: d.description,
    robots: { index: false },
  };
}

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang: raw } = await params;
  const lang: Locale = raw && isLocale(raw) ? raw : "en";
  const d = t(lang).dashboard;

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold tracking-tight">{d.title}</h1>
      <p className="mt-2 text-muted">{d.intro}</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {d.sections.map((s) => (
          <div key={s.title} className="rounded-2xl border border-border p-6">
            <h2 className="font-semibold">{s.title}</h2>
            <p className="mt-2 text-sm text-muted">{s.desc}</p>
            <span className="mt-4 inline-block text-xs font-medium text-accent">
              {d.phase6}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-8 flex gap-3">
        <Link
          href={localize("/shop", lang)}
          className="rounded-lg bg-brand px-6 py-3 text-sm font-semibold text-brand-fg transition-opacity hover:opacity-90"
        >
          {t(lang).cart.continueShopping}
        </Link>
        <Link
          href={localize("/contact", lang)}
          className="rounded-lg border border-border px-6 py-3 text-sm font-semibold transition-colors hover:border-brand"
        >
          {d.contactSupport}
        </Link>
      </div>
    </div>
  );
}
