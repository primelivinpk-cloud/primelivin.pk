import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getOrderById } from "@/lib/orders";
import { formatPKR, formatDate } from "@/lib/format";
import { isLocale, localize, type Locale } from "@/lib/i18n";
import { t } from "@/lib/i18n/ui";

type Props = { params: Promise<{ lang: string; id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  return { title: `Order ${id}`, robots: { index: false } };
}

export default async function OrderPage({ params }: Props) {
  const { id, lang: raw } = await params;
  const lang: Locale = raw && isLocale(raw) ? raw : "en";
  const d = t(lang);
  const L = (path: string) => localize(path, lang);
  const data = await getOrderById(id);
  if (!data) notFound();

  const { order, items } = data;
  const addr = order.shippingAddress;

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="rounded-2xl border border-border bg-brand/5 p-8 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand text-brand-fg">
          ✓
        </div>
        <h1 className="mt-4 text-2xl font-bold tracking-tight">
          {d.orders.thankYou}
        </h1>
        <p className="mt-2 text-sm text-muted">
          {d.orders.orderLabel} <span className="font-semibold text-foreground">{order.id}</span> ·{" "}
          {formatDate(order.createdAt)}
        </p>
        <p className="mt-4 text-sm text-muted">{d.orders.callNote(order.customerPhone)}</p>
      </div>

      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        <div className="rounded-2xl border border-border p-6">
          <h2 className="text-sm font-semibold">{d.orders.shippingTo}</h2>
          <div className="mt-2 text-sm text-muted">
            <p className="font-medium text-foreground">{order.customerName}</p>
            {addr && (
              <>
                <p className="mt-1">{addr.line1}</p>
                {addr.line2 && <p>{addr.line2}</p>}
                <p>
                  {addr.city}, {addr.region}
                  {addr.postalCode ? ` ${addr.postalCode}` : ""}
                </p>
              </>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-border p-6">
          <h2 className="text-sm font-semibold">{d.orders.payment}</h2>
          <div className="mt-2 text-sm text-muted">
            <p className="font-medium text-foreground">{order.paymentMethod}</p>
            <p className="mt-1 capitalize">{order.paymentStatus}</p>
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-border p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold">{d.orders.items}</h2>
          <span className="inline-flex rounded-full bg-brand/10 px-3 py-1 text-xs font-semibold text-brand">
            {d.orders.statuses[order.status] ?? order.status}
          </span>
        </div>

        <ul className="mt-4 divide-y divide-border">
          {items.map((item) => (
            <li key={item.id} className="flex justify-between py-3 text-sm">
              <span>
                {item.title}{" "}
                <span className="text-muted">× {item.quantity}</span>
              </span>
              <span className="font-medium">{formatPKR(item.price * item.quantity)}</span>
            </li>
          ))}
        </ul>

        <div className="mt-2 flex justify-between border-t border-border pt-4 font-bold">
          <span>{d.cart.total}</span>
          <span>{formatPKR(order.totalAmount)}</span>
        </div>
      </div>

      <div className="mt-8 flex justify-center gap-4">
        <Link
          href={L("/shop")}
          className="rounded-lg bg-brand px-6 py-3 text-sm font-semibold text-brand-fg transition-opacity hover:opacity-90"
        >
          {d.cart.continueShopping}
        </Link>
        <Link
          href={L("/contact")}
          className="rounded-lg border border-border px-6 py-3 text-sm font-semibold transition-colors hover:border-brand"
        >
          {d.orders.needHelp}
        </Link>
      </div>
    </div>
  );
}
