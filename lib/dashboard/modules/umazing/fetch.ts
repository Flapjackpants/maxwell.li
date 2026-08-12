import { desc, eq, inArray, notInArray } from "drizzle-orm";
import { db } from "@/lib/db";
import { orderItems, orders, users } from "@/lib/db/schema";

export type UmazingOrderRow = {
  id: string;
  status: string;
  buyerUsername: string;
  total: number;
  itemCount: number;
  createdAt: string | null;
};

export type UmazingOrdersPayload = {
  orders: UmazingOrderRow[];
  openCount: number;
};

const CLOSED_STATUSES = ["completed", "cancelled"] as const;

export async function fetchUmazingOrdersData(): Promise<UmazingOrdersPayload> {
  const recent = await db
    .select({
      id: orders.id,
      status: orders.status,
      total: orders.total,
      createdAt: orders.createdAt,
      buyerUsername: users.username,
    })
    .from(orders)
    .innerJoin(users, eq(orders.userId, users.id))
    .orderBy(desc(orders.createdAt))
    .limit(12);

  const openRows = await db
    .select({ id: orders.id })
    .from(orders)
    .where(notInArray(orders.status, [...CLOSED_STATUSES]));

  const ids = recent.map((r) => r.id);
  const itemRows =
    ids.length === 0
      ? []
      : await db
          .select({
            orderId: orderItems.orderId,
            quantity: orderItems.quantity,
          })
          .from(orderItems)
          .where(inArray(orderItems.orderId, ids));

  const countByOrder = new Map<string, number>();
  for (const row of itemRows) {
    countByOrder.set(
      row.orderId,
      (countByOrder.get(row.orderId) ?? 0) + row.quantity,
    );
  }

  return {
    openCount: openRows.length,
    orders: recent.map((r) => ({
      id: r.id,
      status: r.status,
      buyerUsername: r.buyerUsername,
      total: r.total,
      itemCount: countByOrder.get(r.id) ?? 0,
      createdAt:
        r.createdAt instanceof Date
          ? r.createdAt.toISOString()
          : r.createdAt
            ? String(r.createdAt)
            : null,
    })),
  };
}
