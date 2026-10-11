import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { getUserAddresses, getUserPreferences } from "@/lib/queries";
import { isLocale, localize, type Locale } from "@/lib/i18n";
import { t } from "@/lib/i18n/ui";
import { DashboardNav } from "@/components/dashboard/dashboard-nav";
import { AddressForm } from "@/components/settings/address-form";
import { AddressCardActions } from "@/components/settings/address-card-actions";
import { PreferencesForm } from "@/components/settings/preferences-form";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang: raw } = await params;
  const lang: Locale = raw && isLocale(raw) ? raw : "en";
  return { title: t(lang).settings.title, robots: { index: false } };
}

export default async function SettingsPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ edit?: string }>;
}) {
  const { lang: raw } = await params;
  const { edit } = await searchParams;
  const lang: Locale = raw && isLocale(raw) ? raw : "en";
  const L = (path: string) => localize(path, lang);

  const user = await getSessionUser();
  if (!user) redirect(`${L("/login")}?next=${encodeURIComponent("/dashboard/settings")}`);

  const d = t(lang);
  const [saved, prefs] = await Promise.all([
    getUserAddresses(user.id),
    getUserPreferences(user.id),
  ]);
  const editing = edit ? (saved.find((a) => a.id === edit) ?? null) : null;

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <nav className="text-sm text-muted" aria-label="Breadcrumb">
        <Link href={L("/dashboard")} className="hover:text-foreground">
          {d.dashboard.title}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">{d.settings.title}</span>
      </nav>

      <div className="mt-4">
        <DashboardNav lang={lang} />
      </div>

      <div className="mt-6 border-b border-border pb-6">
        <h1 className="text-3xl font-bold tracking-tight">{d.settings.title}</h1>
        <p className="mt-2 text-sm text-muted">{d.settings.description}</p>
      </div>

      <section className="mt-8" aria-labelledby="addresses-heading">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 id="addresses-heading" className="text-xl font-bold tracking-tight">
              {d.settings.addressesTitle}
            </h2>
            <p className="mt-1 text-sm text-muted">{d.settings.addressesIntro}</p>
          </div>
          {!editing && saved.length > 0 && (
            <a
              href="#address-form"
              className="rounded-lg border border-border px-4 py-2 text-sm font-semibold transition-colors hover:border-brand"
            >
              {d.settings.addAddress}
            </a>
          )}
        </div>

        {saved.length === 0 ? (
          <div className="mt-4 rounded-2xl border border-dashed border-border p-8 text-center">
            <p className="font-medium">{d.settings.noAddresses}</p>
            <p className="mt-1 text-sm text-muted">{d.settings.noAddressesText}</p>
          </div>
        ) : (
          <ul className="mt-4 divide-y divide-border rounded-2xl border border-border">
            {saved.map((address) => (
              <li
                key={address.id}
                className="flex flex-wrap items-start justify-between gap-3 px-5 py-4"
              >
                <div className="min-w-0">
                  <p className="flex items-center gap-2 text-sm font-semibold">
                    {address.label}
                    {address.isDefault && (
                      <span className="rounded-full bg-brand/10 px-2 py-0.5 text-xs font-semibold text-brand">
                        {d.settings.defaultBadge}
                      </span>
                    )}
                  </p>
                  <p className="mt-1 break-words text-sm text-muted">
                    {address.line1}
                    {address.line2 ? `, ${address.line2}` : ""}
                  </p>
                  <p className="text-sm text-muted">
                    {address.city}
                    {address.postalCode ? ` ${address.postalCode}` : ""}, {address.region}
                  </p>
                </div>
                <AddressCardActions
                  lang={lang}
                  address={{ id: address.id, isDefault: address.isDefault }}
                />
              </li>
            ))}
          </ul>
        )}

        <div id="address-form" className="mt-6 scroll-mt-24 rounded-2xl border border-border p-6">
          <h3 className="font-semibold">
            {editing ? d.settings.editAddressTitle : d.settings.addAddressTitle}
          </h3>
          <div className="mt-4">
            <AddressForm lang={lang} address={editing ?? undefined} />
          </div>
        </div>
      </section>

      <section
        className="mt-10 rounded-2xl border border-border p-6"
        aria-labelledby="preferences-heading"
      >
        <h2 id="preferences-heading" className="font-semibold">
          {d.settings.preferencesTitle}
        </h2>
        <p className="mt-1 text-sm text-muted">{d.settings.preferencesIntro}</p>
        <div className="mt-5">
          <PreferencesForm lang={lang} prefs={prefs} />
        </div>
      </section>
    </div>
  );
}
