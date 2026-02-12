import { NextResponse } from "next/server";

import { auth0 } from "@/lib/auth0";
import { logAuthEvent } from "@/server/observability/auth-events";
import { authService } from "@/server/services/auth-service";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function toNoStoreResponse(response: NextResponse): NextResponse {
  response.headers.set("Cache-Control", "no-store, max-age=0");
  return response;
}

export async function GET(request: Request) {
  const startedAt = Date.now();
  const requestId = request.headers.get("x-request-id") ?? crypto.randomUUID();

  const session = await auth0.getSession();
  const authResult = await authService.synchronizeFromSession(session);
  const durationMs = Date.now() - startedAt;

  if (!authResult.ok) {
    logAuthEvent({
      route: "/api/private/session",
      requestId,
      result: "failure",
      durationMs,
      reason: authResult.code,
    });

    return toNoStoreResponse(
      NextResponse.json(
        {
          ok: false,
          error: authResult.code,
          message: authResult.message,
        },
        { status: authResult.status },
      ),
    );
  }

  logAuthEvent({
    route: "/api/private/session",
    requestId,
    result: "success",
    durationMs,
  });

  return toNoStoreResponse(
    NextResponse.json({
      ok: true,
      data: authResult.data,
    }),
  );
}
