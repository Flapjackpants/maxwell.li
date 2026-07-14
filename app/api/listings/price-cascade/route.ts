import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/require-user";
import { db } from "@/lib/db";
import { listings } from "@/lib/db/schema";
import { getSuggestedPriceForListing } from "@/lib/shop/crafting-suggestions";
import {
  getCatalogCraftDepths,
  getCatalogLowerPriceSuggestions,
} from "@/lib/shop/listing-descendants";
import type { Listing } from "@/lib/shop/types";

function mapListing(row: typeof listings.$inferSelect): Listing {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    price: row.price,
    priceUnit: row.priceUnit as Listing["priceUnit"],
    pricePerCount: row.pricePerCount,
    imageUrl: row.imageUrl,
    inStock: row.inStock,
    specialOffer: row.specialOffer,
    maxPurchaseQuantity: row.maxPurchaseQuantity,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  const rows = await db.select().from(listings).orderBy(listings.name);
  const catalog = rows.map(mapListing);
  const suggestions = getCatalogLowerPriceSuggestions(catalog);

  return NextResponse.json({ suggestions });
}

const batchSchema = z.object({
  listingIds: z.array(z.number().int().positive()).min(1),
});

export async function POST(request: Request) {
  const { error } = await requireAdmin();
  if (error) return error;

  const body = await request.json();
  const parsed = batchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { listingIds } = parsed.data;
  const rows = await db.select().from(listings);
  let catalog = rows.map(mapListing);
  const byId = new Map(catalog.map((listing) => [listing.id, listing]));
  const depths = getCatalogCraftDepths(catalog);
  const orderedIds = [...listingIds].sort(
    (a, b) => (depths.get(a) ?? 999) - (depths.get(b) ?? 999),
  );

  const updated: number[] = [];

  for (const listingId of orderedIds) {
    const listing = byId.get(listingId);
    if (!listing) continue;
    const suggested = getSuggestedPriceForListing(listing, catalog);
    if (!suggested) continue;

    const result = await db
      .update(listings)
      .set({
        price: suggested.price,
        priceUnit: suggested.priceUnit,
        pricePerCount: suggested.pricePerCount,
        updatedAt: new Date(),
      })
      .where(eq(listings.id, listingId))
      .returning({ id: listings.id });

    if (result[0]) {
      updated.push(result[0].id);
      const nextListing: Listing = {
        ...listing,
        price: suggested.price,
        priceUnit: suggested.priceUnit,
        pricePerCount: suggested.pricePerCount,
        updatedAt: new Date(),
      };
      byId.set(listingId, nextListing);
      catalog = catalog.map((entry) =>
        entry.id === listingId ? nextListing : entry,
      );
    }
  }

  const freshRows = await db.select().from(listings).orderBy(listings.name);
  const remaining = getCatalogLowerPriceSuggestions(freshRows.map(mapListing))
    .length;

  return NextResponse.json({ updated, remaining });
}
