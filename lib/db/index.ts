import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";

function createDb() {
  const url = process.env.DATABASE_URL ?? "file:local.db";
  const authToken = process.env.DATABASE_AUTH_TOKEN;

  const client = createClient({
    url,
    authToken,
  });

  return drizzle(client, { schema });
}

export const db = createDb();
export type Db = typeof db;
