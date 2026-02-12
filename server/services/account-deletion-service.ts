import "server-only";

import type { DeleteAuthenticatedAccountResult } from "@/lib/types/account-deletion";
import { authSessionUserSchema } from "@/lib/validation/auth-session";
import {
  BetterAuthRepositoryError,
  betterAuthRepository,
  type BetterAuthRepository,
} from "@/server/repos/better-auth-repo";
import { usersRepository, type UsersRepository } from "@/server/repos/users-repo";

interface AccountDeletionServiceDependencies {
  authUserDeletionRepository: BetterAuthRepository;
  usersRepository: UsersRepository;
}

export interface AccountDeletionService {
  deleteAuthenticatedAccount(session: unknown, requestHeaders?: Headers): Promise<DeleteAuthenticatedAccountResult>;
}

export function createAccountDeletionService(
  overrides: Partial<AccountDeletionServiceDependencies> = {},
): AccountDeletionService {
  const deps: AccountDeletionServiceDependencies = {
    authUserDeletionRepository: overrides.authUserDeletionRepository ?? betterAuthRepository,
    usersRepository: overrides.usersRepository ?? usersRepository,
  };

  return {
    async deleteAuthenticatedAccount(
      session: unknown,
      requestHeaders?: Headers,
    ): Promise<DeleteAuthenticatedAccountResult> {
      if (!session || typeof session !== "object" || !("user" in session)) {
        return {
          ok: false,
          code: "UNAUTHENTICATED",
          status: 401,
          message: "Sessao invalida ou expirada.",
        };
      }

      const parsedUser = authSessionUserSchema.safeParse((session as { user?: unknown }).user);
      if (!parsedUser.success) {
        return {
          ok: false,
          code: "INVALID_SESSION",
          status: 401,
          message: "Sessao invalida.",
        };
      }

      if (!requestHeaders) {
        return {
          ok: false,
          code: "NOT_CONFIGURED",
          status: 503,
          message: "Exclusao indisponivel no momento. Tente novamente mais tarde.",
        };
      }

      const sessionUser = parsedUser.data;

      try {
        await deps.authUserDeletionRepository.deleteCurrentUser({
          headers: requestHeaders,
        });
      } catch (error) {
        if (error instanceof BetterAuthRepositoryError) {
          return {
            ok: false,
            code: "AUTH_PROVIDER_DELETE_FAILED",
            status: 502,
            message: "Nao foi possivel remover a conta no provedor de autenticacao.",
          };
        }

        return {
          ok: false,
          code: "AUTH_PROVIDER_DELETE_FAILED",
          status: 502,
          message: "Nao foi possivel remover a conta no provedor de autenticacao.",
        };
      }

      try {
        await deps.usersRepository.deleteByAuthSubject(sessionUser.subject);
      } catch {
        return {
          ok: false,
          code: "LOCAL_DELETE_FAILED",
          status: 502,
          message: "A conta foi removida do provedor, mas falhou ao remover no banco local.",
        };
      }

      return {
        ok: true,
        data: {
          logoutUrl: "/",
        },
      };
    },
  };
}

export const accountDeletionService = createAccountDeletionService();
