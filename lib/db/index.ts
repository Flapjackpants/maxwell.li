import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";
import { getDatabaseAuthToken, getDatabaseUrl } from "./env";

function createDb() {
  const url = getDatabaseUrl() ?? "file:local.db";

  const client = createClient({
    url,
    authToken: getDatabaseAuthToken(),
  });

  return drizzle(client, { schema });
}

export const db = createDb();
export type Db = typeof db;
