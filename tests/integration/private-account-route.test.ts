import { beforeEach, describe, expect, it, vi } from "vitest";

const getAuthSessionFromRequestMock = vi.fn();
const deleteAuthenticatedAccountMock = vi.fn();

vi.mock("@/lib/auth-session", () => ({
  getAuthSessionFromRequest: getAuthSessionFromRequestMock,
}));

vi.mock("@/server/services/account-deletion-service", () => ({
  accountDeletionService: {
    deleteAuthenticatedAccount: deleteAuthenticatedAccountMock,
  },
}));

vi.mock("@/server/observability/auth-events", () => ({
  logAuthEvent: vi.fn(),
}));

describe("DELETE /api/private/account", () => {
  beforeEach(() => {
    getAuthSessionFromRequestMock.mockReset();
    deleteAuthenticatedAccountMock.mockReset();
  });

  it("retorna erro tipado quando nao autenticado", async () => {
    const { DELETE } = await import("@/app/api/private/account/route");

    getAuthSessionFromRequestMock.mockResolvedValue(null);
    deleteAuthenticatedAccountMock.mockResolvedValue({
      ok: false,
      code: "UNAUTHENTICATED",
      status: 401,
      message: "Sessao invalida ou expirada.",
    });

    const response = await DELETE(new Request("http://localhost/api/private/account"));
    const payload = await response.json();

    expect(response.status).toBe(401);
    expect(response.headers.get("cache-control")).toContain("no-store");
    expect(payload).toEqual({
      ok: false,
      error: "UNAUTHENTICATED",
      message: "Sessao invalida ou expirada.",
    });
  });

  it("retorna sucesso e url de redirecionamento quando exclusao conclui", async () => {
    const { DELETE } = await import("@/app/api/private/account/route");

    getAuthSessionFromRequestMock.mockResolvedValue({
      user: {
        id: "user_abc",
        email: "owner@cardflow.app",
        emailVerified: true,
      },
    });
    deleteAuthenticatedAccountMock.mockResolvedValue({
      ok: true,
      data: {
        logoutUrl: "/",
      },
    });

    const response = await DELETE(new Request("http://localhost/api/private/account"));
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toContain("no-store");
    expect(payload).toEqual({
      ok: true,
      data: {
        logoutUrl: "/",
      },
    });
  });

  it("retorna erro de provider quando exclusao no Better Auth falha", async () => {
    const { DELETE } = await import("@/app/api/private/account/route");

    getAuthSessionFromRequestMock.mockResolvedValue({
      user: {
        id: "user_abc",
        email: "owner@cardflow.app",
        emailVerified: true,
      },
    });
    deleteAuthenticatedAccountMock.mockResolvedValue({
      ok: false,
      code: "AUTH_PROVIDER_DELETE_FAILED",
      status: 502,
      message: "Nao foi possivel remover a conta no provedor de autenticacao.",
    });

    const response = await DELETE(new Request("http://localhost/api/private/account"));
    const payload = await response.json();

    expect(response.status).toBe(502);
    expect(payload).toEqual({
      ok: false,
      error: "AUTH_PROVIDER_DELETE_FAILED",
      message: "Nao foi possivel remover a conta no provedor de autenticacao.",
    });
  });
});
