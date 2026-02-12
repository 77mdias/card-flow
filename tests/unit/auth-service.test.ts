import type { SessionData } from "@auth0/nextjs-auth0/types";
import { describe, expect, it, vi } from "vitest";

import type { AppUserDto } from "@/lib/types/user";
import { createAuthService } from "@/server/services/auth-service";
import type { UsersRepository } from "@/server/repos/users-repo";

function buildSession(overrides: Partial<SessionData["user"]> = {}): SessionData {
  return {
    user: {
      sub: "auth0|user_123",
      email: "owner@cardflow.app",
      email_verified: true,
      ...overrides,
    },
  } as SessionData;
}

function buildUser(overrides: Partial<AppUserDto> = {}): AppUserDto {
  return {
    id: "a4a38fc3-4f79-4977-bf6b-a2f5265025fa",
    email: "owner@cardflow.app",
    emailVerified: true,
    status: "ACTIVE",
    createdAt: new Date("2026-02-12T10:00:00.000Z"),
    lastLoginAt: new Date("2026-02-12T10:00:00.000Z"),
    ...overrides,
  };
}

describe("authService.synchronizeFromSession", () => {
  it("cria usuario novo com status ACTIVE", async () => {
    const fixedNow = new Date("2026-02-12T15:00:00.000Z");

    const repository: UsersRepository = {
      upsertFromAuthIdentity: vi.fn().mockResolvedValue(buildUser()),
    };

    const service = createAuthService({
      usersRepository: repository,
      now: () => fixedNow,
    });

    const result = await service.synchronizeFromSession(buildSession());

    expect(result.ok).toBe(true);
    expect(repository.upsertFromAuthIdentity).toHaveBeenCalledWith({
      authProvider: "auth0",
      authSubject: "auth0|user_123",
      email: "owner@cardflow.app",
      emailVerified: true,
      loginAt: fixedNow,
    });
  });

  it("atualiza last_login_at em login recorrente", async () => {
    const firstLogin = new Date("2026-02-12T08:00:00.000Z");
    const recurringLogin = new Date("2026-02-12T17:00:00.000Z");

    const repository: UsersRepository = {
      upsertFromAuthIdentity: vi
        .fn()
        .mockResolvedValueOnce(
          buildUser({
            lastLoginAt: firstLogin,
          }),
        )
        .mockResolvedValueOnce(
          buildUser({
            lastLoginAt: recurringLogin,
          }),
        ),
    };

    const service = createAuthService({
      usersRepository: repository,
      now: () => recurringLogin,
    });

    const firstResult = await service.synchronizeFromSession(buildSession());
    const recurringResult = await service.synchronizeFromSession(buildSession());

    expect(firstResult.ok).toBe(true);
    expect(recurringResult.ok).toBe(true);
    expect(repository.upsertFromAuthIdentity).toHaveBeenCalledTimes(2);

    const calls = vi.mocked(repository.upsertFromAuthIdentity).mock.calls;
    expect(calls[1]?.[0].loginAt).toEqual(recurringLogin);
  });

  it("bloqueia usuario INACTIVE ou DELETED", async () => {
    const repository: UsersRepository = {
      upsertFromAuthIdentity: vi
        .fn()
        .mockResolvedValueOnce(buildUser({ status: "INACTIVE" }))
        .mockResolvedValueOnce(buildUser({ status: "DELETED" })),
    };

    const service = createAuthService({
      usersRepository: repository,
    });

    const inactiveResult = await service.synchronizeFromSession(buildSession());
    const deletedResult = await service.synchronizeFromSession(buildSession());

    expect(inactiveResult).toMatchObject({
      ok: false,
      code: "INACTIVE",
      status: 403,
    });

    expect(deletedResult).toMatchObject({
      ok: false,
      code: "DELETED",
      status: 403,
    });
  });
});
