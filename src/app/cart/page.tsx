import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Your Cart",
  description: "Review items in your cart before checkout.",
};

export default function CartPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold tracking-tight">Your Cart</h1>

      <div className="mt-10 rounded-2xl border border-border p-12 text-center">
        <p className="text-lg font-medium">Your cart is empty</p>
        <p className="mt-2 text-muted">
          Browse the shop and add furniture to your cart.
        </p>
        <Link
          href="/shop"
          className="mt-6 inline-flex rounded-lg bg-brand px-6 py-3 text-sm font-semibold text-brand-fg transition-opacity hover:opacity-90"
        >
          Continue Shopping
        </Link>
      </div>

      <div className="mt-8 rounded-2xl border border-border bg-background p-6 text-sm text-muted">
        <h2 className="font-semibold text-foreground">Checkout coming soon</h2>
        <p className="mt-2">
          Cart persistence, checkout and Cash on Delivery are part of Phase 3 of the
          build plan.
        </p>
      </div>
    </div>
  );
}
