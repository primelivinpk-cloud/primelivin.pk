"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export type CartProduct = {
  id: string;
  title: string;
  slug: string;
  price: number;
  images: string[] | null;
  stockQuantity: number;
};

export type CartItem = {
  id: string;
  productId: string;
  quantity: number;
  lineTotal: number;
  product: CartProduct;
};

type CartState = {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  currency: string;
};

type CartContextValue = {
  cart: CartState;
  loading: boolean;
  error: string | null;
  addItem: (productId: string, quantity?: number) => Promise<void>;
  setQuantity: (productId: string, quantity: number) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  clear: () => Promise<void>;
  refresh: () => Promise<void>;
};

const emptyCart: CartState = { items: [], itemCount: 0, subtotal: 0, currency: "PKR" };

const CartContext = createContext<CartContextValue | null>(null);

async function fetchJson(url: string, init?: RequestInit): Promise<CartState> {
  const res = await fetch(url, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data as CartState;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartState>(emptyCart);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setError(null);
    try {
      setCart(await fetchJson("/api/cart"));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load cart");
    }
  }, []);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const data = await fetchJson("/api/cart");
        if (!active) return;
        setCart(data);
        setError(null);
      } catch (err) {
        if (!active) return;
        setError(err instanceof Error ? err.message : "Could not load cart");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const addItem = useCallback(async (productId: string, quantity = 1) => {
    setError(null);
    try {
      setCart(
        await fetchJson("/api/cart", {
          method: "POST",
          body: JSON.stringify({ productId, quantity }),
        })
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not add to cart");
      throw err;
    }
  }, []);

  const setQuantity = useCallback(async (productId: string, quantity: number) => {
    setError(null);
    try {
      setCart(
        await fetchJson("/api/cart", {
          method: "PUT",
          body: JSON.stringify({ productId, quantity }),
        })
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update cart");
    }
  }, []);

  const removeItem = useCallback(async (productId: string) => {
    setError(null);
    try {
      setCart(await fetchJson(`/api/cart?productId=${encodeURIComponent(productId)}`, { method: "DELETE" }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not remove item");
    }
  }, []);

  const clear = useCallback(async () => {
    setError(null);
    try {
      setCart(await fetchJson("/api/cart", { method: "DELETE" }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not clear cart");
    }
  }, []);

  const value: CartContextValue = {
    cart,
    loading,
    error,
    addItem,
    setQuantity,
    removeItem,
    clear,
    refresh,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}
