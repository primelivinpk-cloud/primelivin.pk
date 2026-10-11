import { z } from "zod";
import { site } from "@/lib/site";

export const PAKISTAN_REGIONS = site.regions as readonly string[];

export const PAYMENT_METHODS = site.paymentMethods as readonly string[];

export type PaymentMethod = (typeof site.paymentMethods)[number];

// Loose Pakistani phone: allows +92 / 03XX formats with spaces, dashes
const phoneRegex = /^(\+92|0)?[\s-]?3\d{2}[\s-]?\d{7}$/;

export const checkoutSchema = z.object({
  customerName: z.string().min(2, "Name is required").max(120),
  customerEmail: z
    .string()
    .email("Enter a valid email")
    .max(180)
    .optional()
    .or(z.literal("")),
  customerPhone: z
    .string()
    .regex(phoneRegex, "Enter a valid Pakistani mobile number (e.g. 0300 1234567)"),

  addressLine1: z.string().min(3, "Address is required").max(240),
  addressLine2: z.string().max(240).optional().or(z.literal("")),
  city: z.string().min(2, "City is required").max(120),
  region: z.enum(site.regions, {
    error: "Select a province/region",
  }),
  postalCode: z
    .string()
    .regex(/^\d{5}$/, "Enter a 5-digit postal code")
    .optional()
    .or(z.literal("")),

  paymentMethod: z.enum(site.paymentMethods, {
    error: "Select a payment method",
  }),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;

/** Parse a checkout FormData into the schema. */
export function parseCheckoutForm(formData: FormData) {
  const raw = {
    customerName: formData.get("customerName"),
    customerEmail: formData.get("customerEmail") || "",
    customerPhone: formData.get("customerPhone"),
    addressLine1: formData.get("addressLine1"),
    addressLine2: formData.get("addressLine2") || "",
    city: formData.get("city"),
    region: formData.get("region"),
    postalCode: formData.get("postalCode") || "",
    paymentMethod: formData.get("paymentMethod"),
  };
  return checkoutSchema.safeParse(raw);
}

export function checkoutFormErrors(
  result: ReturnType<typeof checkoutSchema.safeParse>
) {
  if (result.success) return {};
  const flat = result.error.flatten().fieldErrors;
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(flat)) {
    if (v && v[0]) out[k] = v[0];
  }
  return out;
}
