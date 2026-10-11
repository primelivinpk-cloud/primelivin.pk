import { z } from "zod";

export const productInputSchema = z.object({
  title: z.string().min(2, "Title is required").max(180),
  slug: z
    .string()
    .min(2)
    .max(180)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers and hyphens only")
    .optional()
    .or(z.literal("")),
  description: z.string().min(10, "Description is required"),
  shortDescription: z.string().max(240).optional().or(z.literal("")),

  price: z.coerce.number().positive("Price must be a positive number"),
  compareAtPrice: z.coerce
    .number()
    .positive()
    .optional()
    .or(z.nan())
    .nullable()
    .transform((v) => (Number.isNaN(v) ? null : v)),

  categorySlug: z.string().min(1, "Category is required"),
  tags: z.string().optional().or(z.literal("")),
  sku: z.string().max(64).optional().or(z.literal("")),
  stockQuantity: z.coerce.number().int().min(0).default(0),

  images: z.array(z.string().url()).default([]),

  seoTitle: z.string().max(180).optional().or(z.literal("")),
  seoDescription: z.string().max(320).optional().or(z.literal("")),

  isFeatured: z.coerce.boolean().default(false),
  isActive: z.coerce.boolean().default(true),
});

export type ProductInput = z.infer<typeof productInputSchema>;

// Parse FormData (checkboxes send "on", numbers come as strings)
export function parseProductForm(formData: FormData) {
  const raw = {
    title: formData.get("title"),
    slug: formData.get("slug"),
    description: formData.get("description"),
    shortDescription: formData.get("shortDescription"),
    price: formData.get("price"),
    compareAtPrice: formData.get("compareAtPrice") || null,
    categorySlug: formData.get("categorySlug"),
    tags: formData.get("tags"),
    sku: formData.get("sku"),
    stockQuantity: formData.get("stockQuantity") || 0,
    images: JSON.parse((formData.get("images") as string) || "[]"),
    seoTitle: formData.get("seoTitle"),
    seoDescription: formData.get("seoDescription"),
    isFeatured: formData.get("isFeatured") === "on" || formData.get("isFeatured") === "true",
    isActive: formData.get("isActive") === "on" || formData.get("isActive") === "true",
  };
  return productInputSchema.safeParse(raw);
}

export function formErrors(result: ReturnType<typeof productInputSchema.safeParse>) {
  if (result.success) return {};
  const flat = result.error.flatten().fieldErrors;
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(flat)) {
    if (v && v[0]) out[k] = v[0];
  }
  return out;
}

/** Validate a product JSON payload (used by the REST API routes). */
export function validateProductPayload(payload: unknown) {
  return productInputSchema.safeParse(payload);
}
