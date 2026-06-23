import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { migrate } from "drizzle-orm/libsql/migrator";
import fs from "fs";
import path from "path";
import {
  describeDatabaseConfig,
  getDatabaseAuthToken,
  getDatabaseEnvDiagnostics,
  getDatabaseUrl,
  requiresAuthToken,
} from "./env";

export function resolveMigrationsFolder(): string {
  const candidates = [
    path.join(process.cwd(), "lib/db/migrations"),
    path.join(process.cwd(), "migrations"),
  ];

  for (const folder of candidates) {
    if (fs.existsSync(path.join(folder, "meta", "_journal.json"))) {
      return folder;
    }
  }

  throw new Error(
    `Migrations folder not found (cwd=${process.cwd()}). Expected lib/db/migrations.`,
  );
}

export async function runMigrations(): Promise<void> {
  if (process.env.SKIP_DB_MIGRATE === "1") {
    console.log("[db] SKIP_DB_MIGRATE=1, skipping migrations");
    return;
  }

  console.log("[db] env check:", getDatabaseEnvDiagnostics());

  const configError = describeDatabaseConfig();
  if (configError) {
    throw new Error(configError);
  }

  const url = getDatabaseUrl()!;
  if (requiresAuthToken(url) && !getDatabaseAuthToken()) {
    throw new Error(
      "DATABASE_AUTH_TOKEN is required for remote Turso databases (libsql://...).",
    );
  }

  const client = createClient({
    url,
    authToken: getDatabaseAuthToken(),
  });
  const db = drizzle(client);
  const migrationsFolder = resolveMigrationsFolder();

  console.log("[db] Connecting to", url.split("?")[0]);
  console.log("[db] Running migrations from", migrationsFolder);
  await migrate(db, { migrationsFolder });
  console.log("[db] Migrations complete");
}
