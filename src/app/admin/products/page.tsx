import type { Metadata } from "next";
import Link from "next/link";
import { getAllProducts } from "@/lib/queries";
import { formatPKR } from "@/lib/format";
import { ProductRowActions } from "@/components/admin/product-row-actions";

export const metadata: Metadata = { title: "Products" };
export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const items = await getAllProducts();

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">All products ({items.length})</h2>
        <Link
          href="/admin/products/new"
          className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-brand-fg transition-opacity hover:opacity-90"
        >
          + Add product
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-border p-12 text-center">
          <p className="font-medium">No products yet</p>
          <p className="mt-2 text-sm text-muted">Create your first product to get started.</p>
        </div>
      ) : (
        <div className="mt-6 overflow-hidden rounded-2xl border border-border">
          <table className="w-full text-left text-sm">
            <thead className="bg-brand/10">
              <tr>
                <th className="px-4 py-3 font-semibold">Product</th>
                <th className="px-4 py-3 font-semibold">Category</th>
                <th className="px-4 py-3 font-semibold">Price</th>
                <th className="px-4 py-3 font-semibold">Stock</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((p, i) => (
                <tr key={p.id} className={i % 2 ? "bg-background" : "bg-background/50"}>
                  <td className="border-t border-border px-4 py-3">
                    <Link
                      href={`/admin/products/${p.id}/edit`}
                      className="font-medium hover:text-brand"
                    >
                      {p.title}
                    </Link>
                    <p className="mt-0.5 text-xs text-muted">/{p.slug}</p>
                  </td>
                  <td className="border-t border-border px-4 py-3 text-muted">
                    {p.categorySlug}
                  </td>
                  <td className="border-t border-border px-4 py-3">
                    {formatPKR(p.price)}
                    {p.compareAtPrice && (
                      <span className="ml-1 text-xs text-muted line-through">
                        {formatPKR(p.compareAtPrice)}
                      </span>
                    )}
                  </td>
                  <td className="border-t border-border px-4 py-3">
                    <span className={p.stockQuantity <= 0 ? "text-red-500" : ""}>
                      {p.stockQuantity}
                    </span>
                  </td>
                  <td className="border-t border-border px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      <Badge tone={p.isActive ? "green" : "gray"}>
                        {p.isActive ? "Active" : "Inactive"}
                      </Badge>
                      {p.isFeatured && <Badge tone="amber">Featured</Badge>}
                    </div>
                  </td>
                  <td className="border-t border-border px-4 py-3">
                    <ProductRowActions id={p.id} title={p.title} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function Badge({ children, tone }: { children: React.ReactNode; tone: "green" | "amber" | "gray" }) {
  const colors = {
    green: "bg-green-500/10 text-green-600 dark:text-green-400",
    amber: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    gray: "bg-gray-500/10 text-muted",
  } as const;
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${colors[tone]}`}>
      {children}
    </span>
  );
}
