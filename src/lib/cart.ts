import { db } from "./db";
import { cartItems, products } from "./schema";
import { eq, and, sql, inArray } from "drizzle-orm";
import type { Product } from "./schema";

/** A cart line: product data + chosen quantity. */
export type CartLine = {
  id: string;
  productId: string;
  quantity: number;
  product: Product;
  lineTotal: number;
};

export type Cart = {
  items: CartLine[];
  itemCount: number;
  subtotal: number;
  currency: string;
};

const MAX_QTY_PER_ITEM = 99;

function buildCart(lines: { id: string; productId: string; quantity: number; product: Product }[]): Cart {
  const items: CartLine[] = lines.map((l) => ({
    id: l.id,
    productId: l.productId,
    quantity: l.quantity,
    product: l.product,
    lineTotal: l.product.price * l.quantity,
  }));
  const itemCount = items.reduce((n, i) => n + i.quantity, 0);
  const subtotal = items.reduce((n, i) => n + i.lineTotal, 0);
  return { items, itemCount, subtotal, currency: "PKR" };
}

/** Read a cart by token, joined with live product data. */
export async function getCart(token: string): Promise<Cart> {
  const rows = await db
    .select({
      id: cartItems.id,
      productId: cartItems.productId,
      quantity: cartItems.quantity,
      product: products,
    })
    .from(cartItems)
    .innerJoin(products, eq(cartItems.productId, products.id))
    .where(eq(cartItems.cartToken, token));

  return buildCart(rows);
}

/** Get just the total item count (for the header badge). */
export async function getCartCount(token: string): Promise<number> {
  const rows = await db
    .select({ total: sql<number>`coalesce(sum(quantity), 0)` })
    .from(cartItems)
    .where(eq(cartItems.cartToken, token));
  return rows[0]?.total ?? 0;
}

/** Add a product to the cart (upserts quantity). Clamps to stock. */
export async function addToCart(
  token: string,
  productId: string,
  quantity = 1
): Promise<Cart> {
  const product = await db
    .select()
    .from(products)
    .where(and(eq(products.id, productId), eq(products.isActive, true)))
    .limit(1);

  if (!product[0]) throw new Error("Product not found or unavailable");
  if (product[0].stockQuantity <= 0) throw new Error("Product is out of stock");

  const desired = Math.max(1, Math.min(quantity, MAX_QTY_PER_ITEM, product[0].stockQuantity));

  const existing = await db
    .select({ id: cartItems.id, quantity: cartItems.quantity })
    .from(cartItems)
    .where(and(eq(cartItems.cartToken, token), eq(cartItems.productId, productId)))
    .limit(1);

  if (existing[0]) {
    const nextQty = Math.min(existing[0].quantity + desired, MAX_QTY_PER_ITEM, product[0].stockQuantity);
    await db
      .update(cartItems)
      .set({ quantity: nextQty, updatedAt: new Date() })
      .where(eq(cartItems.id, existing[0].id));
  } else {
    await db.insert(cartItems).values({
      id: `cart_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`,
      cartToken: token,
      productId,
      quantity: desired,
    });
  }

  return getCart(token);
}

/** Set an item's quantity. quantity <= 0 removes it. */
export async function setCartQuantity(
  token: string,
  productId: string,
  quantity: number
): Promise<Cart> {
  if (quantity <= 0) {
    await removeFromCart(token, productId);
    return getCart(token);
  }

  const product = await db
    .select()
    .from(products)
    .where(eq(products.id, productId))
    .limit(1);
  const stock = product[0]?.stockQuantity ?? 0;
  const nextQty = Math.max(1, Math.min(quantity, MAX_QTY_PER_ITEM, stock || MAX_QTY_PER_ITEM));

  await db
    .update(cartItems)
    .set({ quantity: nextQty, updatedAt: new Date() })
    .where(and(eq(cartItems.cartToken, token), eq(cartItems.productId, productId)));

  return getCart(token);
}

/** Remove a single product from the cart. */
export async function removeFromCart(token: string, productId: string): Promise<Cart> {
  await db
    .delete(cartItems)
    .where(and(eq(cartItems.cartToken, token), eq(cartItems.productId, productId)));
  return getCart(token);
}

/** Clear the entire cart. */
export async function clearCart(token: string): Promise<void> {
  await db.delete(cartItems).where(eq(cartItems.cartToken, token));
}

/** Remove cart items whose product ids are no longer valid (defensive). */
export async function pruneInvalidItems(token: string): Promise<void> {
  const rows = await db
    .select({ productId: cartItems.productId })
    .from(cartItems)
    .where(eq(cartItems.cartToken, token));
  if (rows.length === 0) return;

  const ids = rows.map((r) => r.productId);
  const valid = await db
    .select({ id: products.id })
    .from(products)
    .where(and(inArray(products.id, ids), eq(products.isActive, true)));
  const validSet = new Set(valid.map((v) => v.id));
  const invalid = ids.filter((id) => !validSet.has(id));
  if (invalid.length > 0) {
    await db
      .delete(cartItems)
      .where(and(eq(cartItems.cartToken, token), inArray(cartItems.productId, invalid)));
  }
}
