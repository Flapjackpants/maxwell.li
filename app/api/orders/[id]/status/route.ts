import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/require-user";
import { db } from "@/lib/db";
import { listings, orderItems, orders, users } from "@/lib/db/schema";
import { sendOrderStatusDm } from "@/lib/discord/dm";
import {
  getNextStatus,
  isValidStatus,
  type FulfillmentType,
  type OrderStatus,
} from "@/lib/shop/order-status";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await params;
  const body = await request.json();
  const parsed = z
    .object({ action: z.enum(["advance", "set"]), status: z.string().optional() })
    .safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const orderRows = await db
    .select({
      order: orders,
      discordId: users.discordId,
    })
    .from(orders)
    .innerJoin(users, eq(orders.userId, users.id))
    .where(eq(orders.id, id))
    .limit(1);

  const row = orderRows[0];
  if (!row) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { order, discordId } = row;
  const fulfillmentType = order.fulfillmentType as FulfillmentType;
  let newStatus: OrderStatus | null;

  if (parsed.data.action === "advance") {
    newStatus = getNextStatus(order.status as OrderStatus, fulfillmentType);
    if (!newStatus) {
      return NextResponse.json({ error: "No next status" }, { status: 400 });
    }
  } else {
    if (!parsed.data.status || !isValidStatus(parsed.data.status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }
    newStatus = parsed.data.status;
  }

  const previousStatus = order.status as OrderStatus;

  // Decrement stock when moving to paid
  if (previousStatus === "pending_payment" && newStatus === "paid") {
    const items = await db
      .select()
      .from(orderItems)
      .where(eq(orderItems.orderId, id));

    for (const item of items) {
      const listingRows = await db
        .select()
        .from(listings)
        .where(eq(listings.id, item.listingId))
        .limit(1);
      const listing = listingRows[0];
      if (!listing?.inStock) {
        return NextResponse.json(
          { error: `${item.name} is no longer in stock` },
          { status: 400 },
        );
      }
    }
  }

  await db
    .update(orders)
    .set({ status: newStatus, updatedAt: new Date() })
    .where(eq(orders.id, id));

  if (newStatus !== previousStatus) {
    const dmResult = await sendOrderStatusDm(discordId, id, newStatus);
    if (!dmResult.ok) {
      console.warn("DM failed for order", id, dmResult.reason);
      await db
        .update(orders)
        .set({ dmFailed: true })
        .where(eq(orders.id, id));
    }
  }

  return NextResponse.json({ id, status: newStatus });
}
