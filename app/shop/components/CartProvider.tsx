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
import { ShopClosedModal } from "./ShopClosedModal";

const STORAGE_KEY = "shop_cart";

type CartContextValue = {
  items: CartItem[];
  addItem: (listingId: number, quantity?: number, itemName?: string) => void;
  removeItem: (listingId: number) => void;
  setQuantity: (listingId: number, quantity: number) => void;
  mergeCartQuantities: (
    updates: { listingId: number; quantity: number }[],
  ) => void;
  clearCart: () => void;
  itemCount: number;
  hydrated: boolean;
  storeOpen: boolean;
  openShopClosedModal: () => void;
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
  const [storeOpen, setStoreOpen] = useState(true);
  const [closedModalOpen, setClosedModalOpen] = useState(false);
  const [addedToast, setAddedToast] = useState<{
    name: string;
    quantity: number;
  } | null>(null);

  useEffect(() => {
    const stored = loadCart();
    queueMicrotask(() => {
      setItems(stored);
      setHydrated(true);
    });
  }, []);

  useEffect(() => {
    fetch("/api/shop/config")
      .then((r) => r.json())
      .then((data: { storeOpen?: boolean }) => {
        if (typeof data.storeOpen === "boolean") {
          setStoreOpen(data.storeOpen);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (hydrated) saveCart(items);
  }, [items, hydrated]);

  const openShopClosedModal = useCallback(() => {
    setClosedModalOpen(true);
  }, []);

  const addItem = useCallback(
    (listingId: number, quantity = 1, itemName?: string) => {
      if (!storeOpen) {
        setClosedModalOpen(true);
        return;
      }
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
      if (itemName) setAddedToast({ name: itemName, quantity });
    },
    [storeOpen],
  );

  const removeItem = useCallback((listingId: number) => {
    setItems((prev) => prev.filter((i) => i.listingId !== listingId));
  }, []);

  const setQuantity = useCallback(
    (listingId: number, quantity: number) => {
      if (quantity <= 0) {
        setItems((prev) => prev.filter((i) => i.listingId !== listingId));
        return;
      }
      setItems((prev) => {
        const existing = prev.find((i) => i.listingId === listingId);
        if (!storeOpen && (!existing || quantity > existing.quantity)) {
          setClosedModalOpen(true);
          return prev;
        }
        return prev.map((i) =>
          i.listingId === listingId ? { ...i, quantity } : i,
        );
      });
    },
    [storeOpen],
  );

  const mergeCartQuantities = useCallback(
    (updates: { listingId: number; quantity: number }[]) => {
      if (updates.length === 0) return;
      if (!storeOpen) {
        setClosedModalOpen(true);
        return;
      }
      setItems((prev) => {
        const next = new Map(prev.map((item) => [item.listingId, item]));
        for (const { listingId, quantity } of updates) {
          if (quantity <= 0) {
            next.delete(listingId);
          } else {
            next.set(listingId, { listingId, quantity });
          }
        }
        return [...next.values()];
      });
    },
    [storeOpen],
  );

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
      mergeCartQuantities,
      clearCart,
      itemCount,
      hydrated,
      storeOpen,
      openShopClosedModal,
    }),
    [
      items,
      addItem,
      removeItem,
      setQuantity,
      mergeCartQuantities,
      clearCart,
      itemCount,
      hydrated,
      storeOpen,
      openShopClosedModal,
    ],
  );

  return (
    <CartContext.Provider value={value}>
      {children}
      {addedToast ? (
        <CartAddedToast
          itemName={addedToast.name}
          quantity={addedToast.quantity}
          onDismiss={() => setAddedToast(null)}
        />
      ) : null}
      <ShopClosedModal
        isOpen={closedModalOpen}
        onDismiss={() => setClosedModalOpen(false)}
      />
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
