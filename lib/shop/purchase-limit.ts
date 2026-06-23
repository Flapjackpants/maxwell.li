import { formatQuantityBreakdown } from "@/lib/shop/minecraft-quantity";

export function getMaxPurchaseQuantity(listing: {
  maxPurchaseQuantity: number | null;
}): number | null {
  const max = listing.maxPurchaseQuantity;
  if (max === null || max < 1) return null;
  return max;
}

export function clampPurchaseQuantity(
  listing: { maxPurchaseQuantity: number | null },
  quantity: number,
): number {
  const max = getMaxPurchaseQuantity(listing);
  if (max === null) return Math.max(1, quantity);
  return Math.min(Math.max(1, quantity), max);
}

export function formatPurchaseLimit(listing: {
  maxPurchaseQuantity: number | null;
}): string | null {
  const max = getMaxPurchaseQuantity(listing);
  if (max === null) return null;
  return `Max ${formatQuantityBreakdown(max)} per order`;
}

export function exceedsPurchaseLimit(
  listing: { maxPurchaseQuantity: number | null },
  quantity: number,
): boolean {
  const max = getMaxPurchaseQuantity(listing);
  return max !== null && quantity > max;
}
