import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getOrderById } from "@/lib/orders";
import { formatPKR, formatDate } from "@/lib/format";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  return { title: `Order ${id}`, robots: { index: false } };
}

const statusLabel: Record<string, string> = {
  pending: "Order received",
  confirmed: "Confirmed",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export default async function OrderPage({ params }: Props) {
  const { id } = await params;
  const data = await getOrderById(id);
  if (!data) notFound();

  const { order, items } = data;
  const addr = order.shippingAddress;

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="rounded-2xl border border-border bg-brand/5 p-8 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand text-brand-fg">
          ✓
        </div>
        <h1 className="mt-4 text-2xl font-bold tracking-tight">
          Thank you! Your order is confirmed.
        </h1>
        <p className="mt-2 text-sm text-muted">
          Order <span className="font-semibold text-foreground">{order.id}</span> ·{" "}
          {formatDate(order.createdAt)}
        </p>
        <p className="mt-4 text-sm text-muted">
          We&apos;ll call you at{" "}
          <span className="font-medium text-foreground">{order.customerPhone}</span>{" "}
          shortly to confirm delivery details.
        </p>
      </div>

      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        <div className="rounded-2xl border border-border p-6">
          <h2 className="text-sm font-semibold">Shipping to</h2>
          <div className="mt-2 text-sm text-muted">
            <p className="font-medium text-foreground">{order.customerName}</p>
            {addr && (
              <>
                <p className="mt-1">{addr.line1}</p>
                {addr.line2 && <p>{addr.line2}</p>}
                <p>
                  {addr.city}, {addr.region}
                  {addr.postalCode ? ` ${addr.postalCode}` : ""}
                </p>
              </>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-border p-6">
          <h2 className="text-sm font-semibold">Payment</h2>
          <div className="mt-2 text-sm text-muted">
            <p className="font-medium text-foreground">{order.paymentMethod}</p>
            <p className="mt-1 capitalize">{order.paymentStatus}</p>
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-border p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold">Items</h2>
          <span className="inline-flex rounded-full bg-brand/10 px-3 py-1 text-xs font-semibold text-brand">
            {statusLabel[order.status] ?? order.status}
          </span>
        </div>

        <ul className="mt-4 divide-y divide-border">
          {items.map((item) => (
            <li key={item.id} className="flex justify-between py-3 text-sm">
              <span>
                {item.title}{" "}
                <span className="text-muted">× {item.quantity}</span>
              </span>
              <span className="font-medium">{formatPKR(item.price * item.quantity)}</span>
            </li>
          ))}
        </ul>

        <div className="mt-2 flex justify-between border-t border-border pt-4 font-bold">
          <span>Total</span>
          <span>{formatPKR(order.totalAmount)}</span>
        </div>
      </div>

      <div className="mt-8 flex justify-center gap-4">
        <Link
          href="/shop"
          className="rounded-lg bg-brand px-6 py-3 text-sm font-semibold text-brand-fg transition-opacity hover:opacity-90"
        >
          Continue Shopping
        </Link>
        <Link
          href="/contact"
          className="rounded-lg border border-border px-6 py-3 text-sm font-semibold transition-colors hover:border-brand"
        >
          Need help?
        </Link>
      </div>
    </div>
  );
}
