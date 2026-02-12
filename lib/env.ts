import "server-only";

import { envSchema, type AppEnv } from "@/lib/validation/env";

const testDefaults: Partial<AppEnv> = {
  APP_BASE_URL: "http://localhost:3000",
  AUTH0_DOMAIN: "example.us.auth0.com",
  AUTH0_CLIENT_ID: "test-client-id",
  AUTH0_CLIENT_SECRET: "test-client-secret",
  AUTH0_SECRET: "0123456789abcdef0123456789abcdef",
  DATABASE_URL: "postgresql://postgres:postgres@localhost:5432/cardflow_test",
  DIRECT_URL: "postgresql://postgres:postgres@localhost:5432/cardflow_test",
};

const rawEnv = process.env.NODE_ENV === "test" ? { ...testDefaults, ...process.env } : process.env;
const parsedEnv = envSchema.safeParse(rawEnv);

if (!parsedEnv.success) {
  const details = parsedEnv.error.issues
    .map((issue) => `${issue.path.join(".") || "environment"}: ${issue.message}`)
    .join("; ");

  throw new Error(`Invalid environment configuration. ${details}`);
}

export const env = parsedEnv.data;
