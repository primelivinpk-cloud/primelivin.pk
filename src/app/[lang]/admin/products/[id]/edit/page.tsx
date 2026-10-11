import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCategories, getProductById } from "@/lib/queries";
import { ProductForm } from "@/components/admin/product-form";

export const metadata: Metadata = { title: "Edit Product" };

type Props = { params: Promise<{ id: string }> };

export default async function EditProductPage({ params }: Props) {
  const { id } = await params;
  const [product, categories] = await Promise.all([getProductById(id), getCategories()]);
  if (!product) notFound();

  return (
    <div>
      <h2 className="mb-6 text-lg font-semibold">Edit: {product.title}</h2>
      <ProductForm categories={categories} product={product} />
    </div>
  );
}
