"use client";

import { useActionState } from "react";
import Link from "next/link";
import { register } from "@/app/actions/auth";
import { localize, type Locale } from "@/lib/i18n";
import { t } from "@/lib/i18n/ui";

const inputClass =
  "w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand";
const labelClass = "block text-sm font-medium";

export function RegisterForm({ lang, next }: { lang: Locale; next: string }) {
  const [state, action, pending] = useActionState(register, {});
  const d = t(lang).auth;
  const errors = state.errors ?? {};
  const loginHref = localize(next ? `/login?next=${encodeURIComponent(next)}` : "/login", lang);

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="next" value={next} />

      {state.message && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {state.message}
        </div>
      )}

      <div>
        <label htmlFor="name" className={labelClass}>
          {d.name} <span className="text-red-600">*</span>
        </label>
        <input
          id="name"
          name="name"
          autoComplete="name"
          required
          className={`${inputClass} mt-1`}
        />
        {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
      </div>

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
        <label htmlFor="phone" className={labelClass}>
          {d.phoneOptional}
        </label>
        <input
          id="phone"
          name="phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          placeholder="0300 1234567"
          className={`${inputClass} mt-1`}
        />
        {errors.phone && <p className="mt-1 text-xs text-red-600">{errors.phone}</p>}
      </div>

      <div>
        <label htmlFor="password" className={labelClass}>
          {d.password} <span className="text-red-600">*</span>
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          className={`${inputClass} mt-1`}
        />
        <p className="mt-1 text-xs text-muted">{d.passwordHint}</p>
        {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password}</p>}
      </div>

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-xl bg-brand px-6 py-3.5 text-base font-semibold text-brand-fg transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {pending ? `${d.createAccount}…` : d.createAccount}
      </button>

      <p className="text-center text-sm text-muted">
        {d.haveAccount}{" "}
        <Link href={loginHref} className="font-semibold text-brand hover:underline">
          {d.signInLink}
        </Link>
      </p>
    </form>
  );
}
