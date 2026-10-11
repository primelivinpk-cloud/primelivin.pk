"use client";

import { useActionState } from "react";
import { createOrder, type CheckoutActionState } from "@/app/actions/orders";
import { site } from "@/lib/site";

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

const paymentHelp: Record<string, string> = {
  "Cash on Delivery": "Pay in cash when your order arrives at your door.",
  "Bank Transfer": "We'll message you our bank details to complete payment.",
  EasyPaisa: "We'll message you the EasyPaisa number after you order.",
  JazzCash: "We'll message you the JazzCash number after you order.",
};

export function CheckoutForm() {
  const [state, formAction, isPending] = useActionState(
    createOrder,
    initialState
  );
  const errors = state.errors ?? {};

  return (
    <form action={formAction} className="space-y-10">
      {state.message && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {state.message}
        </div>
      )}

      <section className="space-y-4">
        <Legend>Contact information</Legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="customerName" className={labelClass}>
              Full name <span className="text-red-600">*</span>
            </label>
            <input
              id="customerName"
              name="customerName"
              className={inputClass}
              placeholder="e.g. Ahmed Khan"
              autoComplete="name"
              required
            />
            <ErrorText>{errors.customerName}</ErrorText>
          </div>
          <div>
            <label htmlFor="customerPhone" className={labelClass}>
              Mobile number <span className="text-red-600">*</span>
            </label>
            <input
              id="customerPhone"
              name="customerPhone"
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
            Email <span className="text-muted font-normal">(optional)</span>
          </label>
          <input
            id="customerEmail"
            name="customerEmail"
            type="email"
            className={inputClass}
            placeholder="you@example.com"
            autoComplete="email"
          />
          <ErrorText>{errors.customerEmail}</ErrorText>
        </div>
      </section>

      <section className="space-y-4">
        <Legend>Shipping address</Legend>
        <div>
          <label htmlFor="addressLine1" className={labelClass}>
            House / street / area <span className="text-red-600">*</span>
          </label>
          <input
            id="addressLine1"
            name="addressLine1"
            className={inputClass}
            placeholder="House 12, Street 4, G-11/3"
            autoComplete="address-line1"
            required
          />
          <ErrorText>{errors.addressLine1}</ErrorText>
        </div>
        <div>
          <label htmlFor="addressLine2" className={labelClass}>
            Landmark / nearby reference <span className="text-muted font-normal">(optional)</span>
          </label>
          <input
            id="addressLine2"
            name="addressLine2"
            className={inputClass}
            placeholder="Near Super Market, opposite the mosque"
            autoComplete="address-line2"
          />
          <ErrorText>{errors.addressLine2}</ErrorText>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label htmlFor="city" className={labelClass}>
              City <span className="text-red-600">*</span>
            </label>
            <input
              id="city"
              name="city"
              className={inputClass}
              placeholder="Islamabad"
              autoComplete="address-level2"
              required
            />
            <ErrorText>{errors.city}</ErrorText>
          </div>
          <div>
            <label htmlFor="region" className={labelClass}>
              Province / region <span className="text-red-600">*</span>
            </label>
            <select
              id="region"
              name="region"
              className={inputClass}
              defaultValue=""
              autoComplete="address-level1"
              required
            >
              <option value="" disabled>
                Select…
              </option>
              {site.regions.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
            <ErrorText>{errors.region}</ErrorText>
          </div>
          <div>
            <label htmlFor="postalCode" className={labelClass}>
              Postal code <span className="text-muted font-normal">(optional)</span>
            </label>
            <input
              id="postalCode"
              name="postalCode"
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
        <Legend>Payment method</Legend>
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
                <span className="block text-sm font-semibold">{method}</span>
                <span className="mt-0.5 block text-xs text-muted">
                  {paymentHelp[method]}
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
        {isPending ? "Placing order…" : "Place Order"}
      </button>

      <p className="text-center text-xs text-muted">
        By placing this order you agree to our shipping and returns policy.
      </p>
    </form>
  );
}
