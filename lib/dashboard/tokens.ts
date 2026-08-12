import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { dashboardOauthTokens } from "@/lib/db/schema";
import { decryptSecret, encryptSecret } from "@/lib/dashboard/crypto";
import type { AuthProvider } from "@/lib/dashboard/types";

export type StoredToken = {
  accessToken: string;
  refreshToken: string | null;
  expiresAt: Date | null;
  scopes: string | null;
  meta: Record<string, string>;
};

function parseMeta(json: string): Record<string, string> {
  try {
    const raw = JSON.parse(json) as Record<string, unknown>;
    return Object.fromEntries(
      Object.entries(raw).map(([k, v]) => [k, String(v ?? "")]),
    );
  } catch {
    return {};
  }
}

export async function getProviderToken(
  userId: number,
  provider: AuthProvider,
): Promise<StoredToken | null> {
  if (provider === "none") return null;

  const rows = await db
    .select()
    .from(dashboardOauthTokens)
    .where(
      and(
        eq(dashboardOauthTokens.userId, userId),
        eq(dashboardOauthTokens.provider, provider),
      ),
    )
    .limit(1);

  const row = rows[0];
  if (!row) return null;

  return {
    accessToken: decryptSecret(row.accessTokenEnc),
    refreshToken: row.refreshTokenEnc
      ? decryptSecret(row.refreshTokenEnc)
      : null,
    expiresAt: row.expiresAt,
    scopes: row.scopes,
    meta: parseMeta(row.metaJson),
  };
}

export async function upsertProviderToken(
  userId: number,
  provider: Exclude<AuthProvider, "none">,
  data: {
    accessToken: string;
    refreshToken?: string | null;
    expiresAt?: Date | null;
    scopes?: string | null;
    meta?: Record<string, string>;
  },
): Promise<void> {
  const now = new Date();
  const accessTokenEnc = encryptSecret(data.accessToken);
  const refreshTokenEnc =
    data.refreshToken != null && data.refreshToken !== ""
      ? encryptSecret(data.refreshToken)
      : null;
  const metaJson = JSON.stringify(data.meta ?? {});

  const existing = await db
    .select({ id: dashboardOauthTokens.id })
    .from(dashboardOauthTokens)
    .where(
      and(
        eq(dashboardOauthTokens.userId, userId),
        eq(dashboardOauthTokens.provider, provider),
      ),
    )
    .limit(1);

  if (existing[0]) {
    await db
      .update(dashboardOauthTokens)
      .set({
        accessTokenEnc,
        refreshTokenEnc,
        expiresAt: data.expiresAt ?? null,
        scopes: data.scopes ?? null,
        metaJson,
        updatedAt: now,
      })
      .where(eq(dashboardOauthTokens.id, existing[0].id));
  } else {
    await db.insert(dashboardOauthTokens).values({
      userId,
      provider,
      accessTokenEnc,
      refreshTokenEnc,
      expiresAt: data.expiresAt ?? null,
      scopes: data.scopes ?? null,
      metaJson,
      updatedAt: now,
    });
  }
}

export async function deleteProviderToken(
  userId: number,
  provider: Exclude<AuthProvider, "none">,
): Promise<void> {
  await db
    .delete(dashboardOauthTokens)
    .where(
      and(
        eq(dashboardOauthTokens.userId, userId),
        eq(dashboardOauthTokens.provider, provider),
      ),
    );
}

export async function listConnectedProviders(
  userId: number,
): Promise<Exclude<AuthProvider, "none">[]> {
  const rows = await db
    .select({ provider: dashboardOauthTokens.provider })
    .from(dashboardOauthTokens)
    .where(eq(dashboardOauthTokens.userId, userId));

  return rows
    .map((r) => r.provider)
    .filter(
      (p): p is Exclude<AuthProvider, "none"> =>
        p === "google" || p === "slack" || p === "discord" || p === "canvas",
    );
}

/** Discord channels use bot token from env — considered connected when env is set. */
export function isDiscordBotConfigured(): boolean {
  return Boolean(process.env.DISCORD_BOT_TOKEN?.trim());
}
