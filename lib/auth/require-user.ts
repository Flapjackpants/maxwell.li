import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { getSession, type SessionPayload } from "./session";

function unauthorized() {
  return {
    error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    session: null as SessionPayload | null,
  };
}

function forbidden() {
  return {
    error: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    session: null as SessionPayload | null,
  };
}

/** Prefer env ADMIN_DISCORD_ID (trimmed) over a stale JWT claim. */
export function isConfiguredAdmin(discordId: string): boolean {
  const adminDiscordId = process.env.ADMIN_DISCORD_ID?.trim();
  return Boolean(adminDiscordId && adminDiscordId === discordId);
}

/**
 * Resolve admin from DB (+ env fallback), not only the JWT claim.
 * Keeps is_admin sticky in the DB when the env id matches.
 */
export async function resolveAdminSession(
  session: SessionPayload,
): Promise<SessionPayload> {
  const configuredAdmin = isConfiguredAdmin(session.discordId);

  const row = await db
    .select({ isAdmin: users.isAdmin })
    .from(users)
    .where(eq(users.id, session.userId))
    .limit(1);

  let isAdmin = row[0]?.isAdmin === true || configuredAdmin;

  if (configuredAdmin && row[0] && !row[0].isAdmin) {
    await db
      .update(users)
      .set({ isAdmin: true })
      .where(eq(users.id, session.userId));
    isAdmin = true;
  }

  return { ...session, isAdmin };
}

export async function requireUser() {
  const session = await getSession();
  if (!session) return unauthorized();
  return { error: null, session };
}

export async function requireAdmin() {
  const session = await getSession();
  if (!session) return unauthorized();

  const resolved = await resolveAdminSession(session);
  if (!resolved.isAdmin) return forbidden();

  return { error: null, session: resolved };
}
