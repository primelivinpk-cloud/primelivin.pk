import { z } from "zod";

// Same loose Pakistani phone used at checkout: +92 / 03XX with spaces, dashes
const phoneRegex = /^(\+92|0)?[\s-]?3\d{2}[\s-]?\d{7}$/;

export const registerSchema = z.object({
  name: z.string().min(2, "Name is required").max(120),
  email: z.string().email("Enter a valid email").max(180),
  phone: z
    .string()
    .regex(phoneRegex, "Enter a valid Pakistani mobile number (e.g. 0300 1234567)")
    .optional()
    .or(z.literal("")),
  password: z.string().min(8, "Password must be at least 8 characters").max(200),
});

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

export const profileSchema = z.object({
  name: z.string().min(2, "Name is required").max(120),
  email: z.string().email("Enter a valid email").max(180),
  phone: z
    .string()
    .regex(phoneRegex, "Enter a valid Pakistani mobile number (e.g. 0300 1234567)")
    .optional()
    .or(z.literal("")),
});

export const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Enter your current password"),
  newPassword: z.string().min(8, "Password must be at least 8 characters").max(200),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ProfileInput = z.infer<typeof profileSchema>;
export type PasswordInput = z.infer<typeof passwordSchema>;

export function parseRegisterForm(formData: FormData) {
  return registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone") || "",
    password: formData.get("password"),
  });
}

export function parseLoginForm(formData: FormData) {
  return loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
}

export function parseProfileForm(formData: FormData) {
  return profileSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone") || "",
  });
}

export function parsePasswordForm(formData: FormData) {
  return passwordSchema.safeParse({
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
  });
}

export function formErrors(
  result: { success: true } | { success: false; error: z.ZodError }
): Record<string, string> {
  if (result.success) return {};
  const flat = result.error.flatten().fieldErrors as Record<string, string[] | undefined>;
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(flat)) {
    if (v && v[0]) out[k] = v[0];
  }
  return out;
}
