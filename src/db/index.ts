import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { env } from "@/env";
import * as schema from "./schema";

// Cache the pool on globalThis so Next's dev hot-reload doesn't leak connections.
const globalForDb = globalThis as unknown as { __blobgenPool?: Pool };

const pool =
  globalForDb.__blobgenPool ??
  new Pool({ connectionString: env.DATABASE_URL, max: 10 });

if (env.NODE_ENV !== "production") globalForDb.__blobgenPool = pool;

export const db = drizzle(pool, { schema });
export { schema };
export type DB = typeof db;
