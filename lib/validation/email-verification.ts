import { z } from "zod";

export const resendVerificationEmailInputSchema = z.object({
  intent: z.literal("resend_verification_email"),
});

export type ResendVerificationEmailInput = z.infer<typeof resendVerificationEmailInputSchema>;
