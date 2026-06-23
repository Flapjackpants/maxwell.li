#!/usr/bin/env node
/**
 * Standalone migration runner for Railway preDeploy / local use.
 * Runs outside Next.js so it receives Railway env vars directly.
 */
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { migrate } from "drizzle-orm/libsql/migrator";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import {
  describeDatabaseConfig,
  getDatabaseAuthToken,
  getDatabaseEnvDiagnostics,
  getDatabaseUrl,
  loadEnvFiles,
  requiresAuthToken,
} from "./load-env.mjs";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
loadEnvFiles(root);

function resolveMigrationsFolder() {
  const candidates = [
    path.join(root, "lib/db/migrations"),
    path.join(process.cwd(), "lib/db/migrations"),
  ];

  for (const folder of candidates) {
    if (fs.existsSync(path.join(folder, "meta", "_journal.json"))) {
      return folder;
    }
  }

  throw new Error(
    `Migrations folder not found. cwd=${process.cwd()}, root=${root}`,
  );
}

async function main() {
  if (process.env.SKIP_DB_MIGRATE === "1") {
    console.log("[db] SKIP_DB_MIGRATE=1, skipping migrations");
    return;
  }

  console.log("[db] migrate.mjs starting");
  console.log("[db] cwd:", process.cwd());
  console.log("[db] env check:", getDatabaseEnvDiagnostics());

  const configError = describeDatabaseConfig();
  if (configError) {
    console.error(configError);
    process.exit(1);
  }

  const url = getDatabaseUrl();
  if (!url) {
    console.error("DATABASE_URL is not set after loading env files.");
    process.exit(1);
  }

  if (requiresAuthToken(url) && !getDatabaseAuthToken()) {
    console.error(
      "DATABASE_AUTH_TOKEN is required for remote Turso databases (libsql://...).",
    );
    process.exit(1);
  }

  const migrationsFolder = resolveMigrationsFolder();
  const client = createClient({
    url,
    authToken: getDatabaseAuthToken(),
  });
  const db = drizzle(client);

  console.log("[db] Connecting to", url.split("?")[0]);
  console.log("[db] Running migrations from", migrationsFolder);
  await migrate(db, { migrationsFolder });
  console.log("[db] Migrations complete");
}

main().catch((err) => {
  console.error("[db] Migration failed:", err);
  process.exit(1);
});
