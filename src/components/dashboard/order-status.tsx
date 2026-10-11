import type { Locale } from "@/lib/i18n";
import { t } from "@/lib/i18n/ui";

type OrderStatus = "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled";

const STATUS_STYLES: Record<OrderStatus, string> = {
  pending: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
  confirmed: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",
  processing: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",
  shipped: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300",
  delivered: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300",
  cancelled: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",
};

export function StatusBadge({ status, lang }: { status: string; lang: Locale }) {
  const key = (status in STATUS_STYLES ? status : "pending") as OrderStatus;
  const label = t(lang).orders.statuses[key] ?? status;
  return (
    <span
      className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_STYLES[key]}`}
    >
      {label}
    </span>
  );
}

const FLOW: OrderStatus[] = ["pending", "confirmed", "processing", "shipped", "delivered"];

/**
 * Vertical status timeline for the track-order view.
 * Completed steps are filled, the current step is ringed, future steps muted.
 */
export function OrderTimeline({ status, lang }: { status: string; lang: Locale }) {
  const d = t(lang);
  const currentIdx = FLOW.indexOf(status as OrderStatus);

  if (status === "cancelled" || currentIdx === -1) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
        {d.dashboard.cancelledBanner}
      </div>
    );
  }

  return (
    <ol className="space-y-0">
      {FLOW.map((step, i) => {
        const done = i < currentIdx;
        const current = i === currentIdx;
        return (
          <li key={step} className="relative flex gap-4 pb-6 last:pb-0">
            {i < FLOW.length - 1 && (
              <span
                aria-hidden
                className={`absolute left-[11px] top-6 h-full w-0.5 ${
                  done ? "bg-brand" : "bg-border"
                }`}
              />
            )}
            <span
              aria-hidden
              className={`relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                done
                  ? "bg-brand text-brand-fg"
                  : current
                    ? "border-2 border-brand bg-background text-brand ring-2 ring-brand/30"
                    : "border border-border bg-background text-muted"
              }`}
            >
              {done ? "✓" : i + 1}
            </span>
            <span className="-mt-0.5">
              <span
                className={`block text-sm font-semibold ${
                  current ? "text-brand" : done ? "text-foreground" : "text-muted"
                }`}
              >
                {d.orders.statuses[step]}
              </span>
              {current && (
                <span className="mt-0.5 block text-xs text-muted">{d.dashboard.trackSubtitle}</span>
              )}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
