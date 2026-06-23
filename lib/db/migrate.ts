import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { migrate } from "drizzle-orm/libsql/migrator";
import path from "path";
import {
  describeDatabaseConfig,
  getDatabaseAuthToken,
  getDatabaseUrl,
} from "./env";

let migrationPromise: Promise<void> | null = null;

export async function runMigrations(): Promise<void> {
  if (process.env.SKIP_DB_MIGRATE === "1") return;

  if (!migrationPromise) {
    migrationPromise = (async () => {
      const configWarning = describeDatabaseConfig();
      if (configWarning) {
        throw new Error(configWarning);
      }

      const url = getDatabaseUrl()!;
      const client = createClient({
        url,
        authToken: getDatabaseAuthToken(),
      });
      const db = drizzle(client);
      const migrationsFolder = path.join(process.cwd(), "lib/db/migrations");

      console.log("[db] Running migrations from", migrationsFolder);
      await migrate(db, { migrationsFolder });
      console.log("[db] Migrations complete");
    })().catch((err) => {
      migrationPromise = null;
      throw err;
    });
  }

  await migrationPromise;
}
