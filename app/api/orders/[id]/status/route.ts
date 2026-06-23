import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/require-user";
import { db } from "@/lib/db";
import { orders, users } from "@/lib/db/schema";
import { sendOrderStatusDm } from "@/lib/discord/dm";
import {
  getNextStatus,
  isValidStatus,
  normalizeOrderStatus,
  type OrderStatus,
} from "@/lib/shop/order-status";

const patchSchema = z.object({
  action: z.enum(["advance", "set"]),
  status: z.string().optional(),
  pickupLocation: z.string().min(1).max(500).optional(),
  estimatedReadyTime: z.string().min(1).max(200).optional(),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await params;
  const body = await request.json();
  const parsed = patchSchema.safeParse(body);

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
  let newStatus: OrderStatus | null;

  const currentStatus = isValidStatus(order.status)
    ? (order.status as OrderStatus)
    : normalizeOrderStatus(order.status);

  if (parsed.data.action === "advance") {
    newStatus = getNextStatus(currentStatus);
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

  if (currentStatus === "order_queued" && newStatus === "gathering_materials") {
    const estimatedReadyTime = parsed.data.estimatedReadyTime?.trim();
    if (!estimatedReadyTime) {
      return NextResponse.json(
        {
          error:
            "Estimated ready time is required when advancing from order queued",
        },
        { status: 400 },
      );
    }

    await db
      .update(orders)
      .set({
        status: newStatus,
        estimatedReadyTime,
        updatedAt: new Date(),
      })
      .where(eq(orders.id, id));

    const dmResult = await sendOrderStatusDm(discordId, id, newStatus, {
      estimatedReadyTime,
    });
    if (!dmResult.ok) {
      console.warn("DM failed for order", id, dmResult.reason);
      await db
        .update(orders)
        .set({ dmFailed: true })
        .where(eq(orders.id, id));
    }

    return NextResponse.json({
      id,
      status: newStatus,
      estimatedReadyTime,
    });
  }

  if (newStatus === "awaiting_pickup") {
    const location = parsed.data.pickupLocation?.trim();
    if (!location) {
      return NextResponse.json(
        { error: "Pickup location is required when advancing to awaiting pickup" },
        { status: 400 },
      );
    }

    await db
      .update(orders)
      .set({
        status: newStatus,
        pickupLocation: location,
        updatedAt: new Date(),
      })
      .where(eq(orders.id, id));

    const dmResult = await sendOrderStatusDm(discordId, id, newStatus, {
      pickupLocation: location,
    });
    if (!dmResult.ok) {
      console.warn("DM failed for order", id, dmResult.reason);
      await db
        .update(orders)
        .set({ dmFailed: true })
        .where(eq(orders.id, id));
    }

    return NextResponse.json({ id, status: newStatus, pickupLocation: location });
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
