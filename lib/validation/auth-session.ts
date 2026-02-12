import { z } from "zod";

export const authSessionUserSchema = z.object({
  sub: z.string().min(1),
  email: z.string().email(),
  email_verified: z.boolean().optional().default(false),
});

export type AuthSessionUser = z.infer<typeof authSessionUserSchema>;
