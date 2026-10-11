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
  const d = t(lang).pages.shipping;
  return {
    title: d.title,
    description: d.description,
    alternates: {
      canonical: canonicalFor("/shipping", lang),
      languages: languagesFor("/shipping"),
    },
  };
}

export default async function ShippingPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang: raw } = await params;
  const lang: Locale = raw && isLocale(raw) ? raw : "en";
  const d = t(lang).pages.shipping;

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold tracking-tight">{d.heading}</h1>

      <section className="mt-8">
        <h2 className="text-xl font-semibold">{d.deliveryTitle}</h2>
        <p className="mt-2 text-muted">{d.deliveryText}</p>
        <div className="mt-5 overflow-hidden rounded-2xl border border-border">
          <table className="w-full text-start text-sm">
            <thead className="bg-brand/10">
              <tr>
                <th className="px-4 py-3 font-semibold">{d.regionCol}</th>
                <th className="px-4 py-3 font-semibold">{d.estimateCol}</th>
              </tr>
            </thead>
            <tbody>
              {site.regions.map((r, i) => (
                <tr key={r} className={i % 2 ? "bg-background" : "bg-background/50"}>
                  <td className="border-t border-border px-4 py-3">{r}</td>
                  <td className="border-t border-border px-4 py-3 text-muted">
                    {site.deliveryEstimates[r] ?? d.fallbackEstimate}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-semibold">{d.paymentTitle}</h2>
        <ul className="mt-3 list-disc space-y-1 ps-6 text-muted">
          {site.paymentMethods.map((m) => (
            <li key={m}>{m}</li>
          ))}
        </ul>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-semibold">{d.returnsTitle}</h2>
        <p className="mt-2 leading-relaxed text-muted">{d.returnsText}</p>
      </section>
    </div>
  );
}
