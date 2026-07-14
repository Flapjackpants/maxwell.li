export const ORDER_STATUSES = [
  "order_queued",
  "gathering_materials",
  "awaiting_pickup",
  "awaiting_payment",
  "completed",
  "cancelled",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export type FulfillmentType = "pickup" | "delivery";

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  order_queued: "Order Queued",
  gathering_materials: "Gathering Materials",
  awaiting_pickup: "Awaiting Pickup",
  awaiting_payment: "Awaiting Payment",
  completed: "Completed",
  cancelled: "Cancelled",
};

const STATUS_TRANSITIONS: Partial<Record<OrderStatus, OrderStatus>> = {
  order_queued: "gathering_materials",
  gathering_materials: "awaiting_pickup",
  awaiting_pickup: "awaiting_payment",
  awaiting_payment: "completed",
};

export function getNextStatus(current: OrderStatus): OrderStatus | null {
  return STATUS_TRANSITIONS[current] ?? null;
}

export function isValidStatus(value: string): value is OrderStatus {
  return ORDER_STATUSES.includes(value as OrderStatus);
}

/** Active fulfillment pipeline (excludes cancelled). */
export function getProgressColumns(): OrderStatus[] {
  return [
    "order_queued",
    "gathering_materials",
    "awaiting_pickup",
    "awaiting_payment",
    "completed",
  ];
}

/** Kanban column order for admin board */
export function getKanbanColumns(): OrderStatus[] {
  return [...getProgressColumns(), "cancelled"];
}

/** Buyer may cancel until the order is completed or already cancelled. */
export function canCancelOrder(status: string): boolean {
  const normalized = normalizeOrderStatus(status);
  return normalized !== "completed" && normalized !== "cancelled";
}

/** Map legacy statuses from earlier versions for admin display */
export function normalizeOrderStatus(status: string): OrderStatus {
  if (isValidStatus(status)) return status;
  const legacy: Record<string, OrderStatus> = {
    pending_payment: "gathering_materials",
    paid: "gathering_materials",
    ready: "awaiting_pickup",
    out_for_delivery: "awaiting_pickup",
  };
  return legacy[status] ?? "gathering_materials";
}
