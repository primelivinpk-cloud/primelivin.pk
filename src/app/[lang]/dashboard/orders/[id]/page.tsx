import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { getOrderById } from "@/lib/orders";
import { formatPKR, formatDate } from "@/lib/format";
import { isLocale, localize, type Locale } from "@/lib/i18n";
import { t } from "@/lib/i18n/ui";
import { OrderTimeline, StatusBadge } from "@/components/dashboard/order-status";

type Props = { params: Promise<{ lang: string; id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang: raw } = await params;
  const lang: Locale = raw && isLocale(raw) ? raw : "en";
  return { title: t(lang).dashboard.trackTitle, robots: { index: false } };
}

export default async function TrackOrderPage({ params }: Props) {
  const { lang: raw, id } = await params;
  const lang: Locale = raw && isLocale(raw) ? raw : "en";
  const L = (path: string) => localize(path, lang);

  const user = await getSessionUser();
  if (!user) redirect(`${L("/login")}?next=${encodeURIComponent(`/dashboard/orders/${id}`)}`);

  const data = await getOrderById(id);
  if (!data || data.order.userId !== user.id) notFound();

  const { order, items } = data;
  const addr = order.shippingAddress;
  const d = t(lang);

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <nav className="text-sm text-muted" aria-label="Breadcrumb">
        <Link href={L("/dashboard")} className="hover:text-foreground">
          {d.dashboard.title}
        </Link>
        <span className="mx-2">/</span>
        <Link href={L("/dashboard/orders")} className="hover:text-foreground">
          {d.dashboard.myOrders}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">{order.id}</span>
      </nav>

      <div className="mt-6 flex flex-wrap items-end justify-between gap-3 border-b border-border pb-6">
        <div>
          <p className="text-sm text-muted">
            {d.dashboard.orderNo}{" "}
            <span className="font-semibold text-foreground">{order.id}</span>
          </p>
          <p className="mt-1 text-sm text-muted">
            {d.dashboard.orderDate}: {formatDate(order.createdAt)}
          </p>
        </div>
        <StatusBadge status={order.status} lang={lang} />
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_18rem]">
        <div className="space-y-8">
          <section className="rounded-2xl border border-border p-6" aria-labelledby="status-heading">
            <h2 id="status-heading" className="font-semibold">
              {d.dashboard.statusHeading}
            </h2>
            <div className="mt-5">
              <OrderTimeline status={order.status} lang={lang} />
            </div>
          </section>

          <section className="rounded-2xl border border-border p-6" aria-labelledby="items-heading">
            <div className="flex items-center justify-between">
              <h2 id="items-heading" className="font-semibold">
                {d.orders.items}
              </h2>
              <span className="text-xs text-muted">{d.dashboard.orderTotal}</span>
            </div>
            <ul className="mt-4 divide-y divide-border">
              {items.map((item) => (
                <li key={item.id} className="flex justify-between py-3 text-sm">
                  <span>
                    {item.title} <span className="text-muted">× {item.quantity}</span>
                  </span>
                  <span className="font-medium">{formatPKR(item.price * item.quantity)}</span>
                </li>
              ))}
            </ul>
            <div className="mt-2 flex justify-between border-t border-border pt-4 text-base font-bold">
              <span>{d.cart.total}</span>
              <span>{formatPKR(order.totalAmount)}</span>
            </div>
          </section>
        </div>

        <aside className="space-y-6">
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

          <Link
            href={L("/contact")}
            className="block rounded-2xl border border-border p-6 text-center text-sm font-semibold text-brand transition-colors hover:border-brand"
          >
            {d.orders.needHelp}
          </Link>
        </aside>
      </div>
    </div>
  );
}
