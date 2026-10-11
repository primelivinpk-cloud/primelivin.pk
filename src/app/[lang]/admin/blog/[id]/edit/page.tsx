import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPostById } from "@/lib/queries";
import { BlogForm } from "@/components/admin/blog-form";

export const metadata: Metadata = { title: "Edit Post" };

type Props = { params: Promise<{ id: string }> };

export default async function EditPostPage({ params }: Props) {
  const { id } = await params;
  const post = await getPostById(id);
  if (!post) notFound();

  return (
    <div>
      <h2 className="mb-6 text-lg font-semibold">Edit post</h2>
      <BlogForm post={post} />
    </div>
  );
}
