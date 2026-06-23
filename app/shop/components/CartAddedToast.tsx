"use client";

import Link from "next/link";
import { useEffect } from "react";
import { retroBtnStyle, retroLinkStyle } from "@/lib/retro-theme";

type Props = {
  itemName: string;
  onDismiss: () => void;
};

export function CartAddedToast({ itemName, onDismiss }: Props) {
  useEffect(() => {
    const timer = window.setTimeout(onDismiss, 3000);
    return () => window.clearTimeout(timer);
  }, [onDismiss]);

  return (
  <div
    role="status"
    aria-live="polite"
    style={{
      position: "fixed",
      bottom: 24,
      right: 24,
      zIndex: 9999,
      minWidth: 220,
      maxWidth: 320,
      padding: "12px 14px",
      fontFamily: '"Comic Sans MS", "Comic Sans", cursive, sans-serif',
      backgroundColor: "#000033",
      color: "#ffff00",
      border: "4px ridge #ff00ff",
      boxShadow: "4px 4px 0 #00ffff",
      textAlign: "center",
    }}
  >
    <p
      style={{
        margin: "0 0 8px",
        color: "#0f0",
        fontWeight: "bold",
        fontSize: 16,
      }}
    >
      Successfully added to cart!
    </p>
    <p style={{ margin: "0 0 10px", fontSize: 14 }}>
      <b style={{ color: "#ff6600" }}>{itemName}</b>
    </p>
    <p style={{ margin: 0 }}>
      <Link href="/shop/cart" style={{ ...retroLinkStyle, fontSize: 14 }}>
        View cart
      </Link>
      {" | "}
      <button
        type="button"
        onClick={onDismiss}
        style={{ ...retroBtnStyle, fontSize: 11 }}
      >
        [ OK ]
      </button>
    </p>
  </div>
  );
}
