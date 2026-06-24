/**
 * Server-only, zod-validated environment.
 *
 * IMPORTANT: never import this from a `"use client"` component — it reads
 * secrets. It lives outside `src/server/` only so standalone scripts (seed,
 * worker) and the Drizzle CLI can import it too. Bun and Next both auto-load
 * `.env` / `.env.local`, so `process.env` is populated in every context.
 *
 * The schema DEFAULTS everything needed to boot locally (DB/redis URLs match
 * docker-compose), so the app runs with no `.env` at all. Integration keys are
 * optional and only enforced when a provider is actually invoked
 * (`requireEnv` throws `ProviderNotConfigured`).
 */
import { z } from "zod";

const boolish = (def: boolean) =>
  z
    .string()
    .optional()
    .transform((v) => (v == null || v === "" ? def : v === "true" || v === "1"));

const EnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),

  DATABASE_URL: z
    .string()
    .default("postgres://blobgen:blobgen@localhost:5432/blobgen"),

  AUTH_SECRET: z.string().optional(),
  AUTH_DEV_LOGIN: boolish(true),
  AUTH_GOOGLE_ID: z.string().optional(),
  AUTH_GOOGLE_SECRET: z.string().optional(),

  OPENROUTER_API_KEY: z.string().optional(),
  OPENROUTER_MODEL: z.string().default("anthropic/claude-3.5-sonnet"),

  SEARCH_PROVIDER: z.enum(["tavily", "exa"]).default("tavily"),
  TAVILY_API_KEY: z.string().optional(),
  EXA_API_KEY: z.string().optional(),

  YOUTUBE_API_KEY: z.string().optional(),
  REPLICATE_API_TOKEN: z.string().optional(),
  REPLICATE_TTS_MODEL: z.string().optional(),
  REPLICATE_IMAGE_MODEL: z.string().optional(),
  PEXELS_API_KEY: z.string().optional(),

  JOB_DRIVER: z.enum(["inprocess", "bullmq"]).default("inprocess"),
  REDIS_URL: z.string().default("redis://localhost:6379"),

  STORAGE_DRIVER: z.enum(["fs", "s3"]).default("fs"),
  STORAGE_DIR: z.string().default("./.storage"),

  STARTING_CREDITS: z.coerce.number().int().positive().default(500),
});

export type Env = z.infer<typeof EnvSchema>;

function load(): Env {
  const parsed = EnvSchema.safeParse(process.env);
  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((i) => `  - ${i.path.join(".") || "(root)"}: ${i.message}`)
      .join("\n");
    throw new Error(`Invalid environment configuration:\n${issues}`);
  }
  return parsed.data;
}

export const env = load();

/** Thrown when a provider is used but its key/config is absent. */
export class ProviderNotConfigured extends Error {
  constructor(provider: string, envVar: string) {
    super(
      `${provider} is not configured — set ${envVar} in your .env.local to use it.`,
    );
    this.name = "ProviderNotConfigured";
  }
}

/** Read a required key or throw a typed, actionable error at call time. */
export function requireEnv(key: keyof Env, provider: string): string {
  const value = env[key];
  if (value == null || value === "") {
    throw new ProviderNotConfigured(provider, key);
  }
  return String(value);
}
