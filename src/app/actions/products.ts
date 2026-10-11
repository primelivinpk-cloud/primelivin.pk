"use server";

import { db } from "@/lib/db";
import { products } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { parseProductForm, formErrors } from "@/lib/validations/product";
import { newId, slugify } from "@/lib/format";
import { getProductById, getProductBySlug } from "@/lib/queries";

export type ProductActionState = {
  errors?: Record<string, string>;
  message?: string;
  success?: boolean;
  id?: string;
};

function tagsToArray(tags: string | undefined): string[] {
  if (!tags) return [];
  return tags
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
}

function rowsFromInput(input: {
  title: string;
  slug?: string;
  description: string;
  shortDescription?: string;
  price: number;
  compareAtPrice?: number | null;
  categorySlug: string;
  tags?: string;
  sku?: string;
  stockQuantity?: number;
  images: string[];
  seoTitle?: string;
  seoDescription?: string;
  isFeatured?: boolean;
  isActive?: boolean;
}) {
  return {
    title: input.title,
    slug: input.slug && input.slug.length > 0 ? input.slug : slugify(input.title),
    description: input.description,
    shortDescription: input.shortDescription || null,
    price: input.price,
    compareAtPrice: input.compareAtPrice ?? null,
    currency: "PKR",
    categorySlug: input.categorySlug,
    tags: tagsToArray(input.tags),
    sku: input.sku || null,
    stockQuantity: input.stockQuantity ?? 0,
    images: input.images ?? [],
    seoTitle: input.seoTitle || null,
    seoDescription: input.seoDescription || null,
    isFeatured: Boolean(input.isFeatured),
    isActive: input.isActive !== false,
  };
}

/** Create a product from the admin form. */
export async function createProduct(
  _prev: ProductActionState,
  formData: FormData
): Promise<ProductActionState> {
  const parsed = parseProductForm(formData);
  if (!parsed.success) {
    return { errors: formErrors(parsed), message: "Please fix the errors below." };
  }

  const data = parsed.data;
  const existing = await getProductBySlug(data.slug || slugify(data.title), true);
  if (existing) {
    return {
      errors: { slug: "A product with this slug already exists." },
      message: "Please fix the errors below.",
    };
  }

  const id = newId("prod");
  const rows = rowsFromInput({ ...data, slug: data.slug || slugify(data.title) });

  await db.insert(products).values({ id, ...rows, createdAt: new Date(), updatedAt: new Date() });

  revalidatePath("/");
  revalidatePath("/shop");
  revalidatePath("/admin/products");
  redirect("/admin/products");
}

/** Update an existing product. */
export async function updateProduct(
  id: string,
  _prev: ProductActionState,
  formData: FormData
): Promise<ProductActionState> {
  const parsed = parseProductForm(formData);
  if (!parsed.success) {
    return { errors: formErrors(parsed), message: "Please fix the errors below." };
  }

  const current = await getProductById(id);
  if (!current) {
    return { message: "Product not found.", success: false };
  }

  const data = parsed.data;
  const slug = data.slug && data.slug.length > 0 ? data.slug : slugify(data.title);
  const clash = await getProductBySlug(slug, true);
  if (clash && clash.id !== id) {
    return {
      errors: { slug: "A product with this slug already exists." },
      message: "Please fix the errors below.",
    };
  }

  const rows = rowsFromInput({ ...data, slug });

  await db.update(products).set({ ...rows, updatedAt: new Date() }).where(eq(products.id, id));

  revalidatePath("/");
  revalidatePath("/shop");
  revalidatePath(`/shop/${slug}`);
  revalidatePath("/admin/products");
  redirect("/admin/products");
}

/** Delete a product by id. */
export async function deleteProduct(id: string): Promise<ProductActionState> {
  const current = await getProductById(id);
  if (!current) return { message: "Product not found." };

  await db.delete(products).where(eq(products.id, id));

  revalidatePath("/");
  revalidatePath("/shop");
  revalidatePath("/admin/products");
  return { success: true, message: "Product deleted." };
}
