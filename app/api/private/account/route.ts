import { NextResponse } from "next/server";

import { getAuthSessionFromRequest } from "@/lib/auth-session";
import { logAuthEvent } from "@/server/observability/auth-events";
import { accountDeletionService } from "@/server/services/account-deletion-service";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function toNoStoreResponse(response: NextResponse): NextResponse {
  response.headers.set("Cache-Control", "no-store, max-age=0");
  return response;
}

export async function DELETE(request: Request) {
  const startedAt = Date.now();
  const requestId = request.headers.get("x-request-id") ?? crypto.randomUUID();

  const session = await getAuthSessionFromRequest(request);
  const deletionResult = await accountDeletionService.deleteAuthenticatedAccount(session, request.headers);
  const durationMs = Date.now() - startedAt;

  if (!deletionResult.ok) {
    logAuthEvent({
      route: "/api/private/account",
      requestId,
      result: "failure",
      durationMs,
      reason: deletionResult.code,
    });

    return toNoStoreResponse(
      NextResponse.json(
        {
          ok: false,
          error: deletionResult.code,
          message: deletionResult.message,
        },
        { status: deletionResult.status },
      ),
    );
  }

  logAuthEvent({
    route: "/api/private/account",
    requestId,
    result: "success",
    durationMs,
  });

  return toNoStoreResponse(
    NextResponse.json({
      ok: true,
      data: deletionResult.data,
    }),
  );
}
