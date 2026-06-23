import {
  ITEMS_PER_CHEST,
  ITEMS_PER_STACK,
} from "@/lib/shop/minecraft-quantity";

export const PRICE_UNITS = ["item", "stack", "chest"] as const;
export type PriceUnit = (typeof PRICE_UNITS)[number];

export type ListingPrice = {
  amount: number;
  unit: PriceUnit;
  perCount: number;
};

export function listingPrice(listing: {
  price: number;
  priceUnit: string;
  pricePerCount: number;
}): ListingPrice {
  return {
    amount: listing.price,
    unit: listing.priceUnit as PriceUnit,
    perCount: listing.pricePerCount,
  };
}

/** Items covered by one price bundle (e.g. 3 stacks → 192 items). */
export function itemsPerPriceBundle(price: ListingPrice): number {
  const itemsPerUnit =
    price.unit === "item"
      ? 1
      : price.unit === "stack"
        ? ITEMS_PER_STACK
        : ITEMS_PER_CHEST;
  return price.perCount * itemsPerUnit;
}

/** Currency per item as an exact rational (numerator / denominator). */
export function currencyPerItemRate(price: ListingPrice): {
  numerator: number;
  denominator: number;
} {
  const bundleItems = itemsPerPriceBundle(price);
  if (bundleItems <= 0 || price.amount <= 0) {
    return { numerator: 0, denominator: 1 };
  }
  return { numerator: price.amount, denominator: bundleItems };
}

/** Unrounded line cost in currency (no ceil). */
export function unroundedLineCost(
  quantity: number,
  price: ListingPrice,
): number {
  if (quantity <= 0) return 0;
  const { numerator, denominator } = currencyPerItemRate(price);
  if (numerator <= 0) return 0;
  return (quantity * numerator) / denominator;
}

/** Sum unrounded line costs, then ceil once for the cart subtotal. */
export function cartSubtotal(
  lines: { quantity: number; price: ListingPrice }[],
): number {
  const total = lines.reduce(
    (sum, line) => sum + unroundedLineCost(line.quantity, line.price),
    0,
  );
  return Math.ceil(total);
}

function unitLabel(unit: PriceUnit, count: number): string {
  const singular = unit;
  return count === 1 ? singular : `${singular}s`;
}

export function formatListingPrice(
  price: ListingPrice,
  currency: string,
): string {
  const units = unitLabel(price.unit, price.perCount);
  if (price.perCount === 1) {
    return `${price.amount} ${currency} per ${units}`;
  }
  return `${price.amount} ${currency} per ${price.perCount} ${units}`;
}
