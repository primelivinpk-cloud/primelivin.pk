import Link from "next/link";
import { getAdminStats } from "@/lib/queries";
import { formatPKR } from "@/lib/format";

export default async function AdminOverviewPage() {
  const stats = await getAdminStats();

  const cards = [
    { label: "Total products", value: String(stats.totalProducts), href: "/admin/products" },
    { label: "Active products", value: String(stats.activeProducts), href: "/admin/products" },
    { label: "Featured", value: String(stats.featuredProducts), href: "/admin/products" },
    { label: "Out of stock", value: String(stats.outOfStock), href: "/admin/products" },
    { label: "Inventory value", value: formatPKR(stats.inventoryValue), href: "/admin/products" },
    { label: "Published posts", value: String(stats.publishedPosts), href: "/blog" },
    { label: "Orders", value: String(stats.totalOrders), href: "/admin" },
    { label: "Categories", value: "5", href: "/shop" },
  ];

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <Link
            key={c.label}
            href={c.href}
            className="rounded-2xl border border-border p-5 transition-colors hover:border-brand"
          >
            <p className="text-sm text-muted">{c.label}</p>
            <p className="mt-2 text-2xl font-bold">{c.value}</p>
          </Link>
        ))}
      </div>

      <div className="mt-10 rounded-2xl border border-border bg-background p-6">
        <h2 className="font-semibold">Quick actions</h2>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            href="/admin/products/new"
            className="rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-brand-fg transition-opacity hover:opacity-90"
          >
            + Add product
          </Link>
          <Link
            href="/admin/products"
            className="rounded-lg border border-border px-5 py-2.5 text-sm font-semibold transition-colors hover:border-brand"
          >
            Manage products
          </Link>
        </div>
        <p className="mt-4 text-sm text-muted">
          Note: admin routes are public right now. Auth protection lands in Phase 6.
        </p>
      </div>
    </div>
  );
}
