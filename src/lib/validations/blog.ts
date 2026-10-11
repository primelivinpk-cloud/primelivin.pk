import { z } from "zod";

export const blogInputSchema = z.object({
  title: z.string().min(2, "Title is required").max(180),
  slug: z
    .string()
    .min(2)
    .max(180)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers and hyphens only")
    .optional()
    .or(z.literal("")),
  excerpt: z.string().max(240).optional().or(z.literal("")),
  content: z.string().min(20, "Content is required (at least 20 characters)"),

  coverImage: z.string().url("Enter a valid image URL").optional().or(z.literal("")),
  category: z.string().max(80).optional().or(z.literal("")),
  tags: z.string().optional().or(z.literal("")),

  seoTitle: z.string().max(180).optional().or(z.literal("")),
  seoDescription: z.string().max(320).optional().or(z.literal("")),

  status: z.enum(["draft", "published"]).default("draft"),
});

export type BlogInput = z.infer<typeof blogInputSchema>;

/** Parse FormData (checkboxes send "on", numbers come as strings). */
export function parseBlogForm(formData: FormData) {
  const raw = {
    title: formData.get("title"),
    slug: formData.get("slug"),
    excerpt: formData.get("excerpt") || "",
    content: formData.get("content"),
    coverImage: formData.get("coverImage") || "",
    category: formData.get("category") || "",
    tags: formData.get("tags") || "",
    seoTitle: formData.get("seoTitle") || "",
    seoDescription: formData.get("seoDescription") || "",
    status: formData.get("status") || "draft",
  };
  return blogInputSchema.safeParse(raw);
}

export function blogFormErrors(
  result: ReturnType<typeof blogInputSchema.safeParse>
) {
  if (result.success) return {};
  const flat = result.error.flatten().fieldErrors;
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(flat)) {
    if (v && v[0]) out[k] = v[0];
  }
  return out;
}

/** Validate a blog JSON payload (used by the REST API routes). */
export function validateBlogPayload(payload: unknown) {
  return blogInputSchema.safeParse(payload);
}
