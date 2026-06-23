export const ORDER_STATUSES = [
  "order_queued",
  "gathering_materials",
  "awaiting_pickup",
  "awaiting_payment",
  "completed",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export type FulfillmentType = "pickup" | "delivery";

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  order_queued: "Order Queued",
  gathering_materials: "Gathering Materials",
  awaiting_pickup: "Awaiting Pickup",
  awaiting_payment: "Awaiting Payment",
  completed: "Completed",
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

/** Kanban column order for admin board */
export function getKanbanColumns(): OrderStatus[] {
  return [
    "order_queued",
    "gathering_materials",
    "awaiting_pickup",
    "awaiting_payment",
    "completed",
  ];
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
