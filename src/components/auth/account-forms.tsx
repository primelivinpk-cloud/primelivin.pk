"use client";

import { useActionState } from "react";
import { changePassword, updateProfile } from "@/app/actions/auth";
import type { Locale } from "@/lib/i18n";
import { t } from "@/lib/i18n/ui";

const inputClass =
  "w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand";
const labelClass = "block text-sm font-medium";

type ProfileDefaults = { name: string; email: string; phone: string | null };

export function ProfileForm({
  lang,
  defaults,
}: {
  lang: Locale;
  defaults: ProfileDefaults;
}) {
  const [state, action, pending] = useActionState(updateProfile, {});
  const d = t(lang);
  const errors = state.errors ?? {};

  return (
    <form action={action} className="space-y-4">
      {state.message && (
        <div
          className={`rounded-lg border px-4 py-3 text-sm ${
            state.success
              ? "border-green-200 bg-green-50 text-green-700"
              : "border-red-200 bg-red-50 text-red-700"
          }`}
        >
          {state.success ? d.dashboard.profileSaved : state.message}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className={labelClass}>
            {d.auth.name} <span className="text-red-600">*</span>
          </label>
          <input
            id="name"
            name="name"
            defaultValue={defaults.name}
            autoComplete="name"
            required
            className={`${inputClass} mt-1`}
          />
          {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
        </div>
        <div>
          <label htmlFor="email" className={labelClass}>
            {d.auth.email} <span className="text-red-600">*</span>
          </label>
          <input
            id="email"
            name="email"
            type="email"
            defaultValue={defaults.email}
            autoComplete="email"
            required
            className={`${inputClass} mt-1`}
          />
          {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
        </div>
      </div>

      <div>
        <label htmlFor="phone" className={labelClass}>{d.auth.phoneOptional}</label>
        <input
          id="phone"
          name="phone"
          type="tel"
          inputMode="tel"
          defaultValue={defaults.phone ?? ""}
          autoComplete="tel"
          placeholder="0300 1234567"
          className={`${inputClass} mt-1`}
        />
        {errors.phone && <p className="mt-1 text-xs text-red-600">{errors.phone}</p>}
      </div>

      <button
        type="submit"
        disabled={pending}
        className="rounded-xl bg-brand px-6 py-3 text-sm font-semibold text-brand-fg transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {pending ? "…" : d.dashboard.saveChanges}
      </button>
    </form>
  );
}

export function PasswordForm({ lang }: { lang: Locale }) {
  const [state, action, pending] = useActionState(changePassword, {});
  const d = t(lang);
  const errors = state.errors ?? {};

  return (
    <form action={action} className="space-y-4">
      {state.message && (
        <div
          className={`rounded-lg border px-4 py-3 text-sm ${
            state.success
              ? "border-green-200 bg-green-50 text-green-700"
              : "border-red-200 bg-red-50 text-red-700"
          }`}
        >
          {state.success ? d.dashboard.passwordChanged : state.message}
        </div>
      )}

      <div>
        <label htmlFor="currentPassword" className={labelClass}>
          {d.auth.currentPassword} <span className="text-red-600">*</span>
        </label>
        <input
          id="currentPassword"
          name="currentPassword"
          type="password"
          autoComplete="current-password"
          required
          className={`${inputClass} mt-1`}
        />
        {errors.currentPassword && (
          <p className="mt-1 text-xs text-red-600">{errors.currentPassword}</p>
        )}
      </div>

      <div>
        <label htmlFor="newPassword" className={labelClass}>
          {d.auth.newPassword} <span className="text-red-600">*</span>
        </label>
        <input
          id="newPassword"
          name="newPassword"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          className={`${inputClass} mt-1`}
        />
        <p className="mt-1 text-xs text-muted">{d.auth.passwordHint}</p>
        {errors.newPassword && (
          <p className="mt-1 text-xs text-red-600">{errors.newPassword}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={pending}
        className="rounded-xl border border-border px-6 py-3 text-sm font-semibold transition-colors hover:border-brand disabled:opacity-50"
      >
        {pending ? "…" : d.dashboard.changePassword}
      </button>
    </form>
  );
}
