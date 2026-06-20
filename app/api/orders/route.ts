import { eq, inArray } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/auth/require-user";
import { db } from "@/lib/db";
import { listings, orderItems, orders, users } from "@/lib/db/schema";
import { getDeliveryFee, getPickupLocation } from "@/lib/shop/constants";
import type { MinecraftDimension } from "@/lib/shop/constants";

async function fetchOrderWithDetails(orderId: string) {
  const rows = await db
    .select({
      order: orders,
      buyerUsername: users.username,
      item: orderItems,
    })
    .from(orders)
    .innerJoin(users, eq(orders.userId, users.id))
    .leftJoin(orderItems, eq(orderItems.orderId, orders.id))
    .where(eq(orders.id, orderId));

  if (!rows[0]) return null;

  const { order, buyerUsername } = rows[0];
  const items = rows
    .filter((r) => r.item)
    .map((r) => ({
      id: r.item!.id,
      orderId: r.item!.orderId,
      listingId: r.item!.listingId,
      name: r.item!.name,
      price: r.item!.price,
      quantity: r.item!.quantity,
    }));

  return {
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
    total: order.total,
    dmFailed: order.dmFailed,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
    buyerUsername,
    items,
  };
}

export async function GET() {
  const { error, session } = await requireUser();
  if (error) return error;

  if (session!.isAdmin) {
    const rows = await db
      .select({
        order: orders,
        buyerUsername: users.username,
        item: orderItems,
      })
      .from(orders)
      .innerJoin(users, eq(orders.userId, users.id))
      .leftJoin(orderItems, eq(orderItems.orderId, orders.id))
      .orderBy(orders.createdAt);

    const byId = new Map<string, Awaited<ReturnType<typeof fetchOrderWithDetails>>>();
    for (const row of rows) {
      if (!byId.has(row.order.id)) {
        byId.set(row.order.id, {
          id: row.order.id,
          userId: row.order.userId,
          status: row.order.status,
          fulfillmentType: row.order.fulfillmentType,
          deliveryFee: row.order.deliveryFee,
          deliveryX: row.order.deliveryX,
          deliveryY: row.order.deliveryY,
          deliveryZ: row.order.deliveryZ,
          deliveryDimension: row.order.deliveryDimension as MinecraftDimension | null,
          pickupLocation: row.order.pickupLocation,
          total: row.order.total,
          dmFailed: row.order.dmFailed,
          createdAt: row.order.createdAt,
          updatedAt: row.order.updatedAt,
          buyerUsername: row.buyerUsername,
          items: [],
        });
      }
      if (row.item) {
        byId.get(row.order.id)!.items.push({
          id: row.item.id,
          orderId: row.item.orderId,
          listingId: row.item.listingId,
          name: row.item.name,
          price: row.item.price,
          quantity: row.item.quantity,
        });
      }
    }
    return NextResponse.json([...byId.values()]);
  }

  const userOrders = await db
    .select({ id: orders.id })
    .from(orders)
    .where(eq(orders.userId, session!.userId))
    .orderBy(orders.createdAt);

  const detailed = await Promise.all(
    userOrders.map((o) => fetchOrderWithDetails(o.id)),
  );
  return NextResponse.json(detailed.filter(Boolean));
}

const createOrderSchema = z.object({
  items: z
    .array(
      z.object({
        listingId: z.number().int().positive(),
        quantity: z.number().int().positive(),
      }),
    )
    .min(1),
  fulfillmentType: z.enum(["pickup", "delivery"]),
  deliveryX: z.number().int().optional(),
  deliveryY: z.number().int().optional(),
  deliveryZ: z.number().int().optional(),
  deliveryDimension: z
    .enum(["overworld", "nether", "the_end"])
    .optional(),
});

export async function POST(request: Request) {
  const { error, session } = await requireUser();
  if (error) return error;

  const body = await request.json();
  const parsed = createOrderSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { items, fulfillmentType } = parsed.data;

  if (fulfillmentType === "delivery") {
    const { deliveryX, deliveryY, deliveryZ, deliveryDimension } = parsed.data;
    if (
      deliveryX === undefined ||
      deliveryY === undefined ||
      deliveryZ === undefined ||
      !deliveryDimension
    ) {
      return NextResponse.json(
        { error: "Delivery requires coordinates and dimension" },
        { status: 400 },
      );
    }
  }

  const listingIds = items.map((i) => i.listingId);
  const listingRows = await db
    .select()
    .from(listings)
    .where(inArray(listings.id, listingIds));

  if (listingRows.length !== listingIds.length) {
    return NextResponse.json({ error: "Invalid listing in cart" }, { status: 400 });
  }

  const listingMap = new Map(listingRows.map((l) => [l.id, l]));
  for (const item of items) {
    const listing = listingMap.get(item.listingId)!;
    if (!listing.inStock) {
      return NextResponse.json(
        { error: `${listing.name} is out of stock` },
        { status: 400 },
      );
    }
  }

  const subtotal = items.reduce((sum, item) => {
    const listing = listingMap.get(item.listingId)!;
    return sum + listing.price * item.quantity;
  }, 0);

  const deliveryFee = fulfillmentType === "delivery" ? getDeliveryFee() : 0;
  const total = subtotal + deliveryFee;
  const orderId = crypto.randomUUID();

  await db.insert(orders).values({
    id: orderId,
    userId: session!.userId,
    status: "pending_payment",
    fulfillmentType,
    deliveryFee,
    deliveryX: fulfillmentType === "delivery" ? parsed.data.deliveryX! : null,
    deliveryY: fulfillmentType === "delivery" ? parsed.data.deliveryY! : null,
    deliveryZ: fulfillmentType === "delivery" ? parsed.data.deliveryZ! : null,
    deliveryDimension:
      fulfillmentType === "delivery" ? parsed.data.deliveryDimension! : null,
    pickupLocation:
      fulfillmentType === "pickup" ? getPickupLocation() : null,
    total,
    updatedAt: new Date(),
  });

  await db.insert(orderItems).values(
    items.map((item) => {
      const listing = listingMap.get(item.listingId)!;
      return {
        orderId,
        listingId: item.listingId,
        name: listing.name,
        price: listing.price,
        quantity: item.quantity,
      };
    }),
  );

  const order = await fetchOrderWithDetails(orderId);
  return NextResponse.json(order, { status: 201 });
}
