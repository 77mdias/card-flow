"use server";

import { revalidatePath } from "next/cache";

import { getServerAuthSession } from "@/lib/auth-session";
import type { ResendVerificationEmailActionState } from "@/lib/types/email-verification";
import { resendVerificationEmailInputSchema } from "@/lib/validation/email-verification";
import { logAuthEvent } from "@/server/observability/auth-events";
import { verificationEmailService } from "@/server/services/email-verification-service";

export async function resendVerificationEmailAction(
  _previousState: ResendVerificationEmailActionState,
  formData: FormData,
): Promise<ResendVerificationEmailActionState> {
  const startedAt = Date.now();
  const requestId = crypto.randomUUID();

  const parsedInput = resendVerificationEmailInputSchema.safeParse({
    intent: formData.get("intent"),
  });

  if (!parsedInput.success) {
    const durationMs = Date.now() - startedAt;
    logAuthEvent({
      route: "/email-verification-required",
      requestId,
      result: "failure",
      durationMs,
      reason: "INVALID_INPUT",
    });

    return {
      status: "error",
      code: "INVALID_INPUT",
      message: "Solicitacao invalida. Recarregue a pagina e tente novamente.",
    };
  }

  const session = await getServerAuthSession();
  const resendResult = await verificationEmailService.sendVerificationEmail(session);
  const durationMs = Date.now() - startedAt;

  if (!resendResult.ok) {
    logAuthEvent({
      route: "/email-verification-required",
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

  revalidatePath("/email-verification-required");
  logAuthEvent({
    route: "/email-verification-required",
    requestId,
    result: "success",
    durationMs,
  });

  return {
    status: "success",
    message: "Enviamos um novo email de verificacao. Confira sua caixa de entrada.",
  };
}
