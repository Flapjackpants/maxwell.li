import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { shopSettings } from "@/lib/db/schema";

export async function isStoreOpen(): Promise<boolean> {
  try {
    const rows = await db
      .select({ storeOpen: shopSettings.storeOpen })
      .from(shopSettings)
      .where(eq(shopSettings.id, 1))
      .limit(1);

    if (rows[0]) {
      return rows[0].storeOpen;
    }
    return true;
  } catch {
    return true;
  }
}

export async function setStoreOpen(open: boolean): Promise<boolean> {
  const now = new Date();
  const rows = await db
    .select({ id: shopSettings.id })
    .from(shopSettings)
    .where(eq(shopSettings.id, 1))
    .limit(1);

  if (rows[0]) {
    await db
      .update(shopSettings)
      .set({ storeOpen: open, updatedAt: now })
      .where(eq(shopSettings.id, 1));
  } else {
    await db.insert(shopSettings).values({
      id: 1,
      storeOpen: open,
      updatedAt: now,
    });
  }
  return open;
}
