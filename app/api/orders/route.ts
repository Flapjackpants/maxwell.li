import { desc, eq, inArray } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUser, resolveAdminSession } from "@/lib/auth/require-user";
import { db } from "@/lib/db";
import { listings, orderItems, orders, users } from "@/lib/db/schema";
import { calculateDeliveryFee } from "@/lib/shop/constants";
import { cartSubtotal, listingPrice } from "@/lib/shop/pricing";
import { exceedsPurchaseLimit } from "@/lib/shop/purchase-limit";
import type { MinecraftDimension } from "@/lib/shop/constants";

type OrderRow = {
  order: typeof orders.$inferSelect;
  buyerUsername: string;
  item: typeof orderItems.$inferSelect | null;
};

function mapOrderBundle(rows: OrderRow[]) {
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
      priceUnit: r.item!.priceUnit as "item" | "stack" | "chest",
      pricePerCount: r.item!.pricePerCount,
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
    estimatedReadyTime: order.estimatedReadyTime,
    total: order.total,
    dmFailed: order.dmFailed,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
    buyerUsername,
    items,
  };
}

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

  return mapOrderBundle(rows);
}

async function fetchAllOrders() {
  const rows = await db
    .select({
      order: orders,
      buyerUsername: users.username,
      item: orderItems,
    })
    .from(orders)
    .innerJoin(users, eq(orders.userId, users.id))
    .leftJoin(orderItems, eq(orderItems.orderId, orders.id))
    .orderBy(desc(orders.createdAt));

  const byId = new Map<string, NonNullable<ReturnType<typeof mapOrderBundle>>>();
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
        estimatedReadyTime: row.order.estimatedReadyTime,
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
        priceUnit: row.item.priceUnit as "item" | "stack" | "chest",
        pricePerCount: row.item.pricePerCount,
        quantity: row.item.quantity,
      });
    }
  }

  return [...byId.values()];
}

export async function GET() {
  const { error, session } = await requireUser();
  if (error) return error;

  // Use DB + env for admin, not only the JWT claim (which can be stale).
  const resolved = await resolveAdminSession(session!);
  if (resolved.isAdmin) {
    const all = await fetchAllOrders();
    return NextResponse.json(all);
  }

  const userOrders = await db
    .select({ id: orders.id })
    .from(orders)
    .where(eq(orders.userId, resolved.userId))
    .orderBy(desc(orders.createdAt));

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
    if (exceedsPurchaseLimit(listing, item.quantity)) {
      return NextResponse.json(
        {
          error: `${listing.name} exceeds the maximum purchase quantity per order`,
        },
        { status: 400 },
      );
    }
  }

  // Confirm buyer still exists so admin innerJoin never drops the order.
  const buyer = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.id, session!.userId))
    .limit(1);
  if (!buyer[0]) {
    return NextResponse.json(
      { error: "User account missing — please log in again" },
      { status: 401 },
    );
  }

  const subtotal = cartSubtotal(
    items.map((item) => {
      const listing = listingMap.get(item.listingId)!;
      return {
        quantity: item.quantity,
        price: listingPrice(listing),
      };
    }),
  );

  const deliveryFee =
    fulfillmentType === "delivery" ? calculateDeliveryFee(subtotal) : 0;
  const total = subtotal + deliveryFee;
  const orderId = crypto.randomUUID();

  try {
    await db.transaction(async (tx) => {
      await tx.insert(orders).values({
        id: orderId,
        userId: session!.userId,
        status: "order_queued",
        fulfillmentType,
        deliveryFee,
        deliveryX: fulfillmentType === "delivery" ? parsed.data.deliveryX! : null,
        deliveryY: fulfillmentType === "delivery" ? parsed.data.deliveryY! : null,
        deliveryZ: fulfillmentType === "delivery" ? parsed.data.deliveryZ! : null,
        deliveryDimension:
          fulfillmentType === "delivery" ? parsed.data.deliveryDimension! : null,
        pickupLocation: null,
        estimatedReadyTime: null,
        total,
        updatedAt: new Date(),
      });

      await tx.insert(orderItems).values(
        items.map((item) => {
          const listing = listingMap.get(item.listingId)!;
          return {
            orderId,
            listingId: item.listingId,
            name: listing.name,
            price: listing.price,
            priceUnit: listing.priceUnit,
            pricePerCount: listing.pricePerCount,
            quantity: item.quantity,
          };
        }),
      );
    });
  } catch (err) {
    console.error("Failed to create order:", err);
    return NextResponse.json(
      { error: "Could not save order. Please try again." },
      { status: 500 },
    );
  }

  const order = await fetchOrderWithDetails(orderId);
  if (!order || order.items.length === 0) {
    console.error("Order created but could not be loaded:", orderId);
    return NextResponse.json(
      { error: "Order was created but could not be loaded" },
      { status: 500 },
    );
  }

  return NextResponse.json(order, { status: 201 });
}
