import Link from "next/link";
import { site } from "@/lib/site";
import { localize, type Locale } from "@/lib/i18n";
import { t } from "@/lib/i18n/ui";

// Computed once at module load so it's stable during prerendering.
const currentYear = new Date().getFullYear();

export function SiteFooter({ lang }: { lang: Locale }) {
  const d = t(lang);
  const L = (path: string) => localize(path, lang);

  const shopLinks = [
    { href: "/shop", label: d.footer.allFurniture },
    { href: "/shop?category=office-chairs", label: d.footer.officeChairs },
    { href: "/shop?category=sofas", label: d.footer.sofas },
    { href: "/shop?category=beds", label: d.footer.beds },
    { href: "/shop?category=dining-sets", label: d.footer.diningSets },
  ];

  const companyLinks = [
    { href: "/about", label: d.footer.aboutUs },
    { href: "/blog", label: d.footer.blog },
    { href: "/contact", label: d.footer.contact },
    { href: "/faq", label: d.footer.faq },
    { href: "/shipping", label: d.footer.shipping },
  ];

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
            <h3 className="text-sm font-semibold">{d.footer.shop}</h3>
            <ul className="mt-4 space-y-2 text-sm text-muted">
              {shopLinks.map((l) => (
                <li key={l.href}>
                  <Link className="hover:text-foreground" href={L(l.href)}>
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold">{d.footer.company}</h3>
            <ul className="mt-4 space-y-2 text-sm text-muted">
              {companyLinks.map((l) => (
                <li key={l.href}>
                  <Link className="hover:text-foreground" href={L(l.href)}>
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold">{d.footer.deliverTitle}</h3>
            <ul className="mt-4 space-y-2 text-sm text-muted">
              {site.regions.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 sm:flex-row">
          <p className="text-sm text-muted">
            © {currentYear} {site.name}. {d.footer.rights}
          </p>
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
            <span className="font-medium">{d.footer.weAccept}</span>
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
