"use server";

import { and, eq, ne } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { addresses, users } from "@/lib/schema";
import { getSessionUser } from "@/lib/auth";
import { newId } from "@/lib/format";
import { addressFormErrors, parseAddressForm } from "@/lib/validations/settings";

export type SettingsActionState = {
  errors?: Record<string, string>;
  message?: string;
  success?: boolean;
};

const MAX_ADDRESSES = 10;
const SETTINGS_ROUTE = "/[lang]/dashboard/settings";

function touchSettings() {
  revalidatePath(SETTINGS_ROUTE, "page");
}

export async function saveAddress(
  _prev: SettingsActionState,
  formData: FormData
): Promise<SettingsActionState> {
  const user = await getSessionUser();
  if (!user) return { message: "Please sign in again." };

  const parsed = parseAddressForm(formData);
  if (!parsed.success) {
    return { errors: addressFormErrors(parsed), message: "Please fix the errors below." };
  }
  const data = parsed.data;
  const now = new Date();

  let id: string;
  if (data.id) {
    const [existing] = await db
      .select({ id: addresses.id })
      .from(addresses)
      .where(and(eq(addresses.id, data.id), eq(addresses.userId, user.id)))
      .limit(1);
    if (!existing) return { message: "Address not found." };
    id = existing.id;
    await db
      .update(addresses)
      .set({
        label: data.label.trim(),
        line1: data.line1,
        line2: data.line2 || null,
        city: data.city,
        region: data.region,
        postalCode: data.postalCode || null,
        isDefault: data.isDefault,
        updatedAt: now,
      })
      .where(eq(addresses.id, id));
  } else {
    const mine = await db
      .select({ id: addresses.id })
      .from(addresses)
      .where(eq(addresses.userId, user.id));
    if (mine.length >= MAX_ADDRESSES) {
      return { message: `You can save up to ${MAX_ADDRESSES} addresses.` };
    }
    id = newId("addr");
    await db.insert(addresses).values({
      id,
      userId: user.id,
      label: data.label.trim(),
      line1: data.line1,
      line2: data.line2 || null,
      city: data.city,
      region: data.region,
      postalCode: data.postalCode || null,
      isDefault: data.isDefault || mine.length === 0,
      createdAt: now,
      updatedAt: now,
    });
  }

  if (data.isDefault) {
    await db
      .update(addresses)
      .set({ isDefault: false, updatedAt: now })
      .where(and(eq(addresses.userId, user.id), ne(addresses.id, id)));
  }

  touchSettings();
  return { success: true, message: "Address saved." };
}

export async function setDefaultAddress(formData: FormData) {
  const user = await getSessionUser();
  if (!user) return;

  const id = String(formData.get("id") ?? "");
  const [target] = await db
    .select({ id: addresses.id })
    .from(addresses)
    .where(and(eq(addresses.id, id), eq(addresses.userId, user.id)))
    .limit(1);
  if (!target) return;

  const now = new Date();
  await db
    .update(addresses)
    .set({ isDefault: false, updatedAt: now })
    .where(eq(addresses.userId, user.id));
  await db
    .update(addresses)
    .set({ isDefault: true, updatedAt: now })
    .where(eq(addresses.id, id));

  touchSettings();
}

export async function deleteAddress(formData: FormData) {
  const user = await getSessionUser();
  if (!user) return;

  const id = String(formData.get("id") ?? "");
  await db
    .delete(addresses)
    .where(and(eq(addresses.id, id), eq(addresses.userId, user.id)));

  touchSettings();
}

export async function updatePreferences(
  _prev: SettingsActionState,
  formData: FormData
): Promise<SettingsActionState> {
  const user = await getSessionUser();
  if (!user) return { message: "Please sign in again." };

  await db
    .update(users)
    .set({
      preferences: {
        orderEmails: formData.get("orderEmails") === "on",
        promoEmails: formData.get("promoEmails") === "on",
        whatsappUpdates: formData.get("whatsappUpdates") === "on",
      },
      updatedAt: new Date(),
    })
    .where(eq(users.id, user.id));

  touchSettings();
  return { success: true, message: "Preferences saved." };
}
