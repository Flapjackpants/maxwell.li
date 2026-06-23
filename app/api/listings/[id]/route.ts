import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/require-user";
import { db } from "@/lib/db";
import { listings, orderItems } from "@/lib/db/schema";

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

const updateSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).optional(),
  price: z.number().int().min(0).optional(),
  imageUrl: z.string().max(2000).optional(),
  inStock: z.boolean().optional(),
});

export async function PATCH(
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

  const body = await request.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const updated = await db
    .update(listings)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(eq(listings.id, listingId))
    .returning();

  if (!updated[0]) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(mapListing(updated[0]));
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await params;
  const listingId = Number(id);
  if (!Number.isFinite(listingId)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  try {
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

    if (!deleted[0]) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Failed to delete listing:", err);
    return NextResponse.json(
      {
        error:
          "Could not delete listing. Run database migrations if this persists.",
      },
      { status: 500 },
    );
  }
}
