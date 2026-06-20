import { NextResponse } from "next/server";
import { getDiscordAuthorizeUrl } from "@/lib/auth/discord-oauth";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const returnTo = searchParams.get("returnTo") ?? "/shop";
  const state = Buffer.from(JSON.stringify({ returnTo })).toString("base64url");

  const url = getDiscordAuthorizeUrl(state);
  return NextResponse.redirect(url);
}
