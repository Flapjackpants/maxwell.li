import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/require-user";
import { db } from "@/lib/db";
import { listings, orderItems } from "@/lib/db/schema";
import {
  getDescendantSuggestions,
  type DescendantCascadeAction,
} from "@/lib/shop/listing-descendants";
import { getSuggestedPriceForListing } from "@/lib/shop/crafting-suggestions";
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
    maxPurchaseQuantity: row.maxPurchaseQuantity,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

const ACTIONS = new Set<DescendantCascadeAction>(["reprice", "offsale", "delete"]);

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await params;
  const listingId = Number(id);
  if (!Number.isFinite(listingId)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const action = new URL(request.url).searchParams.get("action");
  if (!action || !ACTIONS.has(action as DescendantCascadeAction)) {
    return NextResponse.json(
      { error: "action must be reprice, offsale, or delete" },
      { status: 400 },
    );
  }

  const rows = await db.select().from(listings).orderBy(listings.name);
  const catalog = rows.map(mapListing);

  if (!catalog.some((listing) => listing.id === listingId)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const suggestions = getDescendantSuggestions(
    listingId,
    catalog,
    action as DescendantCascadeAction,
  );

  const source = catalog.find((listing) => listing.id === listingId);

  return NextResponse.json({
    action,
    sourceListingId: listingId,
    sourceName: source?.name ?? "",
    suggestions,
  });
}

const batchSchema = z.object({
  action: z.enum(["reprice", "offsale", "delete"]),
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

  const { action, listingIds } = parsed.data;
  const rows = await db.select().from(listings);
  const catalog = rows.map(mapListing);
  const byId = new Map(catalog.map((listing) => [listing.id, listing]));
  const updated: number[] = [];

  if (action === "reprice") {
    for (const listingId of listingIds) {
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

      if (result[0]) updated.push(result[0].id);
    }
  } else if (action === "offsale") {
    for (const listingId of listingIds) {
      const result = await db
        .update(listings)
        .set({ inStock: false, updatedAt: new Date() })
        .where(eq(listings.id, listingId))
        .returning({ id: listings.id });
      if (result[0]) updated.push(result[0].id);
    }
  } else {
    for (const listingId of listingIds) {
      const deleted = await db.transaction(async (tx) => {
        await tx
          .update(orderItems)
          .set({ listingId: null })
          .where(eq(orderItems.listingId, listingId));

        return tx
          .delete(listings)
          .where(eq(listings.id, listingId))
          .returning({ id: listings.id });
      });
      if (deleted[0]) updated.push(deleted[0].id);
    }
  }

  return NextResponse.json({ action, updated });
}
