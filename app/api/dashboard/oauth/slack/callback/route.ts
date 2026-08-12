import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/require-user";
import { appUrl } from "@/lib/app-url";
import {
  clearQueueCookie,
  continueOAuthQueue,
} from "@/lib/dashboard/oauth/flow";
import { exchangeSlackCode } from "@/lib/dashboard/oauth/providers";
import { verifyOAuthQueue } from "@/lib/dashboard/oauth/queue";
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
      appUrl("/dashboard/settings?error=slack_oauth"),
    );
  }

  const queue = await verifyOAuthQueue(state);
  if (!queue || queue.userId !== session!.userId) {
    return NextResponse.redirect(
      appUrl("/dashboard/settings?error=invalid_state"),
    );
  }

  try {
    const tokens = await exchangeSlackCode(code);
    await upsertProviderToken(session!.userId, "slack", {
      accessToken: tokens.accessToken,
      scopes: tokens.scopes,
    });
  } catch {
    return NextResponse.redirect(
      appUrl("/dashboard/settings?error=slack_token"),
    );
  }

  const next = await continueOAuthQueue(queue);
  const res = NextResponse.redirect(next.redirectUrl);
  if (next.setCookie) res.headers.append("Set-Cookie", next.setCookie);
  if (next.clearCookie) res.headers.append("Set-Cookie", clearQueueCookie());
  return res;
}
