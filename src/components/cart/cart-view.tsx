"use client";

import { useState } from "react";
import Link from "next/link";
import { useCart } from "@/components/cart/cart-provider";
import { formatPKR } from "@/lib/format";
import { localize, type Locale } from "@/lib/i18n";
import { t } from "@/lib/i18n/ui";

export function CartView({ lang }: { lang: Locale }) {
  const { cart, loading, error, setQuantity, removeItem, clear } = useCart();
  const [busyId, setBusyId] = useState<string | null>(null);
  const d = t(lang);

  if (loading) {
    return (
      <div className="mt-10 space-y-4">
        {[0, 1].map((i) => (
          <div key={i} className="h-28 animate-pulse rounded-2xl border border-border bg-foreground/5" />
        ))}
      </div>
    );
  }

  if (cart.items.length === 0) {
    return (
      <div className="mt-10 rounded-2xl border border-border p-12 text-center">
        <p className="text-lg font-medium">{d.cart.emptyTitle}</p>
        <p className="mt-2 text-muted">{d.cart.emptyText}</p>
        <Link
          href={localize("/shop", lang)}
          className="mt-6 inline-flex rounded-lg bg-brand px-6 py-3 text-sm font-semibold text-brand-fg transition-opacity hover:opacity-90"
        >
          {d.cart.continueShopping}
        </Link>
      </div>
    );
  }

  const changeQty = async (productId: string, quantity: number) => {
    setBusyId(productId);
    try {
      await setQuantity(productId, quantity);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <>
      {error && (
        <div className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <ul className="mt-8 divide-y divide-border border-y border-border">
        {cart.items.map((item) => (
          <li key={item.id} className="flex gap-4 py-6">
            <Link
              href={localize(`/shop/${item.product.slug}`, lang)}
              className="h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-brand/10"
            >
              {item.product.images?.[0] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.product.images[0]}
                  alt={item.product.title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-[10px] text-muted">
                  {d.cart.view}
                </div>
              )}
            </Link>

            <div className="flex min-w-0 flex-1 flex-col">
              <div className="flex items-start justify-between gap-4">
                <Link
                  href={localize(`/shop/${item.product.slug}`, lang)}
                  className="text-sm font-semibold hover:text-brand"
                >
                  {item.product.title}
                </Link>
                <p className="shrink-0 text-sm font-bold">{formatPKR(item.lineTotal)}</p>
              </div>

              <p className="mt-1 text-xs text-muted">{d.cart.each(formatPKR(item.product.price))}</p>

              <div className="mt-auto flex items-center gap-3 pt-3">
                <div className="inline-flex items-center rounded-lg border border-border">
                  <button
                    type="button"
                    aria-label={d.cart.decreaseQty}
                    disabled={busyId === item.productId}
                    onClick={() => changeQty(item.productId, item.quantity - 1)}
                    className="h-9 w-9 text-lg leading-none disabled:opacity-40"
                  >
                    −
                  </button>
                  <span className="w-8 text-center text-sm font-medium tabular-nums">
                    {item.quantity}
                  </span>
                  <button
                    type="button"
                    aria-label={d.cart.increaseQty}
                    disabled={
                      busyId === item.productId || item.quantity >= item.product.stockQuantity
                    }
                    onClick={() => changeQty(item.productId, item.quantity + 1)}
                    className="h-9 w-9 text-lg leading-none disabled:opacity-40"
                  >
                    +
                  </button>
                </div>

                <button
                  type="button"
                  disabled={busyId === item.productId}
                  onClick={() => removeItem(item.productId)}
                  className="text-xs font-medium text-muted underline-offset-2 hover:text-foreground hover:underline disabled:opacity-40"
                >
                  {d.common.removeFromCart}
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
        <button
          type="button"
          onClick={() => clear()}
          className="text-xs font-medium text-muted hover:text-foreground"
        >
          {d.cart.clearCart}
        </button>
        <p className="text-sm text-muted">
          {d.cart.itemCount(cart.itemCount)}
        </p>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_20rem]">
        <div className="rounded-2xl border border-border bg-background p-6 lg:col-start-2">
          <h2 className="font-semibold">{d.cart.summary}</h2>
          <div className="mt-4 space-y-2 text-sm">
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

          <Link
            href={localize("/checkout", lang)}
            className="mt-6 block w-full rounded-xl bg-brand px-6 py-4 text-center text-base font-semibold text-brand-fg transition-opacity hover:opacity-90"
          >
            {d.cart.proceed}
          </Link>
          <p className="mt-3 text-center text-xs text-muted">
            {d.cart.paymentNote}
          </p>
        </div>
      </div>
    </>
  );
}
