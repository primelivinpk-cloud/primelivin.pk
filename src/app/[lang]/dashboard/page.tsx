import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { logout } from "@/app/actions/auth";
import { getSessionUser } from "@/lib/auth";
import { getUserOrders, getUserOrderStats } from "@/lib/queries";
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
  return {
    title: t(lang).dashboard.title,
    description: t(lang).dashboard.description,
    robots: { index: false },
  };
}

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang: raw } = await params;
  const lang: Locale = raw && isLocale(raw) ? raw : "en";
  const L = (path: string) => localize(path, lang);

  const user = await getSessionUser();
  if (!user) redirect(`${L("/login")}?next=${encodeURIComponent("/dashboard")}`);

  const d = t(lang).dashboard;
  const [stats, recent] = await Promise.all([
    getUserOrderStats(user.id),
    getUserOrders(user.id),
  ]);
  const recentOrders = recent.slice(0, 3);

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <DashboardNav lang={lang} />

      <div className="mt-8 flex flex-wrap items-end justify-between gap-4 border-b border-border pb-6">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-muted">{d.overview}</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight">{d.welcome(user.name)}</h1>
        </div>
        <form action={logout}>
          <button
            type="submit"
            className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted transition-colors hover:border-brand hover:text-foreground"
          >
            {d.signOut}
          </button>
        </form>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-border p-6">
          <p className="text-sm text-muted">{d.totalOrders}</p>
          <p className="mt-1 text-3xl font-bold">{stats.totalOrders}</p>
        </div>
        <div className="rounded-2xl border border-border p-6">
          <p className="text-sm text-muted">{d.totalSpent}</p>
          <p className="mt-1 text-3xl font-bold">{formatPKR(stats.totalSpent)}</p>
        </div>
        <div className="flex flex-col justify-between rounded-2xl border border-border p-6">
          <div>
            <p className="text-sm text-muted">{d.profileTitle}</p>
            <p className="mt-1 truncate text-sm font-semibold">{user.email}</p>
          </div>
          <Link
            href={L("/dashboard/profile")}
            className="mt-3 text-sm font-semibold text-brand hover:underline"
          >
            {d.profileTitle} →
          </Link>
        </div>
      </div>

      <section className="mt-10" aria-labelledby="recent-orders">
        <div className="flex items-end justify-between">
          <h2 id="recent-orders" className="text-xl font-bold tracking-tight">
            {d.recentOrders}
          </h2>
          <Link
            href={L("/dashboard/orders")}
            className="text-sm font-semibold text-brand hover:underline"
          >
            {d.viewAllOrders}
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="mt-4 rounded-2xl border border-border p-10 text-center">
            <p className="text-lg font-medium">{d.noOrdersYet}</p>
            <p className="mt-2 text-sm text-muted">{d.noOrdersYetText}</p>
            <Link
              href={L("/shop")}
              className="mt-6 inline-flex rounded-lg bg-brand px-6 py-3 text-sm font-semibold text-brand-fg transition-opacity hover:opacity-90"
            >
              {d.startShopping}
            </Link>
          </div>
        ) : (
          <ul className="mt-4 divide-y divide-border rounded-2xl border border-border">
            {recentOrders.map(({ order, itemCount }) => (
              <li key={order.id}>
                <Link
                  href={L(`/dashboard/orders/${order.id}`)}
                  className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 transition-colors hover:bg-brand/5"
                >
                  <div>
                    <p className="text-sm font-semibold">
                      {d.orderNo} {order.id}
                    </p>
                    <p className="mt-0.5 text-xs text-muted">
                      {formatDate(order.createdAt)} · {d.itemCount(itemCount)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusBadge status={order.status} lang={lang} />
                    <span className="text-sm font-bold">{formatPKR(order.totalAmount)}</span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href={L("/dashboard/orders")}
          className="rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-brand-fg transition-opacity hover:opacity-90"
        >
          {d.myOrders}
        </Link>
        <Link
          href={L("/dashboard/profile")}
          className="rounded-lg border border-border px-5 py-2.5 text-sm font-medium transition-colors hover:border-brand"
        >
          {d.profileTitle}
        </Link>
        <Link
          href={L("/contact")}
          className="rounded-lg border border-border px-5 py-2.5 text-sm font-medium transition-colors hover:border-brand"
        >
          {d.contactSupport}
        </Link>
      </div>
    </div>
  );
}
