"use client";

import { useId, useState } from "react";
import { createPortal } from "react-dom";
import { retroBtnStyle, retroInputStyle } from "@/lib/retro-theme";
import {
  formatQuantityBreakdown,
  parseQuantityFields,
  toAbsoluteQuantity,
} from "@/lib/shop/minecraft-quantity";
import {
  formatPurchaseLimit,
  getMaxPurchaseQuantity,
} from "@/lib/shop/purchase-limit";
import type { Listing } from "@/lib/shop/types";

type Props = {
  listing: Listing;
  existingQuantity?: number;
  onConfirm: (quantity: number) => void;
  onCancel: () => void;
};

export function CartQuantityPicker({
  listing,
  existingQuantity = 0,
  onConfirm,
  onCancel,
}: Props) {
  const id = useId();
  const [chests, setChests] = useState("0");
  const [stacks, setStacks] = useState("0");
  const [items, setItems] = useState("1");
  const [error, setError] = useState<string | null>(null);

  const maxTotal = getMaxPurchaseQuantity(listing);
  const remaining =
    maxTotal === null ? null : Math.max(0, maxTotal - existingQuantity);

  function handleConfirm() {
    const absolute = toAbsoluteQuantity(
      parseQuantityFields(chests, stacks, items),
    );
    if (absolute < 1) {
      setError("Enter at least 1 item");
      return;
    }
    if (remaining !== null && absolute > remaining) {
      setError(
        remaining === 0
          ? "This listing is already at the purchase limit in your cart"
          : `Maximum ${formatQuantityBreakdown(remaining)} more for this listing`,
      );
      return;
    }
    onConfirm(absolute);
  }

  if (typeof document === "undefined") return null;

  const inputStyle = { ...retroInputStyle, width: 56 };
  const limitLabel = formatPurchaseLimit(listing);

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="cart-qty-title"
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
      onClick={onCancel}
    >
      <div
        style={{
          fontFamily: '"Comic Sans MS", "Comic Sans", cursive, sans-serif',
          backgroundColor: "#000033",
          color: "#ffff00",
          border: "4px ridge #ff00ff",
          boxShadow: "6px 6px 0 #00ffff",
          padding: 16,
          maxWidth: 420,
          width: "100%",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2
          id="cart-qty-title"
          style={{ color: "#ff00ff", textAlign: "center", margin: "0 0 8px" }}
        >
          Select Quantity
        </h2>
        <p style={{ textAlign: "center", margin: "0 0 12px" }}>
          <b style={{ color: "#ff6600" }}>{listing.name}</b>
        </p>
        <p
          style={{
            fontSize: 12,
            textAlign: "center",
            color: "#aaa",
            margin: "0 0 12px",
          }}
        >
          1 stack = 64 items · 1 chest = 27 stacks
          {limitLabel ? (
            <>
              <br />
              {limitLabel}
              {existingQuantity > 0 ? (
                <>
                  <br />
                  Already in cart: {formatQuantityBreakdown(existingQuantity)}
                </>
              ) : null}
            </>
          ) : null}
        </p>

        <center style={{ marginBottom: 12 }}>
          <span
            style={{
              display: "inline-flex",
              flexWrap: "wrap",
              gap: 6,
              alignItems: "center",
            }}
          >
            <label htmlFor={`${id}-chests`}>
              Chests:{" "}
              <input
                id={`${id}-chests`}
                type="number"
                min={0}
                value={chests}
                style={inputStyle}
                onChange={(e) => {
                  setChests(e.target.value);
                  setError(null);
                }}
              />
            </label>
            <label htmlFor={`${id}-stacks`}>
              Stacks:{" "}
              <input
                id={`${id}-stacks`}
                type="number"
                min={0}
                value={stacks}
                style={inputStyle}
                onChange={(e) => {
                  setStacks(e.target.value);
                  setError(null);
                }}
              />
            </label>
            <label htmlFor={`${id}-items`}>
              Items:{" "}
              <input
                id={`${id}-items`}
                type="number"
                min={0}
                value={items}
                style={inputStyle}
                onChange={(e) => {
                  setItems(e.target.value);
                  setError(null);
                }}
              />
            </label>
          </span>
        </center>

        {error ? (
          <p style={{ color: "#f00", textAlign: "center", margin: "0 0 8px" }}>
            {error}
          </p>
        ) : null}

        <p style={{ textAlign: "center", margin: 0 }}>
          <button type="button" style={retroBtnStyle} onClick={handleConfirm}>
            [ ADD TO CART ]
          </button>{" "}
          <button type="button" style={retroBtnStyle} onClick={onCancel}>
            [ CANCEL ]
          </button>
        </p>
      </div>
    </div>,
    document.body,
  );
}
