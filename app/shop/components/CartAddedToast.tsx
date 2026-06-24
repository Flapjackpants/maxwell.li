"use client";

import Link from "next/link";
import { useEffect } from "react";
import { retroBtnStyle, retroFontFamily, retroLinkStyle } from "@/lib/retro-theme";
import { formatQuantityBreakdown } from "@/lib/shop/minecraft-quantity";

type Props = {
  itemName: string;
  quantity: number;
  onDismiss: () => void;
};

export function CartAddedToast({ itemName, quantity, onDismiss }: Props) {
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
      fontFamily: retroFontFamily,
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
      <br />
      <span style={{ color: "#0ff", fontSize: 12 }}>
        {formatQuantityBreakdown(quantity)}
      </span>
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
