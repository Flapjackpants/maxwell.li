import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  discordAvatarUrl,
  exchangeDiscordCode,
  fetchDiscordGuilds,
  fetchDiscordUser,
} from "@/lib/auth/discord-oauth";
import { sessionCookieOptions, createSessionToken } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { getRequiredGuildId, isGuildMember } from "@/lib/discord/guild";
import { DISCORD_INVITE_URL } from "@/lib/shop/constants";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const stateRaw = searchParams.get("state");
  const oauthError = searchParams.get("error");

  let returnTo = "/shop";
  if (stateRaw) {
    try {
      const state = JSON.parse(
        Buffer.from(stateRaw, "base64url").toString("utf8"),
      ) as { returnTo?: string };
      if (state.returnTo?.startsWith("/")) returnTo = state.returnTo;
    } catch {
      /* ignore bad state */
    }
  }

  if (oauthError || !code) {
    return NextResponse.redirect(
      new URL(`/shop?error=discord_denied`, request.url),
    );
  }

  try {
    const accessToken = await exchangeDiscordCode(code);
    const [discordUser, guilds] = await Promise.all([
      fetchDiscordUser(accessToken),
      fetchDiscordGuilds(accessToken),
    ]);

    const guildId = getRequiredGuildId();
    if (!isGuildMember(guilds, guildId)) {
      return NextResponse.redirect(
        new URL(
          `/shop?error=not_in_guild&invite=${encodeURIComponent(DISCORD_INVITE_URL)}`,
          request.url,
        ),
      );
    }

    const adminDiscordId = process.env.ADMIN_DISCORD_ID;
    const isAdmin = adminDiscordId === discordUser.id;
    const avatarUrl = discordAvatarUrl(discordUser);

    const existing = await db
      .select()
      .from(users)
      .where(eq(users.discordId, discordUser.id))
      .limit(1);

    let userId: number;
    if (existing[0]) {
      userId = existing[0].id;
      await db
        .update(users)
        .set({
          username: discordUser.username,
          avatarUrl,
          isAdmin: isAdmin || existing[0].isAdmin,
        })
        .where(eq(users.id, userId));
    } else {
      const inserted = await db
        .insert(users)
        .values({
          discordId: discordUser.id,
          username: discordUser.username,
          avatarUrl,
          isAdmin,
        })
        .returning({ id: users.id });
      userId = inserted[0]!.id;
    }

    const token = await createSessionToken({
      userId,
      discordId: discordUser.id,
      username: discordUser.username,
      isAdmin: isAdmin || existing[0]?.isAdmin === true,
    });

    const cookieStore = await cookies();
    cookieStore.set(sessionCookieOptions(token));

    return NextResponse.redirect(new URL(returnTo, request.url));
  } catch (err) {
    console.error("Discord OAuth callback error:", err);
    return NextResponse.redirect(
      new URL(`/shop?error=auth_failed`, request.url),
    );
  }
}
