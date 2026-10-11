import type { LdNode } from "@/lib/structured-data";

/** Render a JSON-LD object as a script tag. */
export function JsonLd({ data }: { data: LdNode }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
