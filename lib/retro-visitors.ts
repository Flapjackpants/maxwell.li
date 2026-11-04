import { eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { retroVisitorCount } from "@/lib/db/schema";

export async function getRetroVisitorCount(): Promise<number> {
  const rows = await db
    .select({ count: retroVisitorCount.count })
    .from(retroVisitorCount)
    .where(eq(retroVisitorCount.id, 1))
    .limit(1);
  return rows[0]?.count ?? 0;
}

export async function incrementRetroVisitorCount(): Promise<number> {
  const rows = await db
    .insert(retroVisitorCount)
    .values({ id: 1, count: 1 })
    .onConflictDoUpdate({
      target: retroVisitorCount.id,
      set: { count: sql`${retroVisitorCount.count} + 1` },
    })
    .returning({ count: retroVisitorCount.count });
  return rows[0].count;
}
