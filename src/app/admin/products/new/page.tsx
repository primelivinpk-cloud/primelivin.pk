import type { Metadata } from "next";
import { getCategories } from "@/lib/queries";
import { ProductForm } from "@/components/admin/product-form";

export const metadata: Metadata = { title: "Add Product" };

export default async function NewProductPage() {
  const categories = await getCategories();

  return (
    <div>
      <h2 className="mb-6 text-lg font-semibold">Add a new product</h2>
      <ProductForm categories={categories} />
    </div>
  );
}
