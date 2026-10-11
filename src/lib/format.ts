import { site } from "./site";

const formatterCache = new Map<string, Intl.NumberFormat>();

/** Resolve the display currency: env value if it's a valid code, else PKR. */
function resolveCurrency(): string {
  const c = site.currency;
  return /^[A-Za-z]{3}$/.test(c) ? c.toUpperCase() : "PKR";
}

function getFormatter(currency: string): Intl.NumberFormat {
  let f = formatterCache.get(currency);
  if (!f) {
    f = new Intl.NumberFormat("en-PK", {
      style: "currency",
      currency,
      currencyDisplay: "narrowSymbol",
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });
    formatterCache.set(currency, f);
  }
  return f;
}

/**
 * Format a number as store currency (PKR by default).
 * Integers stay clean ("Rs 25,000"); fractional amounts keep paisa
 * ("Rs 24,999.50") instead of silently rounding.
 * e.g. formatPKR(25000) => "Rs 25,000"
 */
export function formatPKR(amount: number): string {
  const out = getFormatter(resolveCurrency()).format(amount);
  // Pad a lone decimal digit to paisa: "Rs 24,999.5" -> "Rs 24,999.50"
  return /\.\d$/.test(out) ? out + "0" : out;
}

/**
 * Format a date for display.
 */
export function formatDate(date: Date | number | string): string {
  const d = typeof date === "string" || typeof date === "number" ? new Date(date) : date;
  return d.toLocaleDateString("en-PK", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * Convert a title into a URL-safe slug.
 */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Truncate text to a max length, appending an ellipsis.
 */
export function truncate(text: string, max = 160): string {
  if (text.length <= max) return text;
  return text.slice(0, max - 1).trimEnd() + "…";
}

/**
 * Generate a random unique ID (no external dependency).
 */
export function newId(prefix = "id"): string {
  return `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * Generate a short human-readable order number for confirmation URLs,
 * e.g. "PL-4KX9QT". Unguessable enough for guest order lookup.
 */
export function newOrderNumber(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let s = "";
  const bytes = new Uint8Array(6);
  crypto.getRandomValues(bytes);
  for (const b of bytes) s += alphabet[b % alphabet.length];
  return `PL-${s}`;
}
