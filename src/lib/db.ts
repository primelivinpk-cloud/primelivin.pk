import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";
import { env } from "./env";

// Turso / libSQL client. Reads credentials from .env at runtime on the server.
function createDb() {
  const url = env.TURSO_DATABASE_URL ?? process.env.TURSO_DATABASE_URL;
  const authToken = env.TURSO_AUTH_TOKEN ?? process.env.TURSO_AUTH_TOKEN;

  if (!url) {
    throw new Error(
      "TURSO_DATABASE_URL is not set. Add it to your .env file."
    );
  }

  const client = createClient({
    url,
    authToken,
  });

  return drizzle(client, { schema });
}

// Cache the client across hot reloads in dev so we don't leak connections.
const globalForDb = globalThis as unknown as { __db?: ReturnType<typeof createDb> };

export const db = globalForDb.__db ?? createDb();
if (process.env.NODE_ENV !== "production") {
  globalForDb.__db = db;
}

export { schema };
export type Db = typeof db;
