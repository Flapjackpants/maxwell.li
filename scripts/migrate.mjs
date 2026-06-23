import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { migrate } from "drizzle-orm/libsql/migrator";
import { readMigrationFiles } from "drizzle-orm/migrator";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

/** Next.js loads .env.local automatically; standalone scripts do not. */
function loadEnvFiles() {
  for (const file of [".env.local", ".env"]) {
    const filePath = path.join(root, file);
    if (!fs.existsSync(filePath)) continue;
    for (const line of fs.readFileSync(filePath, "utf8").split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      let value = trimmed.slice(eq + 1).trim();
      const hash = value.indexOf(" #");
      if (hash !== -1) value = value.slice(0, hash).trim();
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

loadEnvFiles();

function env(name) {
  const value = process.env[name]?.trim();
  return value || undefined;
}

function getDatabaseUrl() {
  return env("DATABASE_URL") ?? env("TURSO_DATABASE_URL") ?? "file:local.db";
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

if (url.startsWith("libsql:") && !getDatabaseAuthToken()) {
  console.error("[db] DATABASE_AUTH_TOKEN is required for Turso");
  process.exit(1);
}

const migrationsFolder = resolveMigrationsFolder();
const client = createClient({ url, authToken: getDatabaseAuthToken() });
const db = drizzle(client);

/** Local DBs created via db:push may lack migration history. */
async function maybeBaselineLocalDb() {
  if (!url.startsWith("file:")) return;

  const tables = await client.execute(
    "SELECT name FROM sqlite_master WHERE type='table' AND name='listings'",
  );
  if (tables.rows.length === 0) return;

  const applied = await client.execute(
    "SELECT COUNT(*) AS count FROM __drizzle_migrations",
  );
  const count = Number(applied.rows[0]?.count ?? 0);
  if (count > 0) return;

  const migrations = readMigrationFiles({ migrationsFolder });
  for (const migration of migrations) {
    await client.execute({
      sql: 'INSERT INTO __drizzle_migrations ("hash", "created_at") VALUES (?, ?)',
      args: [migration.hash, migration.folderMillis],
    });
  }
  console.log("[db] Baslined existing local database with migration history");
}

console.log("[db] Running migrations...");
await maybeBaselineLocalDb();
await migrate(db, { migrationsFolder });
console.log("[db] Migrations complete");
