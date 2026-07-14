import { and, eq, ne, sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/require-user";
import { db } from "@/lib/db";
import { orderItems, orders } from "@/lib/db/schema";

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  const rows = await db
    .select({
      name: orderItems.name,
      totalQuantity: sql<number>`sum(${orderItems.quantity})`.mapWith(Number),
    })
    .from(orderItems)
    .innerJoin(orders, eq(orderItems.orderId, orders.id))
    .where(
      and(ne(orders.status, "completed"), ne(orders.status, "cancelled")),
    )
    .groupBy(orderItems.name)
    .orderBy(orderItems.name);

  return NextResponse.json(rows);
}
