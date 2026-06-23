import { getMaxPurchaseQuantity } from "@/lib/shop/purchase-limit";
import type { CartItem, Listing } from "@/lib/shop/types";

export type LitematicaMaterialEntry = {
  name: string;
  missing: number;
};

export type MaterialListSkipReason = "not_listing" | "over_limit";

export type MaterialListSkipped = {
  name: string;
  requested: number;
  reason: MaterialListSkipReason;
  maxAllowed: number | null;
};

export type MaterialListImportResult = {
  updates: { listingId: number; quantity: number }[];
  skipped: MaterialListSkipped[];
};

function normalizeItemName(name: string): string {
  return name.trim().toLowerCase();
}

/** Parse a Litematica material list export (.txt). Uses the Missing column. */
export function parseLitematicaMaterialList(text: string): LitematicaMaterialEntry[] {
  const entries: LitematicaMaterialEntry[] = [];

  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed.startsWith("|") || trimmed.startsWith("+")) continue;

    const match = trimmed.match(
      /^\|\s*([^|]+?)\s*\|\s*(\d+)\s*\|\s*(\d+)\s*\|\s*(\d+)\s*\|$/,
    );
    if (!match) continue;

    const itemName = match[1]!.trim();
    if (normalizeItemName(itemName) === "item") continue;

    const missing = Number(match[3]);
    if (!Number.isFinite(missing) || missing <= 0) continue;

    entries.push({ name: itemName, missing });
  }

  return entries;
}

export function resolveMaterialListImport(
  entries: LitematicaMaterialEntry[],
  listings: Listing[],
  cartItems: CartItem[],
): MaterialListImportResult {
  const listingByName = new Map<string, Listing>();
  for (const listing of listings) {
    const key = normalizeItemName(listing.name);
    if (!listingByName.has(key)) listingByName.set(key, listing);
  }

  const cartByListingId = new Map(
    cartItems.map((item) => [item.listingId, item.quantity]),
  );

  const updates: { listingId: number; quantity: number }[] = [];
  const skipped: MaterialListSkipped[] = [];

  for (const entry of entries) {
    const listing = listingByName.get(normalizeItemName(entry.name));
    if (!listing) {
      skipped.push({
        name: entry.name,
        requested: entry.missing,
        reason: "not_listing",
        maxAllowed: null,
      });
      continue;
    }

    const existing = cartByListingId.get(listing.id) ?? 0;
    const targetQuantity = existing + entry.missing;
    const maxAllowed = getMaxPurchaseQuantity(listing);

    if (maxAllowed !== null && targetQuantity > maxAllowed) {
      skipped.push({
        name: entry.name,
        requested: entry.missing,
        reason: "over_limit",
        maxAllowed,
      });
      continue;
    }

    updates.push({ listingId: listing.id, quantity: targetQuantity });
    cartByListingId.set(listing.id, targetQuantity);
  }

  return { updates, skipped };
}
