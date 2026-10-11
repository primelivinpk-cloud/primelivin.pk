"use client";

import { useState } from "react";
import { useCart } from "./cart-provider";

export function AddToCartButton({
  productId,
  disabled,
}: {
  productId: string;
  disabled?: boolean;
}) {
  const { addItem } = useCart();
  const [status, setStatus] = useState<"idle" | "adding" | "added" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);

  async function handleClick() {
    setStatus("adding");
    setMessage(null);
    try {
      await addItem(productId, 1);
      setStatus("added");
      setMessage("Added to cart");
      setTimeout(() => setStatus("idle"), 2000);
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "Could not add to cart");
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
          ? "Adding…"
          : status === "added"
            ? "Added ✓"
            : disabled
              ? "Out of Stock"
              : "Add to Cart"}
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
