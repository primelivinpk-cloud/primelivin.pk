import type { Metadata } from "next";
import Link from "next/link";
import { getAllPosts } from "@/lib/queries";
import { formatDate } from "@/lib/format";
import { BlogRowActions } from "@/components/admin/blog-row-actions";

export const metadata: Metadata = { title: "Blog" };
export const dynamic = "force-dynamic";

export default async function AdminBlogPage() {
  const items = await getAllPosts();

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">All posts ({items.length})</h2>
        <Link
          href="/admin/blog/new"
          className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-brand-fg transition-opacity hover:opacity-90"
        >
          + Add post
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-border p-12 text-center">
          <p className="font-medium">No posts yet</p>
          <p className="mt-2 text-sm text-muted">
            Write buying guides and furniture tips to drive organic traffic.
          </p>
        </div>
      ) : (
        <div className="mt-6 overflow-hidden rounded-2xl border border-border">
          <table className="w-full text-left text-sm">
            <thead className="bg-brand/10">
              <tr>
                <th className="px-4 py-3 font-semibold">Title</th>
                <th className="px-4 py-3 font-semibold">Category</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Date</th>
                <th className="px-4 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((p, i) => (
                <tr key={p.id} className={i % 2 ? "bg-background" : "bg-background/50"}>
                  <td className="border-t border-border px-4 py-3">
                    <Link
                      href={`/admin/blog/${p.id}/edit`}
                      className="font-medium hover:text-brand"
                    >
                      {p.title}
                    </Link>
                    <p className="mt-0.5 text-xs text-muted">/{p.slug}</p>
                  </td>
                  <td className="border-t border-border px-4 py-3 text-muted">
                    {p.category ?? "—"}
                  </td>
                  <td className="border-t border-border px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        p.status === "published"
                          ? "bg-green-500/10 text-green-600 dark:text-green-400"
                          : "bg-gray-500/10 text-muted"
                      }`}
                    >
                      {p.status === "published" ? "Published" : "Draft"}
                    </span>
                  </td>
                  <td className="border-t border-border px-4 py-3 text-muted">
                    {formatDate(p.createdAt)}
                  </td>
                  <td className="border-t border-border px-4 py-3">
                    <BlogRowActions id={p.id} title={p.title} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
