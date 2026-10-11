import type { Metadata } from "next";
import { BlogForm } from "@/components/admin/blog-form";

export const metadata: Metadata = { title: "Add Post" };

export default function NewPostPage() {
  return (
    <div>
      <h2 className="mb-6 text-lg font-semibold">Add a new post</h2>
      <BlogForm />
    </div>
  );
}
