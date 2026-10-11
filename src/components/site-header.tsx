"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useCart } from "@/components/cart/cart-provider";
import { localize, type Locale } from "@/lib/i18n";
import { t } from "@/lib/i18n/ui";

function LanguageSwitcher({ lang }: { lang: Locale }) {
  const pathname = usePathname();
  const base = pathname.replace(/^\/(en|ur)(?=\/|$)/, "") || "/";
  const isUr = lang === "ur";
  const urduHref = base === "/" ? "/ur" : `/ur${base}`;
  const englishHref = base;

  return (
    <div className="flex items-center gap-1.5 rounded-lg border border-border px-2 py-1 text-xs font-semibold">
      <Link
        href={englishHref}
        hrefLang="en-PK"
        className={!isUr ? "text-brand" : "text-muted hover:text-foreground"}
      >
        {t(lang).switcher.en}
      </Link>
      <span aria-hidden className="text-muted/50">
        |
      </span>
      <Link
        href={urduHref}
        hrefLang="ur-PK"
        lang="ur"
        className={isUr ? "text-brand" : "text-muted hover:text-foreground"}
      >
        {t(lang).switcher.ur}
      </Link>
    </div>
  );
}

export function SiteHeader({ lang }: { lang: Locale }) {
  const [open, setOpen] = useState(false);
  const [authed, setAuthed] = useState<boolean | null>(null);
  const pathname = usePathname();
  const { cart } = useCart();
  const count = cart.itemCount;
  const d = t(lang);

  useEffect(() => {
    let alive = true;
    fetch("/api/auth/me", { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => {
        if (alive) setAuthed(Boolean(data?.user));
      })
      .catch(() => {
        if (alive) setAuthed(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  const accountHref = localize(authed === false ? "/login" : "/dashboard", lang);
  const accountLabel = authed === false ? d.auth.signIn : d.nav.account;

  const nav = [
    { href: "/", label: d.nav.home },
    { href: "/shop", label: d.nav.shop },
    { href: "/blog", label: d.nav.blog },
    { href: "/about", label: d.nav.about },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href={localize("/", lang)} className="flex items-center gap-2" onClick={() => setOpen(false)}>
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand font-bold text-brand-fg">
            PL
          </span>
          <span className="text-lg font-semibold tracking-tight">
            Prime Livin
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {nav.map((item) => {
            const href = localize(item.href, lang);
            const active =
              item.href === "/" ? pathname === "/" || pathname === "/ur" : pathname.startsWith(href);
            return (
              <Link
                key={item.href}
                href={href}
                className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  active
                    ? "text-brand"
                    : "text-muted hover:text-foreground"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <LanguageSwitcher lang={lang} />
          <Link
            href={localize("/admin", lang)}
            className="text-sm font-medium text-muted transition-colors hover:text-foreground"
          >
            {d.nav.admin}
          </Link>
          <Link
            href={accountHref}
            className="text-sm font-medium text-muted transition-colors hover:text-foreground"
          >
            {accountLabel}
          </Link>
          <Link
            href={localize("/cart", lang)}
            className="inline-flex items-center gap-2 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-brand-fg transition-opacity hover:opacity-90"
          >
            {d.nav.cart}
            <span className="rounded-full bg-brand-fg/20 px-2 py-0.5 text-xs">{count}</span>
          </Link>
        </div>

        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-md md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label={d.nav.menu}
        >
          <span className="sr-only">{d.nav.menu}</span>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {open ? (
              <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
            ) : (
              <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" strokeLinejoin="round" />
            )}
          </svg>
        </button>
      </div>

      {open && (
        <div className="border-t border-border md:hidden">
          <div className="space-y-1 px-4 py-3">
            <div className="pb-2">
              <LanguageSwitcher lang={lang} />
            </div>
            {nav.map((item) => (
              <Link
                key={item.href}
                href={localize(item.href, lang)}
                onClick={() => setOpen(false)}
                className="block rounded-md px-3 py-2 text-base font-medium text-foreground hover:bg-brand/10"
              >
                {item.label}
              </Link>
            ))}
            <Link
              href={localize("/admin", lang)}
              onClick={() => setOpen(false)}
              className="block rounded-md px-3 py-2 text-base font-medium text-foreground hover:bg-brand/10"
            >
              {d.nav.admin}
            </Link>
            <Link
              href={accountHref}
              onClick={() => setOpen(false)}
              className="block rounded-md px-3 py-2 text-base font-medium text-foreground hover:bg-brand/10"
            >
              {accountLabel}
            </Link>
            <Link
              href={localize("/cart", lang)}
              onClick={() => setOpen(false)}
              className="block rounded-md bg-brand px-3 py-2 text-center text-base font-semibold text-brand-fg"
            >
              {d.nav.cart} ({count})
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
