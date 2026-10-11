"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { parseCheckoutForm, checkoutFormErrors } from "@/lib/validations/order";
import { createOrderFromCart } from "@/lib/orders";
import { getSessionUser } from "@/lib/auth";

export type CheckoutActionState = {
  errors?: Record<string, string>;
  message?: string;
};

/**
 * Place an order from the guest cart.
 * On success redirects to the order confirmation page; otherwise returns
 * field errors / a general message for the form to render.
 */
export async function createOrder(
  _prev: CheckoutActionState,
  formData: FormData
): Promise<CheckoutActionState> {
  const parsed = parseCheckoutForm(formData);
  if (!parsed.success) {
    return {
      errors: checkoutFormErrors(parsed),
      message: "Please fix the errors below.",
    };
  }

  const store = await cookies();
  const token = store.get("cart_token")?.value;
  if (!token) {
    return { message: "Your cart is empty." };
  }

  const user = await getSessionUser();

  let orderId: string;
  try {
    orderId = await createOrderFromCart(token, parsed.data, user?.id ?? null);
  } catch (err) {
    return {
      message:
        err instanceof Error
          ? err.message
          : "Could not place your order. Please try again.",
    };
  }

  redirect(`/orders/${orderId}`);
}
