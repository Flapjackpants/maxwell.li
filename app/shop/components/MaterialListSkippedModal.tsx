"use client";

import { createPortal } from "react-dom";
import { retroBtnStyle, retroFontFamily } from "@/lib/retro-theme";
import { formatQuantityBreakdown } from "@/lib/shop/minecraft-quantity";
import type { MaterialListSkipped } from "@/lib/shop/litematica-material-list";

type Props = {
  skipped: MaterialListSkipped[];
  addedCount: number;
  onDismiss: () => void;
};

function reasonLabel(item: MaterialListSkipped): string {
  if (item.reason === "not_listing") {
    return "Not available in shop";
  }
  if (item.maxAllowed !== null) {
    return `Exceeds max ${formatQuantityBreakdown(item.maxAllowed)} per order`;
  }
  return "Exceeds purchase limit";
}

export function MaterialListSkippedModal({
  skipped,
  addedCount,
  onDismiss,
}: Props) {
  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="material-skip-title"
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
          border: "4px ridge #ff00ff",
          boxShadow: "6px 6px 0 #00ffff",
          padding: 16,
          maxWidth: 520,
          width: "100%",
          maxHeight: "80vh",
          overflow: "auto",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2
          id="material-skip-title"
          style={{ color: "#ff00ff", textAlign: "center", margin: "0 0 8px" }}
        >
          Could not add {skipped.length} item(s)
        </h2>
        {addedCount > 0 ? (
          <p style={{ textAlign: "center", color: "#0f0", margin: "0 0 12px" }}>
            {addedCount} listing(s) were added to your cart.
          </p>
        ) : (
          <p style={{ textAlign: "center", margin: "0 0 12px", fontSize: 13 }}>
            No items were added to your cart.
          </p>
        )}
        <table
          width="100%"
          cellPadding={6}
          style={{ border: "2px ridge #f0f", fontSize: 13, marginBottom: 12 }}
        >
          <thead>
            <tr style={{ backgroundColor: "#111166" }}>
              <th align="left">Item</th>
              <th align="right">Requested</th>
              <th align="left">Reason</th>
            </tr>
          </thead>
          <tbody>
            {skipped.map((item) => (
              <tr key={item.name} style={{ backgroundColor: "#0a0a44" }}>
                <td>{item.name}</td>
                <td align="right">
                  {formatQuantityBreakdown(item.requested)}
                </td>
                <td style={{ color: "#f88" }}>{reasonLabel(item)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p style={{ textAlign: "center", margin: 0 }}>
          <button type="button" style={retroBtnStyle} onClick={onDismiss}>
            [ OK ]
          </button>
        </p>
      </div>
    </div>,
    document.body,
  );
}
