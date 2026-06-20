import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/require-user";
import { db } from "@/lib/db";
import { listings } from "@/lib/db/schema";

function mapListing(row: typeof listings.$inferSelect) {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    price: row.price,
    imageUrl: row.imageUrl,
    inStock: row.inStock,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export async function GET() {
  const rows = await db.select().from(listings).orderBy(listings.name);
  return NextResponse.json(rows.map(mapListing));
}

const createSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  price: z.number().int().min(0),
  imageUrl: z.string().max(500).optional(),
  inStock: z.boolean().optional(),
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
      imageUrl: parsed.data.imageUrl ?? "",
      inStock: parsed.data.inStock ?? true,
      updatedAt: new Date(),
    })
    .returning();

  return NextResponse.json(mapListing(inserted[0]!), { status: 201 });
}
