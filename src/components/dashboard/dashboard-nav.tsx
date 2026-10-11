"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { localize, type Locale } from "@/lib/i18n";
import { t } from "@/lib/i18n/ui";

export function DashboardNav({ lang }: { lang: Locale }) {
  const pathname = usePathname();
  const d = t(lang);

  const links = [
    { href: localize("/dashboard", lang), label: d.dashboard.overview },
    { href: localize("/dashboard/orders", lang), label: d.dashboard.myOrders },
    { href: localize("/dashboard/profile", lang), label: d.dashboard.profileTitle },
    { href: localize("/dashboard/settings", lang), label: d.settings.title },
  ];

  return (
    <nav className="flex gap-1 overflow-x-auto border-b border-border" aria-label="Dashboard">
      {links.map((link) => {
        const active = pathname === link.href;
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`whitespace-nowrap border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
              active
                ? "border-brand text-foreground"
                : "border-transparent text-muted hover:text-foreground"
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
