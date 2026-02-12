import { vi } from "vitest";

vi.mock("server-only", () => ({}));

Object.assign(process.env, {
  NODE_ENV: "test",
  APP_BASE_URL: process.env.APP_BASE_URL ?? "http://localhost:3000",
  AUTH0_DOMAIN: process.env.AUTH0_DOMAIN ?? "example.us.auth0.com",
  AUTH0_CLIENT_ID: process.env.AUTH0_CLIENT_ID ?? "test-client-id",
  AUTH0_CLIENT_SECRET: process.env.AUTH0_CLIENT_SECRET ?? "test-client-secret",
  AUTH0_SECRET: process.env.AUTH0_SECRET ?? "0123456789abcdef0123456789abcdef",
  DATABASE_URL: process.env.DATABASE_URL ?? "postgresql://postgres:postgres@localhost:5432/cardflow_test",
});
