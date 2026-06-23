import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { migrate } from "drizzle-orm/libsql/migrator";
import path from "path";
import { fileURLToPath } from "url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const migrationsFolder = path.join(root, "lib/db/migrations");

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is not set");
  process.exit(1);
}

const client = createClient({
  url,
  authToken: process.env.DATABASE_AUTH_TOKEN,
});
const db = drizzle(client);

console.log("[db] Running migrations from", migrationsFolder);
await migrate(db, { migrationsFolder });
console.log("[db] Migrations complete");
