"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ORDER_STATUS_LABELS,
  getKanbanColumns,
  type FulfillmentType,
} from "@/lib/shop/order-status";
import { retroBtnStyle, retroLinkStyle } from "@/lib/retro-theme";
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
  total: number;
  buyerUsername: string;
  items: OrderItem[];
};

type SummaryRow = {
  name: string;
  totalQuantity: number;
};

export default function AdminOrdersPage() {
  const [tab, setTab] = useState<"kanban" | "summary">("kanban");
  const [orders, setOrders] = useState<OrderCard[]>([]);
  const [summary, setSummary] = useState<SummaryRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void (async () => {
      const [ordersRes, summaryRes] = await Promise.all([
        fetch("/api/orders"),
        fetch("/api/orders/summary"),
      ]);
      if (ordersRes.ok) setOrders(await ordersRes.json());
      if (summaryRes.ok) setSummary(await summaryRes.json());
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

  async function advanceOrder(orderId: string) {
    const res = await fetch(`/api/orders/${orderId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "advance" }),
    });
    if (res.ok) await refresh();
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
            const columnOrders = orders.filter((o) => o.status === status);
            return (
              <div key={status} className={styles.column}>
                <h3 className={styles.columnTitle}>
                  {ORDER_STATUS_LABELS[status]}
                  <span className={styles.count}>({columnOrders.length})</span>
                </h3>
                {columnOrders.map((order) => (
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
                    ) : (
                      <p style={{ fontSize: 11 }}>{order.pickupLocation}</p>
                    )}
                    <p style={{ fontSize: 11 }}>
                      Total: {order.total} | #
                      <Link
                        href={`/shop/orders/${order.id}`}
                        style={retroLinkStyle}
                      >
                        {order.id.slice(0, 8)}
                      </Link>
                    </p>
                    {status !== "completed" ? (
                      <button
                        type="button"
                        style={retroBtnStyle}
                        onClick={() => advanceOrder(order.id)}
                      >
                        [ ADVANCE ]
                      </button>
                    ) : null}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
