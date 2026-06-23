import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/require-user";
import { db } from "@/lib/db";
import { orderItems, orders, users } from "@/lib/db/schema";
import type { MinecraftDimension } from "@/lib/shop/constants";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { error, session } = await requireUser();
  if (error) return error;

  const { id } = await params;

  const rows = await db
    .select({
      order: orders,
      buyerUsername: users.username,
      item: orderItems,
    })
    .from(orders)
    .innerJoin(users, eq(orders.userId, users.id))
    .leftJoin(orderItems, eq(orderItems.orderId, orders.id))
    .where(eq(orders.id, id));

  if (!rows[0]) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (!session!.isAdmin && rows[0].order.userId !== session!.userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { order, buyerUsername } = rows[0];
  const items = rows
    .filter((r) => r.item)
    .map((r) => ({
      id: r.item!.id,
      orderId: r.item!.orderId,
      listingId: r.item!.listingId,
      name: r.item!.name,
      price: r.item!.price,
      priceUnit: r.item!.priceUnit,
      pricePerCount: r.item!.pricePerCount,
      quantity: r.item!.quantity,
    }));

  return NextResponse.json({
    id: order.id,
    userId: order.userId,
    status: order.status,
    fulfillmentType: order.fulfillmentType,
    deliveryFee: order.deliveryFee,
    deliveryX: order.deliveryX,
    deliveryY: order.deliveryY,
    deliveryZ: order.deliveryZ,
    deliveryDimension: order.deliveryDimension as MinecraftDimension | null,
    pickupLocation: order.pickupLocation,
    estimatedReadyTime: order.estimatedReadyTime,
    total: order.total,
    dmFailed: order.dmFailed,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
    buyerUsername,
    items,
  });
}
