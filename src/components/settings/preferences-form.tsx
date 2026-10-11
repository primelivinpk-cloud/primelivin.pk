"use client";

import { useActionState } from "react";
import {
  updatePreferences,
  type SettingsActionState,
} from "@/app/actions/settings";
import type { UserPreferences } from "@/lib/schema";
import type { Locale } from "@/lib/i18n";
import { t } from "@/lib/i18n/ui";

const toggles = [
  { name: "orderEmails", labelKey: "orderEmails", helpKey: "orderEmailsHelp" },
  { name: "promoEmails", labelKey: "promoEmails", helpKey: "promoEmailsHelp" },
  {
    name: "whatsappUpdates",
    labelKey: "whatsappUpdates",
    helpKey: "whatsappUpdatesHelp",
  },
] as const;

export function PreferencesForm({
  lang,
  prefs,
}: {
  lang: Locale;
  prefs: UserPreferences;
}) {
  const [state, action, pending] = useActionState(
    updatePreferences,
    {} as SettingsActionState
  );
  const d = t(lang).settings;

  return (
    <form action={action} className="space-y-5">
      {state.message && (
        <div
          className={`rounded-lg border px-4 py-3 text-sm ${
            state.success
              ? "border-green-200 bg-green-50 text-green-700"
              : "border-red-200 bg-red-50 text-red-700"
          }`}
        >
          {state.success ? d.preferencesSaved : state.message}
        </div>
      )}

      <div className="space-y-4">
        {toggles.map((toggle) => (
          <label
            key={toggle.name}
            className="flex cursor-pointer items-start gap-3 rounded-xl border border-border p-4 transition-colors has-[:checked]:border-brand has-[:checked]:bg-brand/5"
          >
            <input
              type="checkbox"
              name={toggle.name}
              defaultChecked={prefs[toggle.name]}
              className="mt-0.5 h-4 w-4 accent-brand"
            />
            <span>
              <span className="block text-sm font-semibold">
                {d[toggle.labelKey]}
              </span>
              <span className="mt-0.5 block text-xs text-muted">
                {d[toggle.helpKey]}
              </span>
            </span>
          </label>
        ))}
      </div>

      <button
        type="submit"
        disabled={pending}
        className="rounded-xl bg-brand px-6 py-2.5 text-sm font-semibold text-brand-fg transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {pending ? "…" : d.savePreferences}
      </button>
    </form>
  );
}
