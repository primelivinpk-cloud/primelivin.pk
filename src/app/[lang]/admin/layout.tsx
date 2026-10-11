import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: { default: "Admin", template: "Admin | %s" },
  robots: { index: false, follow: false },
};

const nav = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/products/new", label: "Add Product" },
  { href: "/admin/blog", label: "Blog" },
  { href: "/admin/blog/new", label: "Add Post" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="border-b border-border pb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Admin</h1>
            <p className="mt-1 text-sm text-muted">
              Manage products, inventory and content.
            </p>
          </div>
          <Link
            href="/"
            className="rounded-lg border border-border px-4 py-2 text-sm font-medium transition-colors hover:border-brand"
          >
            ← View store
          </Link>
        </div>

        <nav className="mt-4 flex gap-1 overflow-x-auto">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium text-muted transition-colors hover:bg-brand/10 hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>

      <div className="mt-8">{children}</div>
    </div>
  );
}
