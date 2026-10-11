"use client";

import { useActionState, useState } from "react";
import { createOrder, type CheckoutActionState } from "@/app/actions/orders";
import { site } from "@/lib/site";
import type { Locale } from "@/lib/i18n";
import { t } from "@/lib/i18n/ui";

const initialState: CheckoutActionState = {};

const inputClass =
  "w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand";

const labelClass = "block text-sm font-medium";

function ErrorText({ children }: { children?: string }) {
  if (!children) return null;
  return <p className="mt-1 text-xs text-red-600">{children}</p>;
}

function Legend({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-base font-semibold tracking-tight">{children}</h2>
  );
}

type PrefillAddress = {
  line1: string;
  line2: string | null;
  city: string;
  region: string;
  postalCode: string | null;
};

type Prefill = {
  name: string;
  email: string;
  phone: string | null;
  address?: PrefillAddress;
};

export function CheckoutForm({
  lang,
  prefill,
}: {
  lang: Locale;
  prefill?: Prefill;
}) {
  const [state, formAction, isPending] = useActionState(
    createOrder,
    initialState
  );
  const errors = state.errors ?? {};
  const [region, setRegion] = useState<string>(prefill?.address?.region ?? "");
  const deliveryEstimate = region ? site.deliveryEstimates[region] : undefined;
  const d = t(lang);

  return (
    <form action={formAction} className="space-y-10">
      {state.message && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {state.message}
        </div>
      )}

      <section className="space-y-4">
        <Legend>{d.checkout.contactInfo}</Legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="customerName" className={labelClass}>
              {d.checkout.fullName} <span className="text-red-600">*</span>
            </label>
            <input
              id="customerName"
              name="customerName"
              defaultValue={prefill?.name ?? ""}
              className={inputClass}
              placeholder="e.g. Ahmed Khan"
              autoComplete="name"
              required
            />
            <ErrorText>{errors.customerName}</ErrorText>
          </div>
          <div>
            <label htmlFor="customerPhone" className={labelClass}>
              {d.checkout.mobile} <span className="text-red-600">*</span>
            </label>
            <input
              id="customerPhone"
              name="customerPhone"
              defaultValue={prefill?.phone ?? ""}
              className={inputClass}
              placeholder="0300 1234567"
              inputMode="tel"
              autoComplete="tel"
              required
            />
            <ErrorText>{errors.customerPhone}</ErrorText>
          </div>
        </div>
        <div>
          <label htmlFor="customerEmail" className={labelClass}>
            {d.checkout.email} <span className="text-muted font-normal">{d.checkout.optional}</span>
          </label>
          <input
            id="customerEmail"
            name="customerEmail"
            type="email"
            defaultValue={prefill?.email ?? ""}
            className={inputClass}
            placeholder="you@example.com"
            autoComplete="email"
          />
          <ErrorText>{errors.customerEmail}</ErrorText>
        </div>
      </section>

      <section className="space-y-4">
        <Legend>{d.checkout.shippingTitle}</Legend>
        <div>
          <label htmlFor="addressLine1" className={labelClass}>
            {d.checkout.address1} <span className="text-red-600">*</span>
          </label>
          <input
            id="addressLine1"
            name="addressLine1"
            defaultValue={prefill?.address?.line1 ?? ""}
            className={inputClass}
            placeholder="House 12, Street 4, G-11/3"
            autoComplete="address-line1"
            required
          />
          <ErrorText>{errors.addressLine1}</ErrorText>
        </div>
        <div>
          <label htmlFor="addressLine2" className={labelClass}>
            {d.checkout.address2} <span className="text-muted font-normal">{d.checkout.optional}</span>
          </label>
          <input
            id="addressLine2"
            name="addressLine2"
            defaultValue={prefill?.address?.line2 ?? ""}
            className={inputClass}
            placeholder="Near Super Market, opposite the mosque"
            autoComplete="address-line2"
          />
          <ErrorText>{errors.addressLine2}</ErrorText>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label htmlFor="city" className={labelClass}>
              {d.checkout.city} <span className="text-red-600">*</span>
            </label>
            <input
              id="city"
              name="city"
              defaultValue={prefill?.address?.city ?? ""}
              className={inputClass}
              placeholder="Islamabad"
              autoComplete="address-level2"
              required
            />
            <ErrorText>{errors.city}</ErrorText>
          </div>
          <div>
            <label htmlFor="region" className={labelClass}>
              {d.checkout.region} <span className="text-red-600">*</span>
            </label>
            <select
              id="region"
              name="region"
              className={inputClass}
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              autoComplete="address-level1"
              required
            >
              <option value="" disabled>
                {d.checkout.select}
              </option>
              {site.regions.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
            <ErrorText>{errors.region}</ErrorText>
            {deliveryEstimate && (
              <p className="mt-1 text-xs text-brand">
                {d.checkout.estDelivery(deliveryEstimate)}
              </p>
            )}
          </div>
          <div>
            <label htmlFor="postalCode" className={labelClass}>
              {d.checkout.postal} <span className="text-muted font-normal">{d.checkout.optional}</span>
            </label>
            <input
              id="postalCode"
              name="postalCode"
              defaultValue={prefill?.address?.postalCode ?? ""}
              className={inputClass}
              placeholder="44000"
              inputMode="numeric"
              autoComplete="postal-code"
            />
            <ErrorText>{errors.postalCode}</ErrorText>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <Legend>{d.checkout.paymentTitle}</Legend>
        <div className="space-y-3">
          {site.paymentMethods.map((method) => (
            <label
              key={method}
              className="flex cursor-pointer gap-3 rounded-xl border border-border p-4 transition-colors has-[:checked]:border-brand has-[:checked]:bg-brand/5"
            >
              <input
                type="radio"
                name="paymentMethod"
                value={method}
                defaultChecked={method === "Cash on Delivery"}
                className="mt-1 h-4 w-4 accent-brand"
                required
              />
              <span>
                <span className="block text-sm font-semibold">
                  {d.checkout.paymentLabels[method] ?? method}
                </span>
                <span className="mt-0.5 block text-xs text-muted">
                  {d.checkout.paymentHelp[method]}
                </span>
              </span>
            </label>
          ))}
        </div>
        <ErrorText>{errors.paymentMethod}</ErrorText>
      </section>

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-xl bg-brand px-6 py-4 text-base font-semibold text-brand-fg transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {isPending ? d.checkout.placing : d.checkout.placeOrder}
      </button>

      <p className="text-center text-xs text-muted">
        {d.checkout.terms}
      </p>
    </form>
  );
}
