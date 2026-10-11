import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { getCart, pruneInvalidItems } from "@/lib/cart";
import { CheckoutForm } from "@/components/checkout/checkout-form";
import { formatPKR } from "@/lib/format";
import { isLocale, localize, type Locale } from "@/lib/i18n";
import { t } from "@/lib/i18n/ui";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Complete your order — Cash on Delivery and local payment options across Pakistan.",
  robots: { index: false },
};

export default async function CheckoutPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang: raw } = await params;
  const lang: Locale = raw && isLocale(raw) ? raw : "en";
  const d = t(lang);
  const cartHref = localize("/cart", lang);

  const store = await cookies();
  const token = store.get("cart_token")?.value;
  if (!token) redirect(cartHref);

  await pruneInvalidItems(token);
  const cart = await getCart(token);
  if (cart.items.length === 0) redirect(cartHref);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex items-baseline justify-between">
        <h1 className="text-3xl font-bold tracking-tight">{d.checkout.title}</h1>
        <Link href={cartHref} className="text-sm font-medium text-muted hover:text-foreground">
          {d.checkout.backToCart}
        </Link>
      </div>

      <div className="mt-10 grid gap-12 lg:grid-cols-[1.4fr_1fr]">
        <div>
          <CheckoutForm lang={lang} />
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-2xl border border-border bg-background p-6">
            <h2 className="font-semibold">{d.checkout.orderSummary}</h2>

            <ul className="mt-4 divide-y divide-border">
              {cart.items.map((item) => (
                <li key={item.id} className="flex gap-3 py-4 first:pt-0">
                  <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-brand/10">
                    {item.product.images?.[0] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.product.images[0]}
                        alt={item.product.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-[10px] text-muted">
                        {item.product.categorySlug.replace(/-/g, " ")}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{item.product.title}</p>
                    <p className="mt-0.5 text-xs text-muted">{d.checkout.qty(item.quantity)}</p>
                  </div>
                  <p className="text-sm font-semibold">{formatPKR(item.lineTotal)}</p>
                </li>
              ))}
            </ul>

            <div className="mt-2 space-y-2 border-t border-border pt-4 text-sm">
              <div className="flex justify-between">
                <span className="text-muted">{d.cart.subtotal}</span>
                <span>{formatPKR(cart.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">{d.cart.delivery}</span>
                <span className="font-medium text-brand">{d.cart.free}</span>
              </div>
              <div className="flex justify-between border-t border-border pt-3 text-base font-bold">
                <span>{d.cart.total}</span>
                <span>{formatPKR(cart.subtotal)}</span>
              </div>
            </div>

            <p className="mt-4 text-xs text-muted">
              {d.checkout.dispatchNote}
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
