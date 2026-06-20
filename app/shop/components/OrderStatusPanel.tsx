import {
  ORDER_STATUS_LABELS,
  getKanbanColumns,
  type OrderStatus,
} from "@/lib/shop/order-status";
import { PAYMENT_INSTRUCTIONS } from "@/lib/shop/constants";
import { retroTableBorder } from "@/lib/retro-theme";
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
  total: number;
  dmFailed: boolean;
  buyerUsername: string;
  items: OrderItem[];
};

export function OrderStatusPanel({ order }: { order: OrderView }) {
  const columns = getKanbanColumns(order.fulfillmentType);
  const currentIdx = columns.indexOf(order.status as OrderStatus);

  return (
    <>
      {order.dmFailed ? (
        <p style={{ color: "#ff6600", fontWeight: "bold" }}>
          We could not DM you on Discord — check this page for updates!!!
        </p>
      ) : null}

      <p>
        <b>Status:</b>{" "}
        {ORDER_STATUS_LABELS[order.status as OrderStatus] ?? order.status}
      </p>

      <table cellPadding={4} style={{ ...retroTableBorder, marginBottom: 12 }}>
        <tbody>
          {columns.map((status, idx) => {
            const done = idx <= currentIdx;
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

      {order.status === "pending_payment" ? (
        <p style={{ background: "#440044", padding: 8, border: "2px dotted #ff0" }}>
          <b>Payment instructions:</b> {PAYMENT_INSTRUCTIONS}
        </p>
      ) : null}

      <p>
        <b>Fulfillment:</b>{" "}
        {order.fulfillmentType === "pickup"
          ? `Pickup at ${order.pickupLocation}`
          : `Delivery to ${order.deliveryX}, ${order.deliveryY}, ${order.deliveryZ} (${order.deliveryDimension})`}
      </p>

      <table width="100%" cellPadding={6} style={retroTableBorder}>
        <tbody>
          {order.items.map((item) => (
            <tr key={item.id}>
              <td style={{ backgroundColor: "#0a0a44" }}>
                {item.name} x{item.quantity}
              </td>
              <td align="right">{item.price * item.quantity}</td>
            </tr>
          ))}
          {order.deliveryFee > 0 ? (
            <tr>
              <td>Delivery fee</td>
              <td align="right">{order.deliveryFee}</td>
            </tr>
          ) : null}
          <tr>
            <td>
              <b>Total</b>
            </td>
            <td align="right">
              <b>{order.total}</b>
            </td>
          </tr>
        </tbody>
      </table>
    </>
  );
}
