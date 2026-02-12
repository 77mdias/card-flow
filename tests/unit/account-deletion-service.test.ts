import { describe, expect, it, vi } from "vitest";

import { BetterAuthRepositoryError } from "@/server/repos/better-auth-repo";
import type { UsersRepository } from "@/server/repos/users-repo";
import { createAccountDeletionService } from "@/server/services/account-deletion-service";

function buildSession(overrides: Record<string, unknown> = {}) {
  return {
    user: {
      id: "user_delete_123",
      email: "owner@cardflow.app",
      emailVerified: true,
      ...overrides,
    },
  };
}

describe("accountDeletionService.deleteAuthenticatedAccount", () => {
  it("retorna UNAUTHENTICATED sem sessao", async () => {
    const service = createAccountDeletionService();
    const result = await service.deleteAuthenticatedAccount(null, new Headers());

    expect(result).toMatchObject({
      ok: false,
      code: "UNAUTHENTICATED",
      status: 401,
    });
  });

  it("retorna NOT_CONFIGURED quando faltam headers de request", async () => {
    const service = createAccountDeletionService();
    const result = await service.deleteAuthenticatedAccount(buildSession());

    expect(result).toMatchObject({
      ok: false,
      code: "NOT_CONFIGURED",
      status: 503,
    });
  });

  it("remove no Better Auth e no banco local quando autenticado", async () => {
    const deleteCurrentUserMock = vi.fn().mockResolvedValue(undefined);
    const usersRepository: UsersRepository = {
      upsertFromAuthIdentity: vi.fn(),
      deleteByAuthSubject: vi.fn().mockResolvedValue({
        deletedCount: 1,
      }),
    };

    const service = createAccountDeletionService({
      authUserDeletionRepository: {
        deleteCurrentUser: deleteCurrentUserMock,
        sendVerificationEmail: vi.fn(),
      },
      usersRepository,
    });

    const result = await service.deleteAuthenticatedAccount(buildSession(), new Headers());

    expect(result).toEqual({
      ok: true,
      data: {
        logoutUrl: "/",
      },
    });

    expect(deleteCurrentUserMock).toHaveBeenCalledTimes(1);
    expect(usersRepository.deleteByAuthSubject).toHaveBeenCalledWith("user_delete_123");
  });

  it("retorna erro de provider quando exclusao no Better Auth falha", async () => {
    const usersRepository: UsersRepository = {
      upsertFromAuthIdentity: vi.fn(),
      deleteByAuthSubject: vi.fn(),
    };

    const service = createAccountDeletionService({
      authUserDeletionRepository: {
        deleteCurrentUser: vi
          .fn()
          .mockRejectedValue(new BetterAuthRepositoryError("DELETE_USER_FAILED")),
        sendVerificationEmail: vi.fn(),
      },
      usersRepository,
    });

    const result = await service.deleteAuthenticatedAccount(buildSession(), new Headers());

    expect(result).toMatchObject({
      ok: false,
      code: "AUTH_PROVIDER_DELETE_FAILED",
      status: 502,
    });
    expect(usersRepository.deleteByAuthSubject).not.toHaveBeenCalled();
  });

  it("retorna erro local quando falha ao remover no banco", async () => {
    const service = createAccountDeletionService({
      authUserDeletionRepository: {
        deleteCurrentUser: vi.fn().mockResolvedValue(undefined),
        sendVerificationEmail: vi.fn(),
      },
      usersRepository: {
        upsertFromAuthIdentity: vi.fn(),
        deleteByAuthSubject: vi.fn().mockRejectedValue(new Error("db unavailable")),
      },
    });

    const result = await service.deleteAuthenticatedAccount(buildSession(), new Headers());

    expect(result).toMatchObject({
      ok: false,
      code: "LOCAL_DELETE_FAILED",
      status: 502,
    });
  });
});
