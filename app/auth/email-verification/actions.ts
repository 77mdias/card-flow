"use server";

import type { ResendVerificationEmailActionState } from "@/lib/types/email-verification";
import { publicResendVerificationEmailInputSchema } from "@/lib/validation/email-verification";
import { logAuthEvent } from "@/server/observability/auth-events";
import { verificationEmailService } from "@/server/services/email-verification-service";

export async function publicResendVerificationEmailAction(
  _previousState: ResendVerificationEmailActionState,
  formData: FormData,
): Promise<ResendVerificationEmailActionState> {
  const startedAt = Date.now();
  const requestId = crypto.randomUUID();

  const parsedInput = publicResendVerificationEmailInputSchema.safeParse({
    intent: formData.get("intent"),
    email: String(formData.get("email") ?? "").trim().toLowerCase(),
    returnTo: String(formData.get("returnTo") ?? "").trim() || undefined,
  });

  if (!parsedInput.success) {
    const durationMs = Date.now() - startedAt;

    logAuthEvent({
      route: "/auth/email-verification",
      requestId,
      result: "failure",
      durationMs,
      reason: "INVALID_INPUT",
    });

    return {
      status: "error",
      code: "INVALID_INPUT",
      message: "Dados invalidos. Revise o email informado e tente novamente.",
    };
  }

  const resendResult = await verificationEmailService.sendVerificationEmailByEmail({
    email: parsedInput.data.email,
    returnTo: parsedInput.data.returnTo,
  });
  const durationMs = Date.now() - startedAt;

  if (!resendResult.ok) {
    logAuthEvent({
      route: "/auth/email-verification",
      requestId,
      result: "failure",
      durationMs,
      reason: resendResult.code,
    });

    return {
      status: "error",
      code: resendResult.code,
      message: resendResult.message,
    };
  }

  logAuthEvent({
    route: "/auth/email-verification",
    requestId,
    result: "success",
    durationMs,
  });

  return {
    status: "success",
    message: "Se o email existir, enviaremos um novo link de verificacao em instantes.",
  };
}
