import type { Metadata } from "next";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "About Us",
  description: `Learn about ${site.name} — quality furniture for Pakistani homes, delivered nationwide.`,
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold tracking-tight">About {site.name}</h1>
      <div className="mt-6 space-y-4 leading-relaxed text-foreground/90">
        <p>
          {site.name} is a Pakistani furniture store built to make quality pieces
          affordable and accessible — from Karachi to Peshawar, Gilgit to Gwadar.
        </p>
        <p>
          We specialise in office chairs, sofas, beds, dining sets and study desks.
          Every product is checked for durability and comfort before it ships.
        </p>
        <p>
          Shop with confidence: Cash on Delivery, EasyPaisa and JazzCash accepted,
          with free delivery in major cities across Pakistan.
        </p>
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-3">
        {[
          { k: "Regions", v: `${site.regions.length}+` },
          { k: "Payment options", v: `${site.paymentMethods.length}` },
          { k: "Currency", v: site.currency },
        ].map((s) => (
          <div key={s.k} className="rounded-xl border border-border p-5 text-center">
            <p className="text-2xl font-bold">{s.v}</p>
            <p className="mt-1 text-sm text-muted">{s.k}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
