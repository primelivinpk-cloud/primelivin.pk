import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { RegisterForm } from "@/components/auth/register-form";
import { getSessionUser } from "@/lib/auth";
import { isLocale, localize, type Locale } from "@/lib/i18n";
import { t } from "@/lib/i18n/ui";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang: raw } = await params;
  const lang: Locale = raw && isLocale(raw) ? raw : "en";
  return { title: t(lang).auth.createAccount, robots: { index: false } };
}

export default async function RegisterPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ next?: string }>;
}) {
  const { lang: raw } = await params;
  const lang: Locale = raw && isLocale(raw) ? raw : "en";
  const { next: nextRaw } = await searchParams;
  const next = typeof nextRaw === "string" && nextRaw.startsWith("/") && !nextRaw.startsWith("//")
    ? nextRaw
    : "/dashboard";

  const user = await getSessionUser();
  if (user) redirect(localize("/dashboard", lang));

  const d = t(lang).auth;

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-12 sm:px-6">
      <div className="rounded-2xl border border-border bg-background p-8 shadow-sm">
        <h1 className="text-2xl font-bold tracking-tight">{d.registerTitle}</h1>
        <p className="mt-2 text-sm text-muted">{d.registerSubtitle}</p>
        <div className="mt-6">
          <RegisterForm lang={lang} next={next} />
        </div>
      </div>
      <p className="mt-6 text-center text-sm text-muted">
        <Link href={localize("/", lang)} className="font-medium text-brand hover:underline">
          {t(lang).common.home} →
        </Link>
      </p>
    </div>
  );
}
