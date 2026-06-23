"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { CartItem } from "@/lib/shop/types";
import { CartAddedToast } from "./CartAddedToast";

const STORAGE_KEY = "shop_cart";

type CartContextValue = {
  items: CartItem[];
  addItem: (listingId: number, quantity?: number, itemName?: string) => void;
  removeItem: (listingId: number) => void;
  setQuantity: (listingId: number, quantity: number) => void;
  clearCart: () => void;
  itemCount: number;
  hydrated: boolean;
};

const CartContext = createContext<CartContextValue | null>(null);

function loadCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as CartItem[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveCart(items: CartItem[]) {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [addedToast, setAddedToast] = useState<string | null>(null);

  useEffect(() => {
    const stored = loadCart();
    queueMicrotask(() => {
      setItems(stored);
      setHydrated(true);
    });
  }, []);

  useEffect(() => {
    if (hydrated) saveCart(items);
  }, [items, hydrated]);

  const addItem = useCallback(
    (listingId: number, quantity = 1, itemName?: string) => {
      setItems((prev) => {
        const existing = prev.find((i) => i.listingId === listingId);
        if (existing) {
          return prev.map((i) =>
            i.listingId === listingId
              ? { ...i, quantity: i.quantity + quantity }
              : i,
          );
        }
        return [...prev, { listingId, quantity }];
      });
      if (itemName) setAddedToast(itemName);
    },
    [],
  );

  const removeItem = useCallback((listingId: number) => {
    setItems((prev) => prev.filter((i) => i.listingId !== listingId));
  }, []);

  const setQuantity = useCallback((listingId: number, quantity: number) => {
    if (quantity <= 0) {
      setItems((prev) => prev.filter((i) => i.listingId !== listingId));
      return;
    }
    setItems((prev) =>
      prev.map((i) => (i.listingId === listingId ? { ...i, quantity } : i)),
    );
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const itemCount = useMemo(
    () => items.reduce((sum, i) => sum + i.quantity, 0),
    [items],
  );

  const value = useMemo(
    () => ({
      items,
      addItem,
      removeItem,
      setQuantity,
      clearCart,
      itemCount,
      hydrated,
    }),
    [items, addItem, removeItem, setQuantity, clearCart, itemCount, hydrated],
  );

  return (
    <CartContext.Provider value={value}>
      {children}
      {addedToast ? (
        <CartAddedToast
          itemName={addedToast}
          onDismiss={() => setAddedToast(null)}
        />
      ) : null}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
