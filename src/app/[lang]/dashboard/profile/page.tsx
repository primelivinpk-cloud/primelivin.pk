import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { formatDate } from "@/lib/format";
import { isLocale, localize, type Locale } from "@/lib/i18n";
import { t } from "@/lib/i18n/ui";
import { PasswordForm, ProfileForm } from "@/components/auth/account-forms";
import { DashboardNav } from "@/components/dashboard/dashboard-nav";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang: raw } = await params;
  const lang: Locale = raw && isLocale(raw) ? raw : "en";
  return { title: t(lang).dashboard.profileTitle, robots: { index: false } };
}

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang: raw } = await params;
  const lang: Locale = raw && isLocale(raw) ? raw : "en";
  const L = (path: string) => localize(path, lang);

  const user = await getSessionUser();
  if (!user) redirect(`${L("/login")}?next=${encodeURIComponent("/dashboard/profile")}`);

  const d = t(lang).dashboard;

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <nav className="text-sm text-muted" aria-label="Breadcrumb">
        <Link href={L("/dashboard")} className="hover:text-foreground">
          {d.title}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">{d.profileTitle}</span>
      </nav>

      <div className="mt-4">
        <DashboardNav lang={lang} />
      </div>

      <div className="mt-6 border-b border-border pb-6">
        <h1 className="text-3xl font-bold tracking-tight">{d.profileTitle}</h1>
        <p className="mt-2 text-sm text-muted">
          {d.memberSince(formatDate(user.createdAt))}
        </p>
      </div>

      <section className="mt-8 rounded-2xl border border-border p-6" aria-labelledby="profile-heading">
        <h2 id="profile-heading" className="font-semibold">
          {d.profileTitle}
        </h2>
        <p className="mt-1 text-sm text-muted">{d.profileIntro}</p>
        <div className="mt-5">
          <ProfileForm
            lang={lang}
            defaults={{ name: user.name, email: user.email, phone: user.phone }}
          />
        </div>
      </section>

      <section className="mt-6 rounded-2xl border border-border p-6" aria-labelledby="password-heading">
        <h2 id="password-heading" className="font-semibold">
          {d.passwordTitle}
        </h2>
        <p className="mt-1 text-sm text-muted">{d.passwordIntro}</p>
        <div className="mt-5">
          <PasswordForm lang={lang} />
        </div>
      </section>
    </div>
  );
}
