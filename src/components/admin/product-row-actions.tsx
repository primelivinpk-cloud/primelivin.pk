"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { deleteProduct } from "@/app/actions/products";

export function ProductRowActions({ id, title }: { id: string; title: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleDelete() {
    startTransition(async () => {
      const res = await deleteProduct(id);
      if (!res.success) {
        setError(res.message ?? "Delete failed");
      } else {
        router.refresh();
      }
    });
  }

  return (
    <div className="flex items-center justify-end gap-2">
      <Link
        href={`/admin/products/${id}/edit`}
        className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium transition-colors hover:border-brand"
      >
        Edit
      </Link>

      {confirming ? (
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handleDelete}
            disabled={pending}
            className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {pending ? "Deleting…" : "Confirm"}
          </button>
          <button
            type="button"
            onClick={() => setConfirming(false)}
            disabled={pending}
            className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium"
          >
            Cancel
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setConfirming(true)}
          className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-red-500 transition-colors hover:border-red-500"
          aria-label={`Delete ${title}`}
        >
          Delete
        </button>
      )}

      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
}
