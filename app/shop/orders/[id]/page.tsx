import { eq } from "drizzle-orm";
import { notFound, redirect } from "next/navigation";
import { RetroShell } from "../../components/RetroShell";
import { OrderStatusPanel } from "../../components/OrderStatusPanel";
import { resolveAdminSession } from "@/lib/auth/require-user";
import { getSession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { orderItems, orders, users } from "@/lib/db/schema";
import { getCurrency, type MinecraftDimension } from "@/lib/shop/constants";
import type { OrderItem } from "@/lib/shop/types";

async function getOrder(id: string, userId: number, isAdmin: boolean) {
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

  if (!rows[0]) return null;
  if (!isAdmin && rows[0].order.userId !== userId) return null;

  const { order, buyerUsername } = rows[0];
  const items: OrderItem[] = rows
    .filter((r) => r.item)
    .map((r) => ({
      id: r.item!.id,
      orderId: r.item!.orderId,
      listingId: r.item!.listingId,
      name: r.item!.name,
      price: r.item!.price,
      priceUnit: r.item!.priceUnit as OrderItem["priceUnit"],
      pricePerCount: r.item!.pricePerCount,
      quantity: r.item!.quantity,
    }));

  return {
    id: order.id,
    userId: order.userId,
    status: order.status,
    fulfillmentType: order.fulfillmentType as "pickup" | "delivery",
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

export default async function OrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) {
    redirect(`/api/auth/discord?returnTo=${encodeURIComponent(`/shop/orders/${(await params).id}`)}`);
  }

  const { id } = await params;
  const resolved = await resolveAdminSession(session);
  const order = await getOrder(id, resolved.userId, resolved.isAdmin);

  if (!order) notFound();

  const isOwner = order.userId === resolved.userId;

  return (
    <RetroShell
      title="ORDER STATUS"
      subtitle={`Order #${order.id.slice(0, 8)}`}
      showAudio={false}
    >
      <OrderStatusPanel
        order={order}
        currency={getCurrency()}
        isOwner={isOwner}
        isAdmin={resolved.isAdmin}
      />
    </RetroShell>
  );
}
