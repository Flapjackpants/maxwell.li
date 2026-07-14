import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { requireUser, resolveAdminSession } from "@/lib/auth/require-user";
import { db } from "@/lib/db";
import { orderItems, orders, users } from "@/lib/db/schema";
import {
  sendAdminCancelledOrderDm,
  sendOrderStatusDm,
} from "@/lib/discord/dm";
import { getCurrency } from "@/lib/shop/constants";
import { canCancelOrder } from "@/lib/shop/order-status";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { error, session } = await requireUser();
  if (error) return error;

  const resolved = await resolveAdminSession(session!);
  const { id } = await params;

  const orderRows = await db
    .select({
      order: orders,
      buyerUsername: users.username,
      buyerDiscordId: users.discordId,
    })
    .from(orders)
    .innerJoin(users, eq(orders.userId, users.id))
    .where(eq(orders.id, id))
    .limit(1);

  const row = orderRows[0];
  if (!row) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const isBuyer = row.order.userId === resolved.userId;
  if (!isBuyer && !resolved.isAdmin) {
    return NextResponse.json(
      { error: "Only the buyer or an admin can cancel this order" },
      { status: 403 },
    );
  }

  if (!canCancelOrder(row.order.status)) {
    return NextResponse.json(
      { error: "This order can no longer be cancelled" },
      { status: 400 },
    );
  }

  await db
    .update(orders)
    .set({ status: "cancelled", updatedAt: new Date() })
    .where(eq(orders.id, id));

  const items = await db
    .select({
      name: orderItems.name,
      quantity: orderItems.quantity,
    })
    .from(orderItems)
    .where(eq(orderItems.orderId, id));

  const itemSummary =
    items.map((item) => `${item.name}×${item.quantity}`).join(", ") || "(no items)";

  const buyerDm = await sendOrderStatusDm(
    row.buyerDiscordId,
    id,
    "cancelled",
  );
  if (!buyerDm.ok) {
    console.warn("Buyer cancel DM failed for order", id, buyerDm.reason);
    await db
      .update(orders)
      .set({ dmFailed: true })
      .where(eq(orders.id, id));
  }

  const adminDm = await sendAdminCancelledOrderDm({
    orderId: id,
    buyerUsername: row.buyerUsername,
    total: row.order.total,
    currency: getCurrency(),
    fulfillmentType: row.order.fulfillmentType,
    itemSummary,
  });
  if (!adminDm.ok) {
    console.warn("Admin cancel DM failed for order", id, adminDm.reason);
  }

  return NextResponse.json({ id, status: "cancelled" });
}
