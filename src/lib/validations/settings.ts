import { z } from "zod";
import { site } from "@/lib/site";

export const addressSchema = z.object({
  id: z.string().max(40).optional(),
  label: z.string().trim().min(1, "Label is required").max(40, "Keep the label short"),
  line1: z.string().trim().min(3, "Address is required").max(240),
  line2: z.string().max(240).optional().or(z.literal("")),
  city: z.string().trim().min(2, "City is required").max(120),
  region: z.enum(site.regions, {
    error: "Select a province/region",
  }),
  postalCode: z
    .string()
    .regex(/^\d{5}$/, "Enter a 5-digit postal code")
    .optional()
    .or(z.literal("")),
  isDefault: z.boolean(),
});

export type AddressInput = z.infer<typeof addressSchema>;

/** Parse an address book FormData into the schema. */
export function parseAddressForm(formData: FormData) {
  return addressSchema.safeParse({
    id: formData.get("id") || undefined,
    label: formData.get("label"),
    line1: formData.get("line1"),
    line2: formData.get("line2") || "",
    city: formData.get("city"),
    region: formData.get("region"),
    postalCode: formData.get("postalCode") || "",
    isDefault: formData.get("isDefault") === "on",
  });
}

export function addressFormErrors(result: ReturnType<typeof addressSchema.safeParse>) {
  if (result.success) return {};
  const flat = result.error.flatten().fieldErrors;
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(flat)) {
    if (v && v[0]) out[k] = v[0];
  }
  return out;
}
