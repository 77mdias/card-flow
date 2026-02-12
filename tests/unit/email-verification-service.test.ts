import { describe, expect, it, vi } from "vitest";

import { BetterAuthRepositoryError } from "@/server/repos/better-auth-repo";
import { createVerificationEmailService } from "@/server/services/email-verification-service";

function buildSession(overrides: Record<string, unknown> = {}) {
  return {
    user: {
      id: "user_abc",
      email: "user@cardflow.app",
      emailVerified: false,
      ...overrides,
    },
  };
}

describe("verificationEmailService.sendVerificationEmail", () => {
  it("retorna UNAUTHENTICATED quando nao ha sessao", async () => {
    const service = createVerificationEmailService({
      resolveConfig: () => null,
    });

    const result = await service.sendVerificationEmail(null);

    expect(result).toMatchObject({
      ok: false,
      code: "UNAUTHENTICATED",
      status: 401,
    });
  });

  it("retorna ALREADY_VERIFIED quando o email ja esta verificado", async () => {
    const service = createVerificationEmailService({
      resolveConfig: () => null,
    });

    const result = await service.sendVerificationEmail(
      buildSession({
        emailVerified: true,
      }),
    );

    expect(result).toMatchObject({
      ok: false,
      code: "ALREADY_VERIFIED",
      status: 409,
    });
  });

  it("retorna NOT_CONFIGURED quando faltam variaveis obrigatorias", async () => {
    const service = createVerificationEmailService({
      resolveConfig: () => null,
    });

    const result = await service.sendVerificationEmail(buildSession());

    expect(result).toMatchObject({
      ok: false,
      code: "NOT_CONFIGURED",
      status: 503,
    });
  });

  it("retorna RATE_LIMITED quando excede o limite de reenvio", async () => {
    const service = createVerificationEmailService({
      resolveConfig: () => ({
        appBaseUrl: "http://localhost:3000",
        verificationResultPath: "/dashboard",
      }),
      checkRateLimit: () => ({
        allowed: false,
        retryAfterSeconds: 45,
      }),
    });

    const result = await service.sendVerificationEmail(buildSession());

    expect(result).toMatchObject({
      ok: false,
      code: "RATE_LIMITED",
      status: 429,
      retryAfterSeconds: 45,
    });
  });

  it("solicita envio de verificacao quando configuracao e sessao sao validas", async () => {
    const fixedNow = new Date("2026-02-12T18:00:00.000Z");
    const sendVerificationEmailMock = vi.fn().mockResolvedValue(undefined);

    const service = createVerificationEmailService({
      betterAuthRepository: {
        deleteCurrentUser: vi.fn(),
        sendVerificationEmail: sendVerificationEmailMock,
      },
      now: () => fixedNow,
      resolveConfig: () => ({
        appBaseUrl: "http://localhost:3000",
        verificationResultPath: "/dashboard",
      }),
      checkRateLimit: () => ({
        allowed: true,
      }),
    });

    const result = await service.sendVerificationEmail(buildSession());

    expect(result).toEqual({
      ok: true,
      data: {
        sentAt: fixedNow,
      },
    });

    expect(sendVerificationEmailMock).toHaveBeenCalledWith({
      email: "user@cardflow.app",
      callbackURL: "http://localhost:3000/dashboard",
    });
  });

  it("mapeia falha de repositorio para erro seguro", async () => {
    const fixedNow = new Date("2026-02-12T18:00:00.000Z");

    const service = createVerificationEmailService({
      betterAuthRepository: {
        deleteCurrentUser: vi.fn(),
        sendVerificationEmail: vi
          .fn()
          .mockRejectedValue(
            new BetterAuthRepositoryError("SEND_VERIFICATION_EMAIL_FAILED"),
          ),
      },
      now: () => fixedNow,
      resolveConfig: () => ({
        appBaseUrl: "http://localhost:3000",
        verificationResultPath: "/dashboard",
      }),
      checkRateLimit: () => ({
        allowed: true,
      }),
    });

    const result = await service.sendVerificationEmail(buildSession());
    expect(result).toMatchObject({
      ok: false,
      code: "EMAIL_DELIVERY_FAILED",
      status: 502,
    });
  });
});
