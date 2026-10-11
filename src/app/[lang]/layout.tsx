import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { CartProvider } from "@/components/cart/cart-provider";
import { site } from "@/lib/site";
import { organizationLd, websiteLd } from "@/lib/structured-data";
import { JsonLd } from "@/components/json-ld";
import { canonicalFor, isLocale, ogLocale, type Locale } from "@/lib/i18n";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang: raw } = await params;
  const lang: Locale = isLocale(raw) ? raw : "en";

  return {
    metadataBase: new URL(site.url),
    title: {
      default: `${site.name} — ${site.tagline}`,
      template: `%s | ${site.name}`,
    },
    description: site.description,
    openGraph: {
      type: "website",
      locale: ogLocale(lang),
      url: canonicalFor("/", lang),
      siteName: site.name,
      title: `${site.name} — ${site.tagline}`,
      description: site.description,
    },
    twitter: {
      card: "summary_large_image",
      title: `${site.name} — ${site.tagline}`,
      description: site.description,
    },
    // Canonical + hreflang are set per-page (page-specific alternates).
    // GEO: Pakistan targeting signals for search engines
    other: {
      "geo.region": site.geo.countryCode,
      "geo.placename": site.geo.placename,
      "geo.position": `${site.geo.latitude};${site.geo.longitude}`,
      ICBM: `${site.geo.latitude}, ${site.geo.longitude}`,
    },
  };
}

export function generateStaticParams() {
  return [{ lang: "en" }, { lang: "ur" }];
}

export default async function RootLayout({
  children,
  params,
}: LayoutProps<"/[lang]">) {
  const { lang: raw } = await params;
  const lang: Locale = isLocale(raw) ? raw : "en";

  return (
    <html
      lang={lang}
      dir={lang === "ur" ? "rtl" : "ltr"}
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <JsonLd data={organizationLd()} />
        <JsonLd data={websiteLd()} />
        <CartProvider>
          <SiteHeader lang={lang} />
          <main className="flex-1">{children}</main>
          <SiteFooter lang={lang} />
        </CartProvider>
      </body>
    </html>
  );
}
