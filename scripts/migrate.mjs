import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { migrate } from "drizzle-orm/libsql/migrator";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

function env(name) {
  const value = process.env[name]?.trim();
  return value || undefined;
}

function getDatabaseUrl() {
  return env("DATABASE_URL") ?? env("TURSO_DATABASE_URL");
}

function getDatabaseAuthToken() {
  const token = env("DATABASE_AUTH_TOKEN") ?? env("TURSO_AUTH_TOKEN");
  if (!token) return undefined;
  return token.replace(/\s+/g, "");
}

function resolveMigrationsFolder() {
  const folder = path.join(root, "lib/db/migrations");
  if (fs.existsSync(path.join(folder, "meta", "_journal.json"))) {
    return folder;
  }
  throw new Error(`Migrations not found at ${folder}`);
}

const url = getDatabaseUrl();
if (!url) {
  console.error("[db] DATABASE_URL is not set");
  process.exit(1);
}

if (url.startsWith("libsql:") && !getDatabaseAuthToken()) {
  console.error("[db] DATABASE_AUTH_TOKEN is required for Turso");
  process.exit(1);
}

const migrationsFolder = resolveMigrationsFolder();
const client = createClient({ url, authToken: getDatabaseAuthToken() });
const db = drizzle(client);

console.log("[db] Running migrations...");
await migrate(db, { migrationsFolder });
console.log("[db] Migrations complete");
