import type { Metadata } from "next";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Shipping & Returns",
  description: "Delivery times, costs and return policy for furniture orders across Pakistan.",
};

const deliveryTimes: Record<string, string> = {
  Islamabad: "2–4 working days",
  Punjab: "3–6 working days",
  Sindh: "3–7 working days",
  "Khyber Pakhtunkhwa": "4–7 working days",
  Balochistan: "5–10 working days",
  "Gilgit-Baltistan": "5–10 working days",
  "Azad Kashmir": "4–8 working days",
};

export default function ShippingPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold tracking-tight">Shipping & Returns</h1>

      <section className="mt-8">
        <h2 className="text-xl font-semibold">Delivery across Pakistan</h2>
        <p className="mt-2 text-muted">
          We deliver nationwide. Free delivery applies to major cities on orders above
          a minimum value — final cost is shown at checkout.
        </p>
        <div className="mt-5 overflow-hidden rounded-2xl border border-border">
          <table className="w-full text-left text-sm">
            <thead className="bg-brand/10">
              <tr>
                <th className="px-4 py-3 font-semibold">Region</th>
                <th className="px-4 py-3 font-semibold">Estimated delivery</th>
              </tr>
            </thead>
            <tbody>
              {site.regions.map((r, i) => (
                <tr key={r} className={i % 2 ? "bg-background" : "bg-background/50"}>
                  <td className="border-t border-border px-4 py-3">{r}</td>
                  <td className="border-t border-border px-4 py-3 text-muted">
                    {deliveryTimes[r] ?? "5–10 working days"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-semibold">Payment methods</h2>
        <ul className="mt-3 list-disc space-y-1 pl-6 text-muted">
          {site.paymentMethods.map((m) => (
            <li key={m}>{m}</li>
          ))}
        </ul>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-semibold">Returns</h2>
        <p className="mt-2 leading-relaxed text-muted">
          Not happy with your piece? Report damage or a wrong item within 7 days of
          delivery and we&apos;ll arrange a replacement or refund. Custom-made items
          are excluded.
        </p>
      </section>
    </div>
  );
}
