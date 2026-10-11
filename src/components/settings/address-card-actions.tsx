"use client";

import Link from "next/link";
import { deleteAddress, setDefaultAddress } from "@/app/actions/settings";
import type { Locale } from "@/lib/i18n";
import { localize } from "@/lib/i18n";
import { t } from "@/lib/i18n/ui";

export function AddressCardActions({
  lang,
  address,
}: {
  lang: Locale;
  address: { id: string; isDefault: boolean };
}) {
  const d = t(lang).settings;
  const editHref = `${localize("/dashboard/settings", lang)}?edit=${address.id}`;

  return (
    <div className="flex items-center gap-4 text-sm">
      <Link href={editHref} className="font-medium text-brand hover:underline">
        {d.edit}
      </Link>

      {!address.isDefault && (
        <form action={setDefaultAddress}>
          <input type="hidden" name="id" value={address.id} />
          <button
            type="submit"
            className="font-medium text-muted transition-colors hover:text-foreground"
          >
            {d.setDefault}
          </button>
        </form>
      )}

      <form
        action={deleteAddress}
        onSubmit={(e) => {
          if (!confirm(d.deleteConfirm)) e.preventDefault();
        }}
      >
        <input type="hidden" name="id" value={address.id} />
        <button
          type="submit"
          className="font-medium text-red-600 transition-colors hover:underline"
        >
          {d.delete}
        </button>
      </form>
    </div>
  );
}
