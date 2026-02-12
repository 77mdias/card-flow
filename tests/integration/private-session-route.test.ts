import { beforeEach, describe, expect, it, vi } from "vitest";

import type { AppUserDto } from "@/lib/types/user";

const getAuthSessionFromRequestMock = vi.fn();
const synchronizeFromSessionMock = vi.fn();

vi.mock("@/lib/auth-session", () => ({
  getAuthSessionFromRequest: getAuthSessionFromRequestMock,
}));

vi.mock("@/server/services/auth-service", () => ({
  authService: {
    synchronizeFromSession: synchronizeFromSessionMock,
  },
}));

vi.mock("@/server/observability/auth-events", () => ({
  logAuthEvent: vi.fn(),
}));

function buildUser(overrides: Partial<AppUserDto> = {}): AppUserDto {
  return {
    id: "1637dd20-3b6c-4937-a630-0f5f5eec350f",
    email: "user@cardflow.app",
    emailVerified: true,
    status: "ACTIVE",
    createdAt: new Date("2026-02-12T10:00:00.000Z"),
    lastLoginAt: new Date("2026-02-12T10:00:00.000Z"),
    ...overrides,
  };
}

describe("GET /api/private/session", () => {
  beforeEach(() => {
    getAuthSessionFromRequestMock.mockReset();
    synchronizeFromSessionMock.mockReset();
  });

  it("retorna nao autorizado quando sessao e invalida", async () => {
    const { GET } = await import("@/app/api/private/session/route");

    getAuthSessionFromRequestMock.mockResolvedValue(null);
    synchronizeFromSessionMock.mockResolvedValue({
      ok: false,
      code: "UNAUTHENTICATED",
      status: 401,
      message: "Sessao invalida ou expirada.",
    });

    const response = await GET(new Request("http://localhost/api/private/session"));
    const payload = await response.json();

    expect(response.status).toBe(401);
    expect(response.headers.get("cache-control")).toContain("no-store");
    expect(payload).toEqual({
      ok: false,
      error: "UNAUTHENTICATED",
      message: "Sessao invalida ou expirada.",
    });
  });

  it("retorna sucesso com sessao valida", async () => {
    const { GET } = await import("@/app/api/private/session/route");

    getAuthSessionFromRequestMock.mockResolvedValue({
      user: {
        id: "user_abc",
        email: "user@cardflow.app",
        emailVerified: true,
      },
    });

    synchronizeFromSessionMock.mockResolvedValue({
      ok: true,
      data: buildUser(),
    });

    const response = await GET(new Request("http://localhost/api/private/session"));
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toContain("no-store");
    expect(payload.ok).toBe(true);
    expect(payload.data.email).toBe("user@cardflow.app");
  });

  it("retorna proibido para usuario inativo", async () => {
    const { GET } = await import("@/app/api/private/session/route");

    getAuthSessionFromRequestMock.mockResolvedValue({
      user: {
        id: "user_abc",
        email: "inactive@cardflow.app",
        emailVerified: true,
      },
    });

    synchronizeFromSessionMock.mockResolvedValue({
      ok: false,
      code: "INACTIVE",
      status: 403,
      message: "Sua conta esta inativa.",
    });

    const response = await GET(new Request("http://localhost/api/private/session"));
    const payload = await response.json();

    expect(response.status).toBe(403);
    expect(payload).toEqual({
      ok: false,
      error: "INACTIVE",
      message: "Sua conta esta inativa.",
    });
  });

  it("retorna email nao verificado quando faltou confirmacao", async () => {
    const { GET } = await import("@/app/api/private/session/route");

    getAuthSessionFromRequestMock.mockResolvedValue({
      user: {
        id: "user_abc",
        email: "pending@cardflow.app",
        emailVerified: false,
      },
    });

    synchronizeFromSessionMock.mockResolvedValue({
      ok: false,
      code: "EMAIL_NOT_VERIFIED",
      status: 403,
      message: "Confirme seu email para acessar o CardFlow.",
    });

    const response = await GET(new Request("http://localhost/api/private/session"));
    const payload = await response.json();

    expect(response.status).toBe(403);
    expect(payload).toEqual({
      ok: false,
      error: "EMAIL_NOT_VERIFIED",
      message: "Confirme seu email para acessar o CardFlow.",
    });
  });
});
