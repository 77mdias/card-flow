import "server-only";

import { headers } from "next/headers";

import { auth } from "@/lib/auth";

export async function getServerAuthSession() {
  return auth.api.getSession({
    headers: await headers(),
  });
}

export async function getAuthSessionFromRequest(request: Request) {
  return auth.api.getSession({
    headers: request.headers,
  });
}
