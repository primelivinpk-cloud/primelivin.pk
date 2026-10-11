import Link from "next/link";
import { site } from "@/lib/site";

// Computed once at module load so it's stable during prerendering.
const currentYear = new Date().getFullYear();

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand font-bold text-brand-fg">
                PL
              </span>
              <span className="text-lg font-semibold">{site.name}</span>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-muted">
              {site.description}
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold">Shop</h3>
            <ul className="mt-4 space-y-2 text-sm text-muted">
              <li><Link className="hover:text-foreground" href="/shop">All Furniture</Link></li>
              <li><Link className="hover:text-foreground" href="/shop?category=office-chairs">Office Chairs</Link></li>
              <li><Link className="hover:text-foreground" href="/shop?category=sofas">Sofas</Link></li>
              <li><Link className="hover:text-foreground" href="/shop?category=beds">Beds</Link></li>
              <li><Link className="hover:text-foreground" href="/shop?category=dining-sets">Dining Sets</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold">Company</h3>
            <ul className="mt-4 space-y-2 text-sm text-muted">
              <li><Link className="hover:text-foreground" href="/about">About Us</Link></li>
              <li><Link className="hover:text-foreground" href="/blog">Blog</Link></li>
              <li><Link className="hover:text-foreground" href="/contact">Contact</Link></li>
              <li><Link className="hover:text-foreground" href="/shipping">Shipping & Returns</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold">We Deliver Across Pakistan</h3>
            <ul className="mt-4 space-y-2 text-sm text-muted">
              {site.regions.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 sm:flex-row">
          <p className="text-sm text-muted">
            © {currentYear} {site.name}. All rights reserved.
          </p>
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
            <span className="font-medium">We accept:</span>
            {site.paymentMethods.map((m) => (
              <span key={m} className="rounded-full border border-border px-2.5 py-1">
                {m}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
