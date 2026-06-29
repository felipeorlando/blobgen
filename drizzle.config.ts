import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/db/schema/index.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    // Default matches docker-compose; `bun run` injects .env.local if present.
    url:
      process.env.DATABASE_URL ??
      "postgres://blobgen:blobgen@localhost:5432/blobgen",
  },
});
