export const ORDER_STATUSES = [
  "pending_payment",
  "paid",
  "gathering_materials",
  "ready",
  "awaiting_pickup",
  "out_for_delivery",
  "completed",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export type FulfillmentType = "pickup" | "delivery";

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending_payment: "Pending Payment",
  paid: "Paid",
  gathering_materials: "Gathering Materials",
  ready: "Ready",
  awaiting_pickup: "Awaiting Pickup",
  out_for_delivery: "Out for Delivery",
  completed: "Completed",
};

const PICKUP_TRANSITIONS: Partial<Record<OrderStatus, OrderStatus>> = {
  pending_payment: "paid",
  paid: "gathering_materials",
  gathering_materials: "ready",
  ready: "awaiting_pickup",
  awaiting_pickup: "completed",
};

const DELIVERY_TRANSITIONS: Partial<Record<OrderStatus, OrderStatus>> = {
  pending_payment: "paid",
  paid: "gathering_materials",
  gathering_materials: "ready",
  ready: "out_for_delivery",
  out_for_delivery: "completed",
};

export function getNextStatus(
  current: OrderStatus,
  fulfillmentType: FulfillmentType,
): OrderStatus | null {
  const map =
    fulfillmentType === "pickup" ? PICKUP_TRANSITIONS : DELIVERY_TRANSITIONS;
  return map[current] ?? null;
}

export function isValidStatus(value: string): value is OrderStatus {
  return ORDER_STATUSES.includes(value as OrderStatus);
}

/** Kanban column order for admin board */
export function getKanbanColumns(fulfillmentType?: FulfillmentType): OrderStatus[] {
  const base: OrderStatus[] = [
    "pending_payment",
    "paid",
    "gathering_materials",
    "ready",
  ];
  if (fulfillmentType === "pickup") {
    return [...base, "awaiting_pickup", "completed"];
  }
  if (fulfillmentType === "delivery") {
    return [...base, "out_for_delivery", "completed"];
  }
  return [...base, "awaiting_pickup", "out_for_delivery", "completed"];
}
