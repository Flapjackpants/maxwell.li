import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/require-user";
import { appUrl } from "@/lib/app-url";
import {
  clearQueueCookie,
  continueOAuthQueue,
} from "@/lib/dashboard/oauth/flow";
import { exchangeGoogleCode } from "@/lib/dashboard/oauth/providers";
import {
  OAUTH_QUEUE_COOKIE,
  verifyOAuthQueue,
} from "@/lib/dashboard/oauth/queue";
import { upsertProviderToken } from "@/lib/dashboard/tokens";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { error, session } = await requireAdmin();
  if (error) {
    return NextResponse.redirect(appUrl("/shop?error=admin_required"));
  }

  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const oauthError = searchParams.get("error");

  if (oauthError || !code || !state) {
    return NextResponse.redirect(
      appUrl("/dashboard/settings?error=google_oauth"),
    );
  }

  const queue = await verifyOAuthQueue(state);
  if (!queue || queue.userId !== session!.userId) {
    return NextResponse.redirect(
      appUrl("/dashboard/settings?error=invalid_state"),
    );
  }

  try {
    const tokens = await exchangeGoogleCode(code);
    await upsertProviderToken(session!.userId, "google", {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresAt: tokens.expiresAt,
      scopes: tokens.scopes,
    });
  } catch {
    return NextResponse.redirect(
      appUrl("/dashboard/settings?error=google_token"),
    );
  }

  const next = await continueOAuthQueue(queue);
  const res = NextResponse.redirect(next.redirectUrl);
  if (next.setCookie) res.headers.append("Set-Cookie", next.setCookie);
  if (next.clearCookie) res.headers.append("Set-Cookie", clearQueueCookie());

  // Also clear any leftover cookie from request
  const cookieStore = await cookies();
  if (cookieStore.get(OAUTH_QUEUE_COOKIE) && next.clearCookie) {
    // already cleared via header
  }

  return res;
}
