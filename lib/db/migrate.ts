import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { migrate } from "drizzle-orm/libsql/migrator";
import path from "path";

let migrationPromise: Promise<void> | null = null;

export async function runMigrations(): Promise<void> {
  if (process.env.SKIP_DB_MIGRATE === "1") return;

  if (!migrationPromise) {
    migrationPromise = (async () => {
      const url = process.env.DATABASE_URL;
      if (!url) {
        throw new Error("DATABASE_URL is not set");
      }

      const client = createClient({
        url,
        authToken: process.env.DATABASE_AUTH_TOKEN,
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
