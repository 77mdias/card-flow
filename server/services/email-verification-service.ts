import "server-only";

import { env } from "@/lib/env";
import type { SendVerificationEmailResult } from "@/lib/types/email-verification";
import { authSessionUserSchema } from "@/lib/validation/auth-session";
import {
  BetterAuthRepositoryError,
  betterAuthRepository,
  type BetterAuthRepository,
} from "@/server/repos/better-auth-repo";

const EMAIL_VERIFICATION_RESULT_PATH = "/dashboard";
const EMAIL_VERIFICATION_RESEND_MAX_ATTEMPTS = 3;
const EMAIL_VERIFICATION_RESEND_WINDOW_MS = 10 * 60 * 1000;

interface VerificationEmailServiceConfig {
  appBaseUrl: string;
  verificationResultPath: string;
}

interface RateLimitResult {
  allowed: boolean;
  retryAfterSeconds?: number;
}

interface VerificationEmailServiceDependencies {
  betterAuthRepository: BetterAuthRepository;
  now: () => Date;
  resolveConfig: () => VerificationEmailServiceConfig | null;
  checkRateLimit: (subject: string, nowMs: number) => RateLimitResult;
}

export interface VerificationEmailService {
  sendVerificationEmail(session: unknown): Promise<SendVerificationEmailResult>;
}

const globalForEmailVerificationRateLimit = globalThis as unknown as {
  emailVerificationResendAttempts?: Map<string, number[]>;
};

const emailVerificationResendAttempts =
  globalForEmailVerificationRateLimit.emailVerificationResendAttempts ??
  new Map<string, number[]>();

if (process.env.NODE_ENV !== "production") {
  globalForEmailVerificationRateLimit.emailVerificationResendAttempts =
    emailVerificationResendAttempts;
}

function createInMemoryRateLimiter(
  maxAttempts: number,
  windowMs: number,
): (subject: string, nowMs: number) => RateLimitResult {
  return (subject: string, nowMs: number) => {
    const attempts = emailVerificationResendAttempts.get(subject) ?? [];
    const validAttempts = attempts.filter((attemptMs) => attemptMs > nowMs - windowMs);

    if (validAttempts.length >= maxAttempts) {
      const oldestAttempt = validAttempts[0];
      if (!oldestAttempt) {
        return {
          allowed: false,
          retryAfterSeconds: Math.ceil(windowMs / 1_000),
        };
      }

      return {
        allowed: false,
        retryAfterSeconds: Math.ceil((oldestAttempt + windowMs - nowMs) / 1_000),
      };
    }

    validAttempts.push(nowMs);
    emailVerificationResendAttempts.set(subject, validAttempts);

    return { allowed: true };
  };
}

function resolveVerificationEmailConfig(): VerificationEmailServiceConfig | null {
  if (!env.APP_BASE_URL) {
    return null;
  }

  return {
    appBaseUrl: env.APP_BASE_URL,
    verificationResultPath: EMAIL_VERIFICATION_RESULT_PATH,
  };
}

function buildRateLimitMessage(retryAfterSeconds?: number): string {
  if (!retryAfterSeconds || retryAfterSeconds <= 0) {
    return "Muitas tentativas de reenvio. Aguarde alguns instantes e tente novamente.";
  }

  return `Muitas tentativas de reenvio. Tente novamente em ${retryAfterSeconds} segundos.`;
}

export function createVerificationEmailService(
  overrides: Partial<VerificationEmailServiceDependencies> = {},
): VerificationEmailService {
  const deps: VerificationEmailServiceDependencies = {
    betterAuthRepository:
      overrides.betterAuthRepository ?? betterAuthRepository,
    now: overrides.now ?? (() => new Date()),
    resolveConfig: overrides.resolveConfig ?? resolveVerificationEmailConfig,
    checkRateLimit:
      overrides.checkRateLimit ??
      createInMemoryRateLimiter(
        EMAIL_VERIFICATION_RESEND_MAX_ATTEMPTS,
        EMAIL_VERIFICATION_RESEND_WINDOW_MS,
      ),
  };

  return {
    async sendVerificationEmail(session: unknown): Promise<SendVerificationEmailResult> {
      if (!session || typeof session !== "object" || !("user" in session)) {
        return {
          ok: false,
          code: "UNAUTHENTICATED",
          status: 401,
          message: "Sessao invalida ou expirada.",
        };
      }

      const parsedUser = authSessionUserSchema.safeParse(
        (session as { user?: unknown }).user,
      );
      if (!parsedUser.success) {
        return {
          ok: false,
          code: "INVALID_SESSION",
          status: 401,
          message: "Sessao invalida.",
        };
      }

      const sessionUser = parsedUser.data;
      if (sessionUser.emailVerified) {
        return {
          ok: false,
          code: "ALREADY_VERIFIED",
          status: 409,
          message: "Este email ja esta verificado.",
        };
      }

      const config = deps.resolveConfig();
      if (!config) {
        return {
          ok: false,
          code: "NOT_CONFIGURED",
          status: 503,
          message: "Reenvio indisponivel no momento. Tente novamente mais tarde.",
        };
      }

      const nowMs = deps.now().getTime();
      const rateLimitResult = deps.checkRateLimit(sessionUser.subject, nowMs);
      if (!rateLimitResult.allowed) {
        return {
          ok: false,
          code: "RATE_LIMITED",
          status: 429,
          message: buildRateLimitMessage(rateLimitResult.retryAfterSeconds),
          retryAfterSeconds: rateLimitResult.retryAfterSeconds,
        };
      }

      const verificationResultUrl = new URL(
        config.verificationResultPath,
        config.appBaseUrl,
      ).toString();

      try {
        await deps.betterAuthRepository.sendVerificationEmail({
          email: sessionUser.email.toLowerCase(),
          callbackURL: verificationResultUrl,
        });
      } catch (error) {
        if (error instanceof BetterAuthRepositoryError) {
          return {
            ok: false,
            code: "EMAIL_DELIVERY_FAILED",
            status: 502,
            message: "Nao foi possivel enviar o email de verificacao no momento.",
          };
        }

        return {
          ok: false,
          code: "EMAIL_DELIVERY_FAILED",
          status: 502,
          message: "Nao foi possivel enviar o email de verificacao no momento.",
        };
      }

      return {
        ok: true,
        data: {
          sentAt: deps.now(),
        },
      };
    },
  };
}

export const verificationEmailService = createVerificationEmailService();
