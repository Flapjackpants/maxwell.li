import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/require-user";
import { db } from "@/lib/db";
import { orderItems, orders, users } from "@/lib/db/schema";
import { sendAdminCancelledOrderDm } from "@/lib/discord/dm";
import { getCurrency } from "@/lib/shop/constants";
import { canCancelOrder } from "@/lib/shop/order-status";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { error, session } = await requireUser();
  if (error) return error;

  const { id } = await params;

  const orderRows = await db
    .select({
      order: orders,
      buyerUsername: users.username,
    })
    .from(orders)
    .innerJoin(users, eq(orders.userId, users.id))
    .where(eq(orders.id, id))
    .limit(1);

  const row = orderRows[0];
  if (!row) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Only the buyer who placed the order may cancel it (not admins acting for them).
  if (row.order.userId !== session!.userId) {
    return NextResponse.json(
      { error: "Only the buyer can cancel this order" },
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

  const dmResult = await sendAdminCancelledOrderDm({
    orderId: id,
    buyerUsername: row.buyerUsername,
    total: row.order.total,
    currency: getCurrency(),
    fulfillmentType: row.order.fulfillmentType,
    itemSummary,
  });

  if (!dmResult.ok) {
    console.warn("Admin cancel DM failed for order", id, dmResult.reason);
  }

  return NextResponse.json({ id, status: "cancelled" });
}
