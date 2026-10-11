import type { Metadata } from "next";
import { CartView } from "@/components/cart/cart-view";
import { isLocale, type Locale } from "@/lib/i18n";
import { t } from "@/lib/i18n/ui";

export const metadata: Metadata = {
  title: "Your Cart",
  description: "Review items in your cart before checkout.",
  robots: { index: false },
};

export default async function CartPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang: raw } = await params;
  const lang: Locale = raw && isLocale(raw) ? raw : "en";

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold tracking-tight">{t(lang).cart.title}</h1>
      <CartView lang={lang} />
    </div>
  );
}
