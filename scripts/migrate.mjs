import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { migrate } from "drizzle-orm/libsql/migrator";
import path from "path";
import { fileURLToPath } from "url";
import {
  describeDatabaseConfig,
  getDatabaseAuthToken,
  getDatabaseUrl,
  loadEnvFiles,
} from "./load-env.mjs";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
loadEnvFiles(root);

const url = getDatabaseUrl();
if (!url) {
  console.error(describeDatabaseConfig());
  process.exit(1);
}

const configWarning = describeDatabaseConfig();
if (configWarning) {
  console.error(configWarning);
  process.exit(1);
}

const client = createClient({
  url,
  authToken: getDatabaseAuthToken(),
});
const db = drizzle(client);
const migrationsFolder = path.join(root, "lib/db/migrations");

console.log("[db] Connecting to", url.replace(/\/\/.*@/, "//***@"));
console.log("[db] Running migrations from", migrationsFolder);
await migrate(db, { migrationsFolder });
console.log("[db] Migrations complete");
