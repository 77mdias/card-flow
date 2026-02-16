import { z } from "zod";

export const resendVerificationEmailInputSchema = z.object({
  intent: z.literal("resend_verification_email"),
});

export const publicResendVerificationEmailInputSchema = z.object({
  intent: z.literal("public_resend_verification_email"),
  email: z.string().email(),
  returnTo: z.string().optional(),
});

export type ResendVerificationEmailInput = z.infer<typeof resendVerificationEmailInputSchema>;
export type PublicResendVerificationEmailInput = z.infer<typeof publicResendVerificationEmailInputSchema>;
