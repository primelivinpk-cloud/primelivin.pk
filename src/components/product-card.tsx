import Link from "next/link";
import type { Product } from "@/lib/schema";
import { formatPKR } from "@/lib/format";

export function ProductCard({ product }: { product: Product }) {
  const discount =
    product.compareAtPrice && product.compareAtPrice > product.price
      ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
      : null;

  return (
    <Link
      href={`/shop/${product.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-background transition-shadow hover:shadow-lg"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-brand/10">
        {product.images && product.images.length > 0 ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.images[0]}
            alt={product.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm text-muted">
            {product.categorySlug.replace(/-/g, " ")}
          </div>
        )}
        {discount && (
          <span className="absolute left-3 top-3 rounded-full bg-accent px-2.5 py-1 text-xs font-semibold text-white">
            -{discount}%
          </span>
        )}
        {product.isFeatured && (
          <span className="absolute right-3 top-3 rounded-full bg-brand px-2.5 py-1 text-xs font-semibold text-brand-fg">
            Featured
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="text-sm font-semibold leading-snug group-hover:text-brand">
          {product.title}
        </h3>
        {product.shortDescription && (
          <p className="mt-1 line-clamp-2 text-xs text-muted">{product.shortDescription}</p>
        )}

        {product.rating && product.rating > 0 && (
          <div className="mt-2 flex items-center gap-1 text-xs text-muted">
            <span className="text-accent">★</span>
            <span className="font-medium text-foreground">{product.rating.toFixed(1)}</span>
            <span>({product.reviewCount})</span>
          </div>
        )}

        <div className="mt-auto flex items-baseline gap-2 pt-3">
          <span className="text-base font-bold">{formatPKR(product.price)}</span>
          {product.compareAtPrice && product.compareAtPrice > product.price && (
            <span className="text-sm text-muted line-through">
              {formatPKR(product.compareAtPrice)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
