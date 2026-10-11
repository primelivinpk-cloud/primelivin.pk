import { NextResponse, type NextRequest } from "next/server";

/**
 * Locale routing:
 * - English (default): unprefixed URLs (/shop) — rewritten internally to /en/shop,
 *   so deployed canonical URLs never change.
 * - Urdu: prefixed URLs (/ur/shop) when NEXT_PUBLIC_ENABLE_URDU !== "false".
 *
 * This file must stay self-contained (no shared app imports) per Next docs.
 */
const DEFAULT_LOCALE = "en";

function urduEnabled(): boolean {
  return process.env.NEXT_PUBLIC_ENABLE_URDU !== "false";
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const first = pathname === "/" ? "" : pathname.split("/")[1];

  if (first === "ur") {
    if (!urduEnabled()) {
      const url = request.nextUrl.clone();
      url.pathname = `/${DEFAULT_LOCALE}${pathname.slice("/ur".length)}`;
      return NextResponse.rewrite(url);
    }
    return NextResponse.next();
  }

  if (first === DEFAULT_LOCALE) {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  url.pathname = `/${DEFAULT_LOCALE}${pathname === "/" ? "" : pathname}`;
  return NextResponse.rewrite(url);
}

export const config = {
  // Skip API routes, Next internals and any path containing a file extension.
  matcher: ["/((?!_next|api|.*\\..*).*)"],
};
