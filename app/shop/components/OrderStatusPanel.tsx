"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  ORDER_STATUS_LABELS,
  canCancelOrder,
  getProgressColumns,
  normalizeOrderStatus,
  type OrderStatus,
} from "@/lib/shop/order-status";
import { PAYMENT_INSTRUCTIONS } from "@/lib/shop/constants";
import { formatListingPrice, listingPrice } from "@/lib/shop/pricing";
import { retroBtnStyle, retroTableBorder } from "@/lib/retro-theme";
import { MinecraftQuantityLabel } from "./MinecraftQuantityInputs";
import type { OrderItem } from "@/lib/shop/types";

type OrderView = {
  id: string;
  status: string;
  fulfillmentType: "pickup" | "delivery";
  deliveryFee: number;
  deliveryX: number | null;
  deliveryY: number | null;
  deliveryZ: number | null;
  deliveryDimension: string | null;
  pickupLocation: string | null;
  estimatedReadyTime: string | null;
  total: number;
  dmFailed: boolean;
  buyerUsername: string;
  items: OrderItem[];
};

type Props = {
  order: OrderView;
  currency: string;
  isOwner: boolean;
};

export function OrderStatusPanel({ order, currency, isOwner }: Props) {
  const router = useRouter();
  const columns = getProgressColumns();
  const normalized = normalizeOrderStatus(order.status);
  const isCancelled = normalized === "cancelled";
  const currentIdx = isCancelled ? -1 : columns.indexOf(normalized);
  const itemsSubtotal = order.total - order.deliveryFee;
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);

  async function handleCancel() {
    if (
      !confirm(
        "Cancel this order? This cannot be undone.",
      )
    ) {
      return;
    }

    setCancelling(true);
    setCancelError(null);
    try {
      const res = await fetch(`/api/orders/${order.id}/cancel`, {
        method: "POST",
        credentials: "include",
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setCancelError(
          typeof data.error === "string" ? data.error : "Could not cancel order",
        );
        return;
      }
      router.refresh();
    } catch {
      setCancelError("Could not cancel order");
    } finally {
      setCancelling(false);
    }
  }

  return (
    <>
      {order.dmFailed ? (
        <p style={{ color: "#ff6600", fontWeight: "bold" }}>
          We could not DM you on Discord. Check this page for updates!
        </p>
      ) : null}

      <p>
        <b>Status:</b>{" "}
        <span style={{ color: isCancelled ? "#f00" : undefined }}>
          {ORDER_STATUS_LABELS[normalized as OrderStatus] ?? order.status}
        </span>
      </p>

      {isCancelled ? (
        <p
          style={{
            background: "#440000",
            padding: 8,
            border: "2px ridge #f00",
            color: "#faa",
          }}
        >
          This order was cancelled.
        </p>
      ) : (
        <table cellPadding={4} style={{ ...retroTableBorder, marginBottom: 12 }}>
          <tbody>
            {columns.map((status, idx) => {
              const done = currentIdx >= 0 && idx <= currentIdx;
              return (
                <tr key={status}>
                  <td
                    style={{
                      backgroundColor: done ? "#003300" : "#222",
                      color: done ? "#0f0" : "#888",
                    }}
                  >
                    {done ? "[X]" : "[ ]"} {ORDER_STATUS_LABELS[status]}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      {normalized === "awaiting_payment" ? (
        <p style={{ background: "#440044", padding: 8, border: "2px dotted #ff0" }}>
          <b>Payment instructions:</b> {PAYMENT_INSTRUCTIONS}
        </p>
      ) : null}

      {order.estimatedReadyTime &&
      !isCancelled &&
      normalized !== "order_queued" &&
      normalized !== "completed" ? (
        <p style={{ background: "#330033", padding: 8, border: "2px ridge #f0f" }}>
          <b>Estimated ready time:</b> {order.estimatedReadyTime}
        </p>
      ) : null}

      {normalized === "awaiting_pickup" && order.pickupLocation ? (
        <p style={{ background: "#003300", padding: 8, border: "2px ridge #0f0" }}>
          <b>Pickup location:</b> {order.pickupLocation}
        </p>
      ) : null}

      <p>
        <b>Fulfillment:</b>{" "}
        {order.fulfillmentType === "delivery"
          ? `Delivery to ${order.deliveryX}, ${order.deliveryY}, ${order.deliveryZ} (${order.deliveryDimension})`
          : order.pickupLocation
            ? `Pickup at ${order.pickupLocation}`
            : "Pickup — location will be sent when your order is ready"}
      </p>

      <table width="100%" cellPadding={6} style={retroTableBorder}>
        <tbody>
          {order.items.map((item) => (
            <tr key={item.id}>
              <td style={{ backgroundColor: "#0a0a44" }}>
                {item.name}{" "}
                <MinecraftQuantityLabel total={item.quantity} />
                <br />
                <span style={{ fontSize: 12 }}>
                  {formatListingPrice(listingPrice(item), currency)}
                </span>
              </td>
            </tr>
          ))}
          <tr>
            <td align="right">
              Subtotal: {itemsSubtotal} {currency}
            </td>
          </tr>
          {order.deliveryFee > 0 ? (
            <tr>
              <td align="right">
                Delivery fee: {order.deliveryFee} {currency}
              </td>
            </tr>
          ) : null}
          <tr>
            <td align="right">
              <b>
                Total: {order.total} {currency}
              </b>
            </td>
          </tr>
        </tbody>
      </table>

      {isOwner && canCancelOrder(order.status) ? (
        <p style={{ textAlign: "center", marginTop: 16 }}>
          {cancelError ? (
            <span style={{ color: "#f00", display: "block", marginBottom: 8 }}>
              {cancelError}
            </span>
          ) : null}
          <button
            type="button"
            style={{
              ...retroBtnStyle,
              background: "#f66",
              color: "#200",
            }}
            disabled={cancelling}
            onClick={() => void handleCancel()}
          >
            {cancelling ? "[ CANCELLING... ]" : "[ CANCEL ORDER ]"}
          </button>
        </p>
      ) : null}
    </>
  );
}
