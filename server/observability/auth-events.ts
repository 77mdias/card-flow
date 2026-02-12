import "server-only";

export interface AuthEventLog {
  route: string;
  requestId: string;
  result: "success" | "failure";
  durationMs: number;
  reason?: string;
}

export function logAuthEvent(event: AuthEventLog): void {
  const payload = {
    route: event.route,
    requestId: event.requestId,
    result: event.result,
    durationMs: event.durationMs,
    reason: event.reason,
  };

  if (event.result === "success") {
    console.info("[auth]", payload);
    return;
  }

  console.warn("[auth]", payload);
}
