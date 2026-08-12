import { SignJWT, jwtVerify } from "jose";
import type { AuthProvider } from "@/lib/dashboard/types";

const QUEUE_MAX_AGE = 60 * 30; // 30 minutes

export type OAuthQueuePayload = {
  userId: number;
  remaining: Exclude<AuthProvider, "none">[];
  returnTo: string;
};

function getSecret() {
  const secret =
    process.env.DASHBOARD_TOKEN_SECRET?.trim() ||
    process.env.SESSION_SECRET?.trim();
  if (!secret) throw new Error("SESSION_SECRET is not set");
  return new TextEncoder().encode(secret);
}

export async function signOAuthQueue(
  payload: OAuthQueuePayload,
): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${QUEUE_MAX_AGE}s`)
    .sign(getSecret());
}

export async function verifyOAuthQueue(
  token: string,
): Promise<OAuthQueuePayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    if (
      typeof payload.userId !== "number" ||
      !Array.isArray(payload.remaining) ||
      typeof payload.returnTo !== "string"
    ) {
      return null;
    }
    const remaining = payload.remaining.filter(
      (p): p is Exclude<AuthProvider, "none"> =>
        p === "google" ||
        p === "slack" ||
        p === "discord" ||
        p === "canvas",
    );
    return {
      userId: payload.userId,
      remaining,
      returnTo: payload.returnTo,
    };
  } catch {
    return null;
  }
}

export const OAUTH_QUEUE_COOKIE = "dashboard_oauth_queue";
