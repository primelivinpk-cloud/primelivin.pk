import { db } from "./db";
import { orders, orderItems, products, cartItems } from "./schema";
import { eq, sql } from "drizzle-orm";
import { newId, newOrderNumber } from "./format";
import { getCart, pruneInvalidItems } from "./cart";
import type { CheckoutInput } from "./validations/order";

export type OrderWithItems = {
  order: typeof orders.$inferSelect;
  items: (typeof orderItems.$inferSelect)[];
};

/** Fetch an order with its line items. */
export async function getOrderById(id: string): Promise<OrderWithItems | null> {
  const order = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
  if (!order[0]) return null;

  const items = await db
    .select()
    .from(orderItems)
    .where(eq(orderItems.orderId, id));

  return { order: order[0], items };
}

/**
 * Create an order from the guest cart (keyed by cart token).
 * Pricing and stock are re-read from the database — never trusted from the
 * client. The order, its items, stock decrements and cart clear are all
 * committed in a single transaction.
 *
 * Returns the new order id, or throws an Error with a user-facing message.
 */
export async function createOrderFromCart(
  token: string,
  input: CheckoutInput,
  userId: string | null = null
): Promise<string> {
  await pruneInvalidItems(token);
  const cart = await getCart(token);
  if (cart.items.length === 0) {
    throw new Error("Your cart is empty.");
  }

  // Re-verify stock at checkout time.
  const insufficient = cart.items.find((i) => i.quantity > i.product.stockQuantity);
  if (insufficient) {
    throw new Error(
      `Only ${insufficient.product.stockQuantity} left in stock for "${insufficient.product.title}". Please reduce the quantity.`
    );
  }

  const orderId = newOrderNumber();

  await db.transaction(async (tx) => {
    await tx.insert(orders).values({
      id: orderId,
      userId,
      customerName: input.customerName,
      customerEmail: input.customerEmail?.trim() || null,
      customerPhone: input.customerPhone,
      status: "pending",
      totalAmount: cart.subtotal,
      currency: "PKR",
      shippingAddress: {
        line1: input.addressLine1,
        line2: input.addressLine2?.trim() || undefined,
        city: input.city,
        region: input.region,
        postalCode: input.postalCode?.trim() || undefined,
      },
      paymentMethod: input.paymentMethod,
      paymentStatus: "unpaid",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    for (const item of cart.items) {
      await tx.insert(orderItems).values({
        id: newId("oi"),
        orderId,
        productId: item.productId,
        title: item.product.title,
        price: item.product.price,
        quantity: item.quantity,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await tx
        .update(products)
        .set({
          stockQuantity: sql`max(${products.stockQuantity} - ${item.quantity}, 0)`,
          updatedAt: new Date(),
        })
        .where(eq(products.id, item.productId));
    }

    await tx.delete(cartItems).where(eq(cartItems.cartToken, token));
  });

  return orderId;
}
