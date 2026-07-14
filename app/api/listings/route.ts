import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/require-user";
import { db } from "@/lib/db";
import { listings } from "@/lib/db/schema";
import { PRICE_UNITS } from "@/lib/shop/pricing";

function mapListing(row: typeof listings.$inferSelect) {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    price: row.price,
    priceUnit: row.priceUnit,
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
  const rows = await db.select().from(listings).orderBy(listings.name);
  return NextResponse.json(rows.map(mapListing));
}

const priceFields = {
  price: z.number().int().min(0),
  priceUnit: z.enum(PRICE_UNITS),
  pricePerCount: z.number().int().min(1).max(1_000_000),
};

const createSchema = z
  .object({
    name: z.string().min(1).max(200),
    description: z.string().max(2000).optional(),
    ...priceFields,
    imageUrl: z.string().max(2000).optional(),
    inStock: z.boolean().optional(),
    specialOffer: z.boolean().optional(),
    maxPurchaseQuantity: z.number().int().min(1).max(1_000_000_000).nullable(),
  })
  .superRefine((data, ctx) => {
    if (data.maxPurchaseQuantity !== null && data.maxPurchaseQuantity < 1) {
      ctx.addIssue({
        code: "custom",
        message: "Capped quantity must be at least 1",
        path: ["maxPurchaseQuantity"],
      });
    }
  });

export async function POST(request: Request) {
  const { error } = await requireAdmin();
  if (error) return error;

  const body = await request.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const inserted = await db
    .insert(listings)
    .values({
      name: parsed.data.name,
      description: parsed.data.description ?? "",
      price: parsed.data.price,
      priceUnit: parsed.data.priceUnit,
      pricePerCount: parsed.data.pricePerCount,
      imageUrl: parsed.data.imageUrl ?? "",
      inStock: parsed.data.inStock ?? true,
      specialOffer: parsed.data.specialOffer ?? false,
      maxPurchaseQuantity: parsed.data.maxPurchaseQuantity ?? null,
      updatedAt: new Date(),
    })
    .returning();

  return NextResponse.json(mapListing(inserted[0]!), { status: 201 });
}
