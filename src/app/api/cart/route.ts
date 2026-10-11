import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { randomUUID } from "crypto";
import {
  getCart,
  addToCart,
  setCartQuantity,
  removeFromCart,
  clearCart,
  pruneInvalidItems,
  type Cart,
} from "@/lib/cart";

const COOKIE = "cart_token";
const ONE_YEAR = 60 * 60 * 24 * 365;

/** Read the cart token from cookies, generating one if absent. */
async function ensureToken(): Promise<string> {
  const store = await cookies();
  const existing = store.get(COOKIE)?.value;
  if (existing && /^[a-zA-Z0-9-]{8,}$/.test(existing)) return existing;
  return randomUUID();
}

/** Build the response and attach the cart-token cookie if it changed. */
function respond(cart: Cart, token: string, hadToken: boolean, status = 200) {
  const res = NextResponse.json(cart, { status });
  if (!hadToken) {
    res.cookies.set(COOKIE, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: ONE_YEAR,
    });
  }
  return res;
}

/**
 * GET /api/cart
 * Returns the current cart for the cart-token cookie.
 */
export async function GET() {
  const store = await cookies();
  const hadToken = Boolean(store.get(COOKIE)?.value);
  const token = await ensureToken();
  await pruneInvalidItems(token);
  const cart = await getCart(token);
  return respond(cart, token, hadToken);
}

/**
 * POST /api/cart  { productId, quantity? }
 * Adds a product (upserts quantity). Returns the updated cart.
 */
export async function POST(request: NextRequest) {
  const store = await cookies();
  const hadToken = Boolean(store.get(COOKIE)?.value);
  const token = await ensureToken();

  let body: { productId?: string; quantity?: number };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const productId = body.productId;
  const quantity = Number.isFinite(body.quantity) ? Number(body.quantity) : 1;
  if (!productId || typeof productId !== "string") {
    return NextResponse.json({ error: "productId is required" }, { status: 400 });
  }
  if (quantity < 1) {
    return NextResponse.json({ error: "quantity must be >= 1" }, { status: 400 });
  }

  try {
    const cart = await addToCart(token, productId, quantity);
    return respond(cart, token, hadToken, 201);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not add to cart";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

/**
 * PUT /api/cart  { productId, quantity }
 * Sets an item's quantity. quantity <= 0 removes the item.
 */
export async function PUT(request: NextRequest) {
  const token = await ensureToken();

  let body: { productId?: string; quantity?: number };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const productId = body.productId;
  const quantity = Number(body.quantity);
  if (!productId || typeof productId !== "string") {
    return NextResponse.json({ error: "productId is required" }, { status: 400 });
  }
  if (!Number.isFinite(quantity)) {
    return NextResponse.json({ error: "quantity must be a number" }, { status: 400 });
  }

  const cart = await setCartQuantity(token, productId, quantity);
  return respond(cart, token, true);
}

/**
 * DELETE /api/cart[?productId=...]
 * Without productId: clears the whole cart.
 * With productId: removes just that item.
 */
export async function DELETE(request: NextRequest) {
  const token = await ensureToken();
  const productId = request.nextUrl.searchParams.get("productId");

  const cart = productId
    ? await removeFromCart(token, productId)
    : await (async () => {
        await clearCart(token);
        return getCart(token);
      })();

  return respond(cart, token, true);
}
