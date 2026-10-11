import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "My Account",
  description: "View your orders, profile and settings.",
};

const sections = [
  { title: "Orders", desc: "Track and review your past orders" },
  { title: "Profile", desc: "Manage your name and contact details" },
  { title: "Addresses", desc: "Save delivery addresses across Pakistan" },
  { title: "Settings", desc: "Preferences and account settings" },
];

export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold tracking-tight">My Account</h1>
      <p className="mt-2 text-muted">Sign in to view your orders and manage your account.</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {sections.map((s) => (
          <div key={s.title} className="rounded-2xl border border-border p-6">
            <h2 className="font-semibold">{s.title}</h2>
            <p className="mt-2 text-sm text-muted">{s.desc}</p>
            <span className="mt-4 inline-block text-xs font-medium text-accent">
              Available after Phase 6
            </span>
          </div>
        ))}
      </div>

      <div className="mt-8 flex gap-3">
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
          Contact Support
        </Link>
      </div>
    </div>
  );
}
