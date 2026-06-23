import {
  ORDER_STATUS_LABELS,
  getKanbanColumns,
  normalizeOrderStatus,
  type OrderStatus,
} from "@/lib/shop/order-status";
import { PAYMENT_INSTRUCTIONS } from "@/lib/shop/constants";
import { lineTotalForQuantity } from "@/lib/shop/pricing";
import { retroTableBorder } from "@/lib/retro-theme";
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
  total: number;
  dmFailed: boolean;
  buyerUsername: string;
  items: OrderItem[];
};

type Props = {
  order: OrderView;
  currency: string;
};

export function OrderStatusPanel({ order, currency }: Props) {
  const columns = getKanbanColumns();
  const normalized = normalizeOrderStatus(order.status);
  const currentIdx = columns.indexOf(normalized);

  return (
    <>
      {order.dmFailed ? (
        <p style={{ color: "#ff6600", fontWeight: "bold" }}>
          We could not DM you on Discord. Check this page for updates!
        </p>
      ) : null}

      <p>
        <b>Status:</b>{" "}
        {ORDER_STATUS_LABELS[normalized as OrderStatus] ?? order.status}
      </p>

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

      {normalized === "awaiting_payment" ? (
        <p style={{ background: "#440044", padding: 8, border: "2px dotted #ff0" }}>
          <b>Payment instructions:</b> {PAYMENT_INSTRUCTIONS}
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
              </td>
              <td align="right">
                {lineTotalForQuantity(item.quantity, item.price)} {currency}
              </td>
            </tr>
          ))}
          {order.deliveryFee > 0 ? (
            <tr>
              <td>Delivery fee</td>
              <td align="right">
                {order.deliveryFee} {currency}
              </td>
            </tr>
          ) : null}
          <tr>
            <td>
              <b>Total</b>
            </td>
            <td align="right">
              <b>
                {order.total} {currency}
              </b>
            </td>
          </tr>
        </tbody>
      </table>
    </>
  );
}
