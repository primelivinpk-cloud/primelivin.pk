import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Get in touch with Prime Livin — questions about furniture, delivery or orders across Pakistan.",
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold tracking-tight">Contact Us</h1>
      <p className="mt-2 text-muted">
        Questions about a product, delivery or an existing order? We&apos;re here to help.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-border p-6">
          <h2 className="font-semibold">Customer Support</h2>
          <p className="mt-2 text-sm text-muted">Mon–Sat, 10am–8pm PKT</p>
          <p className="mt-3 text-sm">Email: support@primelivin.pk</p>
          <p className="mt-1 text-sm">Phone: +92 300 0000000</p>
        </div>
        <div className="rounded-2xl border border-border p-6">
          <h2 className="font-semibold">Showroom</h2>
          <p className="mt-2 text-sm text-muted">Visit us to see pieces in person.</p>
          <p className="mt-3 text-sm">Islamabad, Pakistan</p>
        </div>
      </div>

      <form className="mt-10 space-y-4 rounded-2xl border border-border p-6">
        <h2 className="font-semibold">Send a message</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <input required placeholder="Your name" className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm outline-none focus:border-brand" />
          <input required type="email" placeholder="Email" className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm outline-none focus:border-brand" />
        </div>
        <textarea required placeholder="How can we help?" rows={5} className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm outline-none focus:border-brand" />
        <button type="submit" className="rounded-lg bg-brand px-6 py-3 text-sm font-semibold text-brand-fg transition-opacity hover:opacity-90">
          Send Message
        </button>
      </form>
    </div>
  );
}
