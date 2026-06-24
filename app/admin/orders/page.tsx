"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ORDER_STATUS_LABELS,
  getKanbanColumns,
  getNextStatus,
  normalizeOrderStatus,
  type FulfillmentType,
} from "@/lib/shop/order-status";
import {
  retroBtnStyle,
  retroFontFamily,
  retroInputStyle,
  retroLinkStyle,
} from "@/lib/retro-theme";
import type { OrderItem } from "@/lib/shop/types";
import styles from "./admin-orders.module.css";

type OrderCard = {
  id: string;
  status: string;
  fulfillmentType: FulfillmentType;
  deliveryX: number | null;
  deliveryY: number | null;
  deliveryZ: number | null;
  deliveryDimension: string | null;
  pickupLocation: string | null;
  estimatedReadyTime: string | null;
  total: number;
  buyerUsername: string;
  items: OrderItem[];
};

type SummaryRow = {
  name: string;
  totalQuantity: number;
};

type ShopConfig = {
  currency: string;
};

export default function AdminOrdersPage() {
  const [tab, setTab] = useState<"kanban" | "summary">("kanban");
  const [orders, setOrders] = useState<OrderCard[]>([]);
  const [summary, setSummary] = useState<SummaryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [currency, setCurrency] = useState("emeralds");
  const [pickupPromptOrderId, setPickupPromptOrderId] = useState<string | null>(
    null,
  );
  const [pickupLocationInput, setPickupLocationInput] = useState("");
  const [readyTimePromptOrderId, setReadyTimePromptOrderId] = useState<
    string | null
  >(null);
  const [estimatedReadyTimeInput, setEstimatedReadyTimeInput] = useState("");
  const [advanceError, setAdvanceError] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      const [ordersRes, summaryRes, configRes] = await Promise.all([
        fetch("/api/orders"),
        fetch("/api/orders/summary"),
        fetch("/api/shop/config"),
      ]);
      if (ordersRes.ok) setOrders(await ordersRes.json());
      if (summaryRes.ok) setSummary(await summaryRes.json());
      if (configRes.ok) {
        const config = (await configRes.json()) as ShopConfig;
        setCurrency(config.currency);
      }
      setLoading(false);
    })();
  }, []);

  async function refresh() {
    const [ordersRes, summaryRes] = await Promise.all([
      fetch("/api/orders"),
      fetch("/api/orders/summary"),
    ]);
    if (ordersRes.ok) setOrders(await ordersRes.json());
    if (summaryRes.ok) setSummary(await summaryRes.json());
  }

  function openAdvance(order: OrderCard) {
    setAdvanceError(null);
    const current = normalizeOrderStatus(order.status);
    const next = getNextStatus(current);
    if (current === "order_queued") {
      setReadyTimePromptOrderId(order.id);
      setEstimatedReadyTimeInput(order.estimatedReadyTime ?? "");
      return;
    }
    if (next === "awaiting_pickup") {
      setPickupPromptOrderId(order.id);
      setPickupLocationInput(order.pickupLocation ?? "");
      return;
    }
    void advanceOrder(order.id);
  }

  async function advanceOrder(
    orderId: string,
    options?: { pickupLocation?: string; estimatedReadyTime?: string },
  ) {
    setAdvanceError(null);
    const res = await fetch(`/api/orders/${orderId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "advance",
        ...(options?.pickupLocation
          ? { pickupLocation: options.pickupLocation }
          : {}),
        ...(options?.estimatedReadyTime
          ? { estimatedReadyTime: options.estimatedReadyTime }
          : {}),
      }),
    });
    if (!res.ok) {
      const data = await res.json();
      setAdvanceError(data.error ?? "Failed to advance order");
      return;
    }
    setPickupPromptOrderId(null);
    setPickupLocationInput("");
    setReadyTimePromptOrderId(null);
    setEstimatedReadyTimeInput("");
    await refresh();
  }

  const allColumns = getKanbanColumns();

  return (
    <>
      <p style={{ textAlign: "center" }}>
        <button
          type="button"
          style={{
            ...retroBtnStyle,
            opacity: tab === "kanban" ? 1 : 0.6,
          }}
          onClick={() => setTab("kanban")}
        >
          [ KANBAN ]
        </button>{" "}
        <button
          type="button"
          style={{
            ...retroBtnStyle,
            opacity: tab === "summary" ? 1 : 0.6,
          }}
          onClick={() => setTab("summary")}
        >
          [ MATERIALS SUMMARY ]
        </button>
      </p>

      {advanceError ? (
        <p style={{ color: "#f00", textAlign: "center" }}>{advanceError}</p>
      ) : null}

      {loading ? (
        <p>Loading...</p>
      ) : tab === "summary" ? (
        <div>
          <h2 style={{ color: "#00ffff" }}>Open order materials</h2>
          {summary.length === 0 ? (
            <p>No open orders.</p>
          ) : (
            <ul>
              {summary.map((row) => (
                <li key={row.name}>
                  <b>{row.totalQuantity}</b> {row.name}
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : (
        <div className={styles.board}>
          {allColumns.map((status) => {
            const columnOrders = orders.filter(
              (o) => normalizeOrderStatus(o.status) === status,
            );
            return (
              <div key={status} className={styles.column}>
                <h3 className={styles.columnTitle}>
                  {ORDER_STATUS_LABELS[status]}
                  <span className={styles.count}>({columnOrders.length})</span>
                </h3>
                {columnOrders.map((order) => {
                  const normalized = normalizeOrderStatus(order.status);
                  return (
                    <div key={order.id} className={styles.card}>
                      <p>
                        <b>{order.buyerUsername}</b>
                        <br />
                        <span
                          className={
                            order.fulfillmentType === "delivery"
                              ? styles.badgeDelivery
                              : styles.badgePickup
                          }
                        >
                          {order.fulfillmentType}
                        </span>
                      </p>
                      <ul style={{ fontSize: 12, margin: "4px 0" }}>
                        {order.items.map((item) => (
                          <li key={item.id}>
                            {item.name} x{item.quantity}
                          </li>
                        ))}
                      </ul>
                      {order.fulfillmentType === "delivery" ? (
                        <p style={{ fontSize: 11 }}>
                          {order.deliveryX}, {order.deliveryY}, {order.deliveryZ}{" "}
                          ({order.deliveryDimension})
                        </p>
                      ) : order.pickupLocation ? (
                        <p style={{ fontSize: 11 }}>Pickup: {order.pickupLocation}</p>
                      ) : order.estimatedReadyTime ? (
                        <p style={{ fontSize: 11 }}>
                          ETA: {order.estimatedReadyTime}
                        </p>
                      ) : null}
                      <p style={{ fontSize: 11 }}>
                        Total: {order.total} {currency} | #
                        <Link
                          href={`/shop/orders/${order.id}`}
                          style={retroLinkStyle}
                        >
                          {order.id.slice(0, 8)}
                        </Link>
                      </p>
                      {normalized !== "completed" ? (
                        <button
                          type="button"
                          style={retroBtnStyle}
                          onClick={() => openAdvance(order)}
                        >
                          [ ADVANCE ]
                        </button>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      )}

      {pickupPromptOrderId ? (
        <div
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
          onClick={() => setPickupPromptOrderId(null)}
        >
          <div
            style={{
              fontFamily: retroFontFamily,
              backgroundColor: "#000033",
              color: "#ffff00",
              border: "4px ridge #ff00ff",
              padding: 16,
              maxWidth: 400,
              width: "100%",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ color: "#ff00ff", marginTop: 0 }}>Pickup location</h3>
            <p style={{ fontSize: 13 }}>
              Where should the buyer pick up this order? (sent via Discord DM)
            </p>
            <input
              type="text"
              value={pickupLocationInput}
              onChange={(e) => setPickupLocationInput(e.target.value)}
              placeholder="e.g. locker 3"
              style={{ ...retroInputStyle, width: "100%", marginBottom: 12 }}
              autoFocus
            />
            <p style={{ margin: 0, textAlign: "center" }}>
              <button
                type="button"
                style={retroBtnStyle}
                onClick={() =>
                  void advanceOrder(pickupPromptOrderId, {
                    pickupLocation: pickupLocationInput.trim(),
                  })
                }
              >
                [ CONFIRM ADVANCE ]
              </button>{" "}
              <button
                type="button"
                style={retroBtnStyle}
                onClick={() => setPickupPromptOrderId(null)}
              >
                [ CANCEL ]
              </button>
            </p>
          </div>
        </div>
      ) : null}

      {readyTimePromptOrderId ? (
        <div
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
          onClick={() => setReadyTimePromptOrderId(null)}
        >
          <div
            style={{
              fontFamily: retroFontFamily,
              backgroundColor: "#000033",
              color: "#ffff00",
              border: "4px ridge #ff00ff",
              padding: 16,
              maxWidth: 400,
              width: "100%",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ color: "#ff00ff", marginTop: 0 }}>Estimated ready time</h3>
            <p style={{ fontSize: 13 }}>
              Sent to the buyer via Discord DM when you advance this order.
            </p>
            <input
              type="text"
              value={estimatedReadyTimeInput}
              onChange={(e) => setEstimatedReadyTimeInput(e.target.value)}
              placeholder="e.g. 12 hours"
              style={{ ...retroInputStyle, width: "100%", marginBottom: 12 }}
              autoFocus
            />
            <p style={{ margin: 0, textAlign: "center" }}>
              <button
                type="button"
                style={retroBtnStyle}
                onClick={() =>
                  void advanceOrder(readyTimePromptOrderId, {
                    estimatedReadyTime: estimatedReadyTimeInput.trim(),
                  })
                }
              >
                [ CONFIRM ADVANCE ]
              </button>{" "}
              <button
                type="button"
                style={retroBtnStyle}
                onClick={() => setReadyTimePromptOrderId(null)}
              >
                [ CANCEL ]
              </button>
            </p>
          </div>
        </div>
      ) : null}
    </>
  );
}
