"use server";

import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { users } from "@/lib/schema";
import {
  createSession,
  destroySession,
  getSessionUser,
  hashPassword,
  safeNext,
  verifyPassword,
} from "@/lib/auth";
import {
  formErrors,
  parseLoginForm,
  parsePasswordForm,
  parseProfileForm,
  parseRegisterForm,
} from "@/lib/validations/auth";
import { newId } from "@/lib/format";

export type AuthActionState = {
  errors?: Record<string, string>;
  message?: string;
  success?: boolean;
};

const GENERIC_CRED_ERROR = "Invalid email or password.";

export async function register(
  _prev: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const parsed = parseRegisterForm(formData);
  if (!parsed.success) {
    return { errors: formErrors(parsed), message: "Please fix the errors below." };
  }

  const existing = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, parsed.data.email.toLowerCase()))
    .limit(1);
  if (existing[0]) {
    return { errors: { email: "An account with this email already exists." } };
  }

  const userId = newId("usr");
  await db.insert(users).values({
    id: userId,
    name: parsed.data.name.trim(),
    email: parsed.data.email.toLowerCase(),
    phone: parsed.data.phone?.trim() || null,
    passwordHash: hashPassword(parsed.data.password),
    role: "customer",
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  await createSession(userId);
  redirect(safeNext(formData.get("next")));
}

export async function login(
  _prev: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const parsed = parseLoginForm(formData);
  if (!parsed.success) {
    return { errors: formErrors(parsed), message: "Please fix the errors below." };
  }

  const rows = await db
    .select()
    .from(users)
    .where(eq(users.email, parsed.data.email.toLowerCase()))
    .limit(1);
  const user = rows[0];
  if (!user || !verifyPassword(parsed.data.password, user.passwordHash)) {
    return { message: GENERIC_CRED_ERROR };
  }

  await createSession(user.id);
  redirect(safeNext(formData.get("next")));
}

export async function logout(): Promise<void> {
  await destroySession();
  redirect("/");
}

export async function updateProfile(
  _prev: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const user = await getSessionUser();
  if (!user) return { message: "Please sign in again." };

  const parsed = parseProfileForm(formData);
  if (!parsed.success) {
    return { errors: formErrors(parsed), message: "Please fix the errors below." };
  }

  const email = parsed.data.email.toLowerCase();
  if (email !== user.email) {
    const existing = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    if (existing[0] && existing[0].id !== user.id) {
      return { errors: { email: "An account with this email already exists." } };
    }
  }

  await db
    .update(users)
    .set({
      name: parsed.data.name.trim(),
      email,
      phone: parsed.data.phone?.trim() || null,
      updatedAt: new Date(),
    })
    .where(eq(users.id, user.id));

  return { success: true, message: "Profile updated." };
}

export async function changePassword(
  _prev: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const user = await getSessionUser();
  if (!user) return { message: "Please sign in again." };

  const parsed = parsePasswordForm(formData);
  if (!parsed.success) {
    return { errors: formErrors(parsed), message: "Please fix the errors below." };
  }

  const rows = await db.select().from(users).where(eq(users.id, user.id)).limit(1);
  const row = rows[0];
  if (!row || !verifyPassword(parsed.data.currentPassword, row.passwordHash)) {
    return { errors: { currentPassword: "Current password is incorrect." } };
  }

  await db
    .update(users)
    .set({ passwordHash: hashPassword(parsed.data.newPassword), updatedAt: new Date() })
    .where(eq(users.id, user.id));

  return { success: true, message: "Password changed." };
}
