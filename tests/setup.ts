import { vi } from "vitest";

vi.mock("server-only", () => ({}));

Object.assign(process.env, {
  NODE_ENV: "test",
  APP_BASE_URL: process.env.APP_BASE_URL ?? "http://localhost:3000",
  BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET ?? "0123456789abcdef0123456789abcdef",
  DATABASE_URL: process.env.DATABASE_URL ?? "postgresql://postgres:postgres@localhost:5432/cardflow_test",
});
