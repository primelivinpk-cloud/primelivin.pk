import { site } from "@/lib/site";

export const locales = ["en", "ur"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

/**
 * Internal-path localizer.
 * English stays unprefixed (default locale, proxy rewrites /x -> /en/x);
 * Urdu is prefixed with /ur.
 */
export function localize(path: string, lang: Locale): string {
  const clean = path.startsWith("/") ? path : `/${path}`;
  if (lang === "ur") return clean === "/" ? "/ur" : `/ur${clean}`;
  return clean;
}

/** Absolute canonical URL for a path in a locale. */
export function canonicalFor(path: string, lang: Locale): string {
  const local = localize(path, lang);
  return local === "/" ? site.url : `${site.url}${local}`;
}

/** hreflang alternates for a path across supported locales. */
export function languagesFor(path: string): Record<string, string> {
  return {
    "en-PK": canonicalFor(path, "en"),
    "ur-PK": canonicalFor(path, "ur"),
  };
}

/** Open Graph locale code for a locale. */
export function ogLocale(lang: Locale): string {
  return lang === "ur" ? "ur_PK" : "en_PK";
}
