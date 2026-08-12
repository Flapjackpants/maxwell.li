import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/require-user";
import { getModules } from "@/lib/dashboard/modules/registry";
import {
  clearQueueCookie,
  providerNeedsConnect,
  startProviderChain,
} from "@/lib/dashboard/oauth/flow";
import {
  getGoogleAuthorizeUrl,
  getSlackAuthorizeUrl,
} from "@/lib/dashboard/oauth/providers";
import { signOAuthQueue } from "@/lib/dashboard/oauth/queue";
import { getDashboardSettings } from "@/lib/dashboard/settings";
import { deleteProviderToken } from "@/lib/dashboard/tokens";
import type { AuthProvider } from "@/lib/dashboard/types";

export const dynamic = "force-dynamic";

const startSchema = z.object({
  mode: z.enum(["all", "provider"]),
  provider: z.enum(["google", "slack", "discord", "canvas"]).optional(),
  returnTo: z.string().default("/dashboard/settings"),
});

export async function POST(request: Request) {
  const { error, session } = await requireAdmin();
  if (error) return error;

  const body = await request.json().catch(() => ({}));
  const parsed = startSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const { mode, provider, returnTo } = parsed.data;
  let remaining: Exclude<AuthProvider, "none">[] = [];

  if (mode === "provider") {
    if (!provider) {
      return NextResponse.json(
        { error: "provider required" },
        { status: 400 },
      );
    }
    remaining = [provider];
  } else {
    const settings = await getDashboardSettings(session!.userId);
    const enabledIds = Object.entries(settings)
      .filter(([, v]) => v.enabled)
      .map(([id]) => id);
    const needed = new Set<Exclude<AuthProvider, "none">>();
    for (const id of enabledIds) {
      const mod = getModules().find((m) => m.id === id);
      if (!mod || mod.authProvider === "none") continue;
      if (await providerNeedsConnect(session!.userId, mod.authProvider)) {
        needed.add(mod.authProvider);
      }
    }
    // Stable order: google → slack → discord → canvas
    for (const p of ["google", "slack", "discord", "canvas"] as const) {
      if (needed.has(p)) remaining.push(p);
    }
  }

  if (remaining.length === 0) {
    return NextResponse.json({ redirectUrl: returnTo, nothingToConnect: true });
  }

  // Single-provider shortcuts that aren't canvas
  if (remaining.length === 1 && remaining[0] === "google") {
    const state = await signOAuthQueue({
      userId: session!.userId,
      remaining,
      returnTo,
    });
    const redirectUrl = getGoogleAuthorizeUrl(state);
    const res = NextResponse.json({ redirectUrl });
    res.headers.append(
      "Set-Cookie",
      `dashboard_oauth_queue=${state}; Path=/; HttpOnly; SameSite=Lax; Max-Age=1800${
        process.env.NODE_ENV === "production" ? "; Secure" : ""
      }`,
    );
    return res;
  }

  if (remaining.length === 1 && remaining[0] === "slack") {
    const state = await signOAuthQueue({
      userId: session!.userId,
      remaining,
      returnTo,
    });
    const redirectUrl = getSlackAuthorizeUrl(state);
    const res = NextResponse.json({ redirectUrl });
    res.headers.append(
      "Set-Cookie",
      `dashboard_oauth_queue=${state}; Path=/; HttpOnly; SameSite=Lax; Max-Age=1800${
        process.env.NODE_ENV === "production" ? "; Secure" : ""
      }`,
    );
    return res;
  }

  const chain = await startProviderChain({
    userId: session!.userId,
    remaining,
    returnTo,
  });

  const res = NextResponse.json({
    redirectUrl: chain.redirectUrl,
    nothingToConnect: false,
  });
  if (chain.setCookie) res.headers.append("Set-Cookie", chain.setCookie);
  if (chain.clearCookie) res.headers.append("Set-Cookie", clearQueueCookie());
  return res;
}

const deleteSchema = z.object({
  provider: z.enum(["google", "slack", "canvas"]),
});

export async function DELETE(request: Request) {
  const { error, session } = await requireAdmin();
  if (error) return error;

  const body = await request.json().catch(() => ({}));
  const parsed = deleteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  await deleteProviderToken(session!.userId, parsed.data.provider);
  return NextResponse.json({ ok: true });
}
