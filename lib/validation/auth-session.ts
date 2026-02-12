import { z } from "zod";

export const authSessionUserSchema = z
  .object({
    id: z.string().min(1).optional(),
    sub: z.string().min(1).optional(),
    email: z.string().email(),
    emailVerified: z.boolean().optional(),
    email_verified: z.boolean().optional().default(false),
  })
  .transform((input) => ({
    subject: input.id ?? input.sub ?? "",
    email: input.email,
    emailVerified: input.emailVerified ?? input.email_verified ?? false,
  }))
  .refine((input) => input.subject.length > 0, {
    message: "Missing subject",
    path: ["subject"],
  });

export type AuthSessionUser = z.infer<typeof authSessionUserSchema>;
