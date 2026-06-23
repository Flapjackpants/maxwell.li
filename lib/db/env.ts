export function getDatabaseUrl(): string | undefined {
  const url =
    process.env.DATABASE_URL ?? process.env.TURSO_DATABASE_URL ?? "";
  const trimmed = url.trim();
  return trimmed || undefined;
}

/** Strip whitespace/newlines — common when pasting JWTs into hosting UIs. */
export function getDatabaseAuthToken(): string | undefined {
  const token =
    process.env.DATABASE_AUTH_TOKEN ?? process.env.TURSO_AUTH_TOKEN ?? "";
  const normalized = token.replace(/\s+/g, "").trim();
  return normalized || undefined;
}

export function requiresAuthToken(url: string): boolean {
  return url.startsWith("libsql:") || url.startsWith("https:") || url.startsWith("http:");
}

export function getDatabaseEnvDiagnostics(): string {
  const keys = [
    "DATABASE_URL",
    "TURSO_DATABASE_URL",
    "DATABASE_AUTH_TOKEN",
    "TURSO_AUTH_TOKEN",
  ];
  return keys
    .map((key) => `${key}=${process.env[key] ? "set" : "missing"}`)
    .join(", ");
}

export function describeDatabaseConfig(): string {
  const url = getDatabaseUrl();
  if (!url) {
    return [
      "DATABASE_URL is not set.",
      `Checked: ${getDatabaseEnvDiagnostics()}`,
      "Set these as runtime variables on your Railway service, then redeploy:",
      "  DATABASE_URL=libsql://your-database.turso.io",
      "  DATABASE_AUTH_TOKEN=your-turso-token",
    ].join("\n");
  }

  if (process.env.NODE_ENV === "production" && url.startsWith("file:")) {
    return [
      `DATABASE_URL is "${url}", which only works locally.`,
      "In production, use your Turso libsql URL instead.",
    ].join("\n");
  }

  return "";
}

export function getDatabaseConfigError(): string | null {
  const configError = describeDatabaseConfig();
  if (configError) return configError;

  const url = getDatabaseUrl()!;
  if (requiresAuthToken(url) && !getDatabaseAuthToken()) {
    return "DATABASE_AUTH_TOKEN is required for remote Turso databases.";
  }

  return null;
}
