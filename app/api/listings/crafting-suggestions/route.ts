import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/require-user";
import { db } from "@/lib/db";
import { listings } from "@/lib/db/schema";
import { getCraftingSuggestions } from "@/lib/shop/crafting-suggestions";
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

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  const rows = await db.select().from(listings).orderBy(listings.name);
  const catalog = rows.map(mapListing);
  const suggestions = getCraftingSuggestions(catalog);

  return NextResponse.json({ suggestions });
}
