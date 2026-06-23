import fs from "fs";
import path from "path";

/** Load .env files without overriding variables already set by the host. */
export function loadEnvFiles(root) {
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

export function getDatabaseUrl() {
  const url =
    process.env.DATABASE_URL ?? process.env.TURSO_DATABASE_URL ?? "";
  const trimmed = url.trim();
  return trimmed || undefined;
}

export function getDatabaseAuthToken() {
  const token =
    process.env.DATABASE_AUTH_TOKEN ?? process.env.TURSO_AUTH_TOKEN ?? "";
  const normalized = token.replace(/\s+/g, "").trim();
  return normalized || undefined;
}

export function requiresAuthToken(url) {
  return (
    url.startsWith("libsql:") ||
    url.startsWith("https:") ||
    url.startsWith("http:")
  );
}

export function getDatabaseEnvDiagnostics() {
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

export function describeDatabaseConfig() {
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
