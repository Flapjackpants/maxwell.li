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
      "For Turso in production, set these as **runtime** variables on your hosting service:",
      "  DATABASE_URL=libsql://your-database.turso.io",
      "  DATABASE_AUTH_TOKEN=your-turso-token",
      "Turso also accepts TURSO_DATABASE_URL and TURSO_AUTH_TOKEN.",
      "On Railway: open your service → Variables → ensure scope includes Deploy/Runtime, then redeploy.",
    ].join("\n");
  }

  if (process.env.NODE_ENV === "production" && url.startsWith("file:")) {
    return [
      `DATABASE_URL is "${url}", which only works locally.`,
      "In production, use your Turso libsql URL instead:",
      "  DATABASE_URL=libsql://your-database.turso.io",
      "  DATABASE_AUTH_TOKEN=your-turso-token",
    ].join("\n");
  }

  return "";
}
