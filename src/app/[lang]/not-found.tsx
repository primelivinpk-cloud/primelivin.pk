import Link from "next/link";
import { lang as rootLang } from "next/root-params";
import { isLocale, localize, type Locale } from "@/lib/i18n";
import { t } from "@/lib/i18n/ui";

export default async function NotFound() {
  let lang: Locale = "en";
  try {
    const raw = await rootLang();
    if (raw && isLocale(raw)) lang = raw;
  } catch {
    // root params unavailable (e.g. outside [lang] rendering) — fall back to English
  }
  const d = t(lang).notFound;

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-3xl flex-col items-center justify-center px-4 py-16 text-center">
      <p className="text-6xl font-bold text-brand">404</p>
      <h1 className="mt-4 text-2xl font-bold tracking-tight">{d.title}</h1>
      <p className="mt-2 text-muted">{d.text}</p>
      <div className="mt-8 flex gap-3">
        <Link
          href={localize("/", lang)}
          className="rounded-lg bg-brand px-6 py-3 text-sm font-semibold text-brand-fg transition-opacity hover:opacity-90"
        >
          {d.goHome}
        </Link>
        <Link
          href={localize("/shop", lang)}
          className="rounded-lg border border-border px-6 py-3 text-sm font-semibold transition-colors hover:border-brand"
        >
          {d.browseShop}
        </Link>
      </div>
    </div>
  );
}
