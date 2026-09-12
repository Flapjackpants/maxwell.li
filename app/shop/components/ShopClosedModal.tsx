"use client";

import { createPortal } from "react-dom";
import { retroBtnStyle, retroFontFamily } from "@/lib/retro-theme";

type Props = {
  isOpen: boolean;
  onDismiss: () => void;
};

export function ShopClosedModal({ isOpen, onDismiss }: Props) {
  if (!isOpen || typeof document === "undefined") return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="shop-closed-title"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 10000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0, 0, 0, 0.75)",
        padding: 16,
      }}
      onClick={onDismiss}
    >
      <div
        style={{
          fontFamily: retroFontFamily,
          backgroundColor: "#000033",
          color: "#ffff00",
          border: "4px ridge #ff0033",
          boxShadow: "6px 6px 0 #ff0055",
          padding: 24,
          maxWidth: 460,
          width: "100%",
          textAlign: "center",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2
          id="shop-closed-title"
          style={{ color: "#ff2244", margin: "0 0 12px" }}
        >
          :: SHOP CLOSED ::
        </h2>
        <p style={{ fontSize: 16, margin: "0 0 16px", color: "#ffffff" }}>
          The shop is currently closed! Please come back when the shop is open to
          add items to your cart or check out.
        </p>
        <p style={{ margin: 0 }}>
          <button type="button" style={retroBtnStyle} onClick={onDismiss}>
            [ OK ]
          </button>
        </p>
      </div>
    </div>,
    document.body,
  );
}
