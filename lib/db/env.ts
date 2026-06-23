import fs from "fs";
import path from "path";

/** Load .env files without overriding variables already set by the host. */
export function loadEnvFiles(root: string) {
  const nodeEnv = process.env.NODE_ENV ?? "development";
  const files = [
    ".env",
    `.env.${nodeEnv}`,
    ".env.local",
    `.env.${nodeEnv}.local`,
  ];

  for (const file of files) {
    const filePath = path.join(root, file);
    if (!fs.existsSync(filePath)) continue;

    for (const line of fs.readFileSync(filePath, "utf8").split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;

      const separator = trimmed.indexOf("=");
      if (separator === -1) continue;

      const key = trimmed.slice(0, separator).trim();
      let value = trimmed.slice(separator + 1).trim();

      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }

      if (process.env[key] === undefined) {
        process.env[key] = value;
      }
    }
  }
}

export function getDatabaseUrl(): string | undefined {
  return process.env.DATABASE_URL ?? process.env.TURSO_DATABASE_URL;
}

export function getDatabaseAuthToken(): string | undefined {
  return process.env.DATABASE_AUTH_TOKEN ?? process.env.TURSO_AUTH_TOKEN;
}

export function describeDatabaseConfig(): string {
  const url = getDatabaseUrl();
  if (!url) {
    return [
      "DATABASE_URL is not set.",
      "For Turso in production, set these in your hosting provider (not file:local.db):",
      "  DATABASE_URL=libsql://your-database.turso.io",
      "  DATABASE_AUTH_TOKEN=your-turso-token",
      "Turso also accepts TURSO_DATABASE_URL and TURSO_AUTH_TOKEN.",
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
