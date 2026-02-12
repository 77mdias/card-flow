import "server-only";

import type { SessionData } from "@auth0/nextjs-auth0/types";

import type { AppUserDto } from "@/lib/types/user";
import { authSessionUserSchema } from "@/lib/validation/auth-session";
import {
  usersRepository,
  type UsersRepository,
} from "@/server/repos/users-repo";

export type AuthFailureCode =
  | "UNAUTHENTICATED"
  | "INVALID_SESSION"
  | "EMAIL_NOT_VERIFIED"
  | "INACTIVE"
  | "DELETED";

export type AuthSyncResult =
  | {
      ok: true;
      data: AppUserDto;
    }
  | {
      ok: false;
      code: AuthFailureCode;
      status: 401 | 403;
      message: string;
    };

export interface AuthService {
  synchronizeFromSession(session: SessionData | null): Promise<AuthSyncResult>;
}

interface AuthServiceDependencies {
  usersRepository: UsersRepository;
  now: () => Date;
}

function getAuthProvider(subject: string): string {
  const [provider] = subject.split("|");
  return provider || "auth0";
}

function getBlockedMessage(code: "INACTIVE" | "DELETED"): string {
  if (code === "INACTIVE") {
    return "Sua conta esta inativa. Entre em contato com o suporte para reativacao.";
  }

  return "Sua conta foi removida. Entre em contato com o suporte para orientacoes.";
}

export function createAuthService(
  overrides: Partial<AuthServiceDependencies> = {},
): AuthService {
  const deps: AuthServiceDependencies = {
    usersRepository: overrides.usersRepository ?? usersRepository,
    now: overrides.now ?? (() => new Date()),
  };

  return {
    async synchronizeFromSession(session: SessionData | null): Promise<AuthSyncResult> {
      if (!session?.user) {
        return {
          ok: false,
          code: "UNAUTHENTICATED",
          status: 401,
          message: "Sessao invalida ou expirada.",
        };
      }

      const parsedUser = authSessionUserSchema.safeParse(session.user);
      if (!parsedUser.success) {
        return {
          ok: false,
          code: "INVALID_SESSION",
          status: 401,
          message: "Sessao invalida.",
        };
      }

      const sessionUser = parsedUser.data;
      if (!sessionUser.email_verified) {
        return {
          ok: false,
          code: "EMAIL_NOT_VERIFIED",
          status: 403,
          message: "Confirme seu email para acessar o CardFlow.",
        };
      }

      const syncedUser = await deps.usersRepository.upsertFromAuthIdentity({
        authProvider: getAuthProvider(sessionUser.sub),
        authSubject: sessionUser.sub,
        email: sessionUser.email.toLowerCase(),
        emailVerified: sessionUser.email_verified,
        loginAt: deps.now(),
      });

      if (syncedUser.status === "ACTIVE") {
        return {
          ok: true,
          data: syncedUser,
        };
      }

      const code = syncedUser.status;
      return {
        ok: false,
        code,
        status: 403,
        message: getBlockedMessage(code),
      };
    },
  };
}

export const authService = createAuthService();
