"use client";

import { useActionState } from "react";
import Link from "next/link";
import { login } from "@/app/actions/auth";
import { localize, type Locale } from "@/lib/i18n";
import { t } from "@/lib/i18n/ui";

const inputClass =
  "w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand";
const labelClass = "block text-sm font-medium";

export function LoginForm({ lang, next }: { lang: Locale; next: string }) {
  const [state, action, pending] = useActionState(login, {});
  const d = t(lang).auth;
  const errors = state.errors ?? {};
  const registerHref = localize(next ? `/register?next=${encodeURIComponent(next)}` : "/register", lang);

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="next" value={next} />

      {state.message && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {state.message}
        </div>
      )}

      <div>
        <label htmlFor="email" className={labelClass}>
          {d.email} <span className="text-red-600">*</span>
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className={`${inputClass} mt-1`}
        />
        {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
      </div>

      <div>
        <label htmlFor="password" className={labelClass}>
          {d.password} <span className="text-red-600">*</span>
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className={`${inputClass} mt-1`}
        />
        {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password}</p>}
      </div>

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-xl bg-brand px-6 py-3.5 text-base font-semibold text-brand-fg transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {pending ? `${d.signIn}…` : d.signIn}
      </button>

      <p className="text-center text-sm text-muted">
        {d.noAccount}{" "}
        <Link href={registerHref} className="font-semibold text-brand hover:underline">
          {d.createOne}
        </Link>
      </p>
    </form>
  );
}
