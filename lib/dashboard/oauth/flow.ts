import { appUrl } from "@/lib/app-url";
import {
  getGoogleAuthorizeUrl,
  getSlackAuthorizeUrl,
  refreshGoogleAccessToken,
} from "@/lib/dashboard/oauth/providers";
import {
  OAUTH_QUEUE_COOKIE,
  signOAuthQueue,
  type OAuthQueuePayload,
} from "@/lib/dashboard/oauth/queue";
import {
  getProviderToken,
  isDiscordBotConfigured,
  upsertProviderToken,
} from "@/lib/dashboard/tokens";
import type { AuthProvider } from "@/lib/dashboard/types";

export async function resolveAccessToken(
  userId: number,
  provider: AuthProvider,
): Promise<string | null> {
  if (provider === "none") return null;
  if (provider === "discord") {
    return process.env.DISCORD_BOT_TOKEN?.trim() ?? null;
  }

  const stored = await getProviderToken(userId, provider);
  if (!stored) return null;

  if (
    provider === "google" &&
    stored.refreshToken &&
    stored.expiresAt &&
    stored.expiresAt.getTime() < Date.now() + 60_000
  ) {
    try {
      const refreshed = await refreshGoogleAccessToken(stored.refreshToken);
      await upsertProviderToken(userId, "google", {
        accessToken: refreshed.accessToken,
        refreshToken: stored.refreshToken,
        expiresAt: refreshed.expiresAt,
        scopes: stored.scopes,
        meta: stored.meta,
      });
      return refreshed.accessToken;
    } catch {
      return stored.accessToken;
    }
  }

  return stored.accessToken;
}

export async function providerNeedsConnect(
  userId: number,
  provider: Exclude<AuthProvider, "none">,
): Promise<boolean> {
  if (provider === "discord") {
    return !isDiscordBotConfigured();
  }
  const token = await getProviderToken(userId, provider);
  return !token;
}

function queueCookie(state: string): string {
  return `${OAUTH_QUEUE_COOKIE}=${state}; Path=/; HttpOnly; SameSite=Lax; Max-Age=1800${
    process.env.NODE_ENV === "production" ? "; Secure" : ""
  }`;
}

export function clearQueueCookie(): string {
  return `${OAUTH_QUEUE_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${
    process.env.NODE_ENV === "production" ? "; Secure" : ""
  }`;
}

/** Start or continue an OAuth queue; returns the next URL to send the browser to. */
export async function startProviderChain(
  queue: OAuthQueuePayload,
): Promise<{ redirectUrl: string; setCookie?: string; clearCookie?: boolean }> {
  // Skip discord if bot already configured
  while (queue.remaining[0] === "discord") {
    if (!isDiscordBotConfigured()) {
      return {
        redirectUrl: appUrl(
          `/dashboard/settings?error=discord_bot_missing`,
        ).toString(),
        clearCookie: true,
      };
    }
    queue = { ...queue, remaining: queue.remaining.slice(1) };
  }

  if (queue.remaining.length === 0) {
    return {
      redirectUrl: appUrl(
        `${queue.returnTo}${queue.returnTo.includes("?") ? "&" : "?"}connected=1`,
      ).toString(),
      clearCookie: true,
    };
  }

  const next = queue.remaining[0]!;
  const state = await signOAuthQueue(queue);
  const setCookie = queueCookie(state);

  if (next === "google") {
    return { redirectUrl: getGoogleAuthorizeUrl(state), setCookie };
  }
  if (next === "slack") {
    return { redirectUrl: getSlackAuthorizeUrl(state), setCookie };
  }
  if (next === "canvas") {
    return {
      redirectUrl: appUrl("/dashboard/settings?connect=canvas&queue=1").toString(),
      setCookie,
    };
  }

  return {
    redirectUrl: appUrl(queue.returnTo).toString(),
    clearCookie: true,
  };
}

/** After a successful provider connect, advance to the next in the queue. */
export async function continueOAuthQueue(
  queue: OAuthQueuePayload,
): Promise<{ redirectUrl: string; setCookie?: string; clearCookie?: boolean }> {
  return startProviderChain({
    ...queue,
    remaining: queue.remaining.slice(1),
  });
}

export function settingsReturnPath(): string {
  return "/dashboard/settings";
}
