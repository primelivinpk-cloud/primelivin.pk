import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { getUserOrders } from "@/lib/queries";
import { formatPKR, formatDate } from "@/lib/format";
import { isLocale, localize, type Locale } from "@/lib/i18n";
import { t } from "@/lib/i18n/ui";
import { StatusBadge } from "@/components/dashboard/order-status";
import { DashboardNav } from "@/components/dashboard/dashboard-nav";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang: raw } = await params;
  const lang: Locale = raw && isLocale(raw) ? raw : "en";
  return { title: t(lang).dashboard.myOrders, robots: { index: false } };
}

export default async function DashboardOrdersPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang: raw } = await params;
  const lang: Locale = raw && isLocale(raw) ? raw : "en";
  const L = (path: string) => localize(path, lang);

  const user = await getSessionUser();
  if (!user) redirect(`${L("/login")}?next=${encodeURIComponent("/dashboard/orders")}`);

  const d = t(lang).dashboard;
  const rows = await getUserOrders(user.id);

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <nav className="text-sm text-muted" aria-label="Breadcrumb">
        <Link href={L("/dashboard")} className="hover:text-foreground">
          {t(lang).dashboard.title}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">{d.myOrders}</span>
      </nav>

      <div className="mt-4">
        <DashboardNav lang={lang} />
      </div>

      <div className="mt-6 flex items-end justify-between border-b border-border pb-6">
        <h1 className="text-3xl font-bold tracking-tight">{d.myOrders}</h1>
      </div>

      {rows.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-border p-12 text-center">
          <p className="text-lg font-medium">{d.noOrders}</p>
          <p className="mt-2 text-sm text-muted">{d.noOrdersYetText}</p>
          <Link
            href={L("/shop")}
            className="mt-6 inline-flex rounded-lg bg-brand px-6 py-3 text-sm font-semibold text-brand-fg transition-opacity hover:opacity-90"
          >
            {d.startShopping}
          </Link>
        </div>
      ) : (
        <ul className="mt-6 divide-y divide-border rounded-2xl border border-border">
          {rows.map(({ order, itemCount }) => (
            <li key={order.id}>
              <Link
                href={L(`/dashboard/orders/${order.id}`)}
                className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 transition-colors hover:bg-brand/5"
              >
                <div className="min-w-0">
                  <p className="text-sm font-semibold">
                    {d.orderNo} {order.id}
                  </p>
                  <p className="mt-0.5 text-xs text-muted">
                    {formatDate(order.createdAt)} · {d.itemCount(itemCount)} · {order.paymentMethod}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={order.status} lang={lang} />
                  <span className="text-sm font-bold">{formatPKR(order.totalAmount)}</span>
                  <span className="text-sm text-brand">{d.trackOrder} →</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
