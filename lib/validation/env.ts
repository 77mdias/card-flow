import { z } from "zod";

export const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  APP_BASE_URL: z.string().url(),
  AUTH0_DOMAIN: z.string().min(1),
  AUTH0_CLIENT_ID: z.string().min(1),
  AUTH0_CLIENT_SECRET: z.string().min(1),
  AUTH0_SECRET: z.string().min(32),
  DATABASE_URL: z.string().url(),
  DIRECT_URL: z.string().url().optional(),
});

export type AppEnv = z.infer<typeof envSchema>;
