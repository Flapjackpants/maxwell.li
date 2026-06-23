import { ITEMS_PER_STACK } from "@/lib/shop/minecraft-quantity";

/** Listing `price` is currency per full stack (64 items). */
export function lineTotalForQuantity(
  quantity: number,
  pricePerStack: number,
): number {
  if (quantity <= 0 || pricePerStack <= 0) return 0;
  return Math.ceil((quantity * pricePerStack) / ITEMS_PER_STACK);
}

export function sumLineTotals(
  items: { quantity: number; pricePerStack: number }[],
): number {
  return items.reduce(
    (sum, item) => sum + lineTotalForQuantity(item.quantity, item.pricePerStack),
    0,
  );
}
