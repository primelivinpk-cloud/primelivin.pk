"use client";

import { useActionState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { saveAddress, type SettingsActionState } from "@/app/actions/settings";
import { site } from "@/lib/site";
import type { Address } from "@/lib/schema";
import type { Locale } from "@/lib/i18n";
import { localize } from "@/lib/i18n";
import { t } from "@/lib/i18n/ui";

const inputClass =
  "w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand";
const labelClass = "block text-sm font-medium";

export function AddressForm({
  lang,
  address,
}: {
  lang: Locale;
  address?: Address;
}) {
  const [state, action, pending] = useActionState(saveAddress, {} as SettingsActionState);
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();
  const d = t(lang).settings;
  const errors = state.errors ?? {};

  useEffect(() => {
    if (state.success) {
      router.refresh();
      if (!address) formRef.current?.reset();
    }
  }, [state, address, router]);

  return (
    <form ref={formRef} action={action} className="space-y-4">
      {state.message && (
        <div
          className={`rounded-lg border px-4 py-3 text-sm ${
            state.success
              ? "border-green-200 bg-green-50 text-green-700"
              : "border-red-200 bg-red-50 text-red-700"
          }`}
        >
          {state.success ? d.addressSaved : state.message}
        </div>
      )}

      {address && <input type="hidden" name="id" value={address.id} />}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="label" className={labelClass}>
            {d.label} <span className="text-red-600">*</span>
          </label>
          <input
            id="label"
            name="label"
            defaultValue={address?.label ?? ""}
            placeholder={d.labelPlaceholder}
            maxLength={40}
            required
            className={`${inputClass} mt-1`}
          />
          {errors.label && <p className="mt-1 text-xs text-red-600">{errors.label}</p>}
        </div>
        <div>
          <label htmlFor="city" className={labelClass}>
            {d.city} <span className="text-red-600">*</span>
          </label>
          <input
            id="city"
            name="city"
            defaultValue={address?.city ?? ""}
            placeholder="Islamabad"
            autoComplete="address-level2"
            required
            className={`${inputClass} mt-1`}
          />
          {errors.city && <p className="mt-1 text-xs text-red-600">{errors.city}</p>}
        </div>
      </div>

      <div>
        <label htmlFor="line1" className={labelClass}>
          {d.address1} <span className="text-red-600">*</span>
        </label>
        <input
          id="line1"
          name="line1"
          defaultValue={address?.line1 ?? ""}
          placeholder="House 12, Street 4, G-11/3"
          autoComplete="address-line1"
          required
          className={`${inputClass} mt-1`}
        />
        {errors.line1 && <p className="mt-1 text-xs text-red-600">{errors.line1}</p>}
      </div>

      <div>
        <label htmlFor="line2" className={labelClass}>
          {d.address2} <span className="text-muted font-normal">{d.optional}</span>
        </label>
        <input
          id="line2"
          name="line2"
          defaultValue={address?.line2 ?? ""}
          placeholder="Near Super Market, opposite the mosque"
          autoComplete="address-line2"
          className={`${inputClass} mt-1`}
        />
        {errors.line2 && <p className="mt-1 text-xs text-red-600">{errors.line2}</p>}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="region" className={labelClass}>
            {d.region} <span className="text-red-600">*</span>
          </label>
          <select
            id="region"
            name="region"
            defaultValue={address?.region ?? ""}
            autoComplete="address-level1"
            required
            className={`${inputClass} mt-1`}
          >
            <option value="" disabled>
              {d.selectRegion}
            </option>
            {site.regions.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
          {errors.region && <p className="mt-1 text-xs text-red-600">{errors.region}</p>}
        </div>
        <div>
          <label htmlFor="postalCode" className={labelClass}>
            {d.postal} <span className="text-muted font-normal">{d.optional}</span>
          </label>
          <input
            id="postalCode"
            name="postalCode"
            defaultValue={address?.postalCode ?? ""}
            placeholder={d.postalPlaceholder}
            inputMode="numeric"
            autoComplete="postal-code"
            className={`${inputClass} mt-1`}
          />
          {errors.postalCode && (
            <p className="mt-1 text-xs text-red-600">{errors.postalCode}</p>
          )}
        </div>
      </div>

      <label className="flex cursor-pointer items-start gap-3">
        <input
          type="checkbox"
          name="isDefault"
          defaultChecked={address?.isDefault ?? false}
          className="mt-0.5 h-4 w-4 accent-brand"
        />
        <span className="text-sm">{d.makeDefault}</span>
      </label>

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-xl bg-brand px-6 py-2.5 text-sm font-semibold text-brand-fg transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {pending ? "…" : address ? d.edit : d.addAddress}
        </button>
        {address && (
          <Link
            href={localize("/dashboard/settings", lang)}
            className="rounded-xl border border-border px-6 py-2.5 text-sm font-medium transition-colors hover:border-brand"
          >
            {d.cancel}
          </Link>
        )}
      </div>
    </form>
  );
}
