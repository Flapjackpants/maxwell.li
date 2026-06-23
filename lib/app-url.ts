/** Public site origin — use instead of request.url behind reverse proxies (Railway, etc.). */
export function getAppOrigin(): string {
  const configured = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (configured) return configured.replace(/\/$/, "");

  if (process.env.NODE_ENV === "production") {
    throw new Error("NEXT_PUBLIC_APP_URL is not set");
  }

  return "http://localhost:3000";
}

export function appUrl(path: string): URL {
  return new URL(path, getAppOrigin());
}

export function getDiscordRedirectUri(): string {
  const explicit = process.env.DISCORD_REDIRECT_URI?.trim();
  if (explicit) return explicit;
  return `${getAppOrigin()}/api/auth/discord-callback`;
}
