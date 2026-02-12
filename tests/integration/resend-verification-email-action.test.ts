import { beforeEach, describe, expect, it, vi } from "vitest";

import { initialResendVerificationEmailActionState } from "@/lib/types/email-verification";

const getServerAuthSessionMock = vi.fn();
const sendVerificationEmailMock = vi.fn();
const logAuthEventMock = vi.fn();
const revalidatePathMock = vi.fn();

vi.mock("@/lib/auth-session", () => ({
  getServerAuthSession: getServerAuthSessionMock,
}));

vi.mock("@/server/services/email-verification-service", () => ({
  verificationEmailService: {
    sendVerificationEmail: sendVerificationEmailMock,
  },
}));

vi.mock("@/server/observability/auth-events", () => ({
  logAuthEvent: logAuthEventMock,
}));

vi.mock("next/cache", () => ({
  revalidatePath: revalidatePathMock,
}));

describe("resendVerificationEmailAction", () => {
  beforeEach(() => {
    getServerAuthSessionMock.mockReset();
    sendVerificationEmailMock.mockReset();
    logAuthEventMock.mockReset();
    revalidatePathMock.mockReset();
  });

  it("retorna erro de validacao para payload invalido", async () => {
    const { resendVerificationEmailAction } = await import(
      "@/app/email-verification-required/actions"
    );

    const invalidFormData = new FormData();
    const response = await resendVerificationEmailAction(
      initialResendVerificationEmailActionState,
      invalidFormData,
    );

    expect(response).toEqual({
      status: "error",
      code: "INVALID_INPUT",
      message: "Solicitacao invalida. Recarregue a pagina e tente novamente.",
    });
    expect(sendVerificationEmailMock).not.toHaveBeenCalled();
  });

  it("retorna sucesso e revalida pagina quando o reenvio conclui", async () => {
    const { resendVerificationEmailAction } = await import(
      "@/app/email-verification-required/actions"
    );

    getServerAuthSessionMock.mockResolvedValue({
      user: {
        id: "user_abc",
        email: "owner@cardflow.app",
        emailVerified: false,
      },
    });
    sendVerificationEmailMock.mockResolvedValue({
      ok: true,
      data: {
        sentAt: new Date("2026-02-12T18:00:00.000Z"),
      },
    });

    const validFormData = new FormData();
    validFormData.set("intent", "resend_verification_email");

    const response = await resendVerificationEmailAction(
      initialResendVerificationEmailActionState,
      validFormData,
    );

    expect(response).toEqual({
      status: "success",
      message: "Enviamos um novo email de verificacao. Confira sua caixa de entrada.",
    });
    expect(revalidatePathMock).toHaveBeenCalledWith("/email-verification-required");
  });

  it("retorna falha tipada quando service devolve erro de dominio", async () => {
    const { resendVerificationEmailAction } = await import(
      "@/app/email-verification-required/actions"
    );

    getServerAuthSessionMock.mockResolvedValue({
      user: {
        id: "user_abc",
        email: "owner@cardflow.app",
        emailVerified: false,
      },
    });
    sendVerificationEmailMock.mockResolvedValue({
      ok: false,
      code: "RATE_LIMITED",
      status: 429,
      message: "Muitas tentativas de reenvio.",
      retryAfterSeconds: 60,
    });

    const validFormData = new FormData();
    validFormData.set("intent", "resend_verification_email");

    const response = await resendVerificationEmailAction(
      initialResendVerificationEmailActionState,
      validFormData,
    );

    expect(response).toEqual({
      status: "error",
      code: "RATE_LIMITED",
      message: "Muitas tentativas de reenvio.",
    });
    expect(revalidatePathMock).not.toHaveBeenCalled();
  });
});
