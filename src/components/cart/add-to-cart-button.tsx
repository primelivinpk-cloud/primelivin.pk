"use client";

import { useState } from "react";
import { useCart } from "./cart-provider";
import type { Locale } from "@/lib/i18n";
import { t } from "@/lib/i18n/ui";

export function AddToCartButton({
  productId,
  disabled,
  lang = "en",
}: {
  productId: string;
  disabled?: boolean;
  lang?: Locale;
}) {
  const { addItem } = useCart();
  const [status, setStatus] = useState<"idle" | "adding" | "added" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);
  const d = t(lang);

  async function handleClick() {
    setStatus("adding");
    setMessage(null);
    try {
      await addItem(productId, 1);
      setStatus("added");
      setMessage(d.product.addedMsg);
      setTimeout(() => setStatus("idle"), 2000);
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : d.product.addToCartFailed);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleClick}
        disabled={disabled || status === "adding"}
        className="mt-8 w-full rounded-xl bg-brand px-6 py-4 text-base font-semibold text-brand-fg transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {status === "adding"
          ? d.product.adding
          : status === "added"
            ? d.product.added
            : disabled
              ? d.product.outOfStock
              : d.product.addToCart}
      </button>
      {message && (
        <p
          className={`mt-2 text-center text-sm ${
            status === "error" ? "text-red-500" : "text-green-600 dark:text-green-400"
          }`}
        >
          {message}
        </p>
      )}
    </div>
  );
}
