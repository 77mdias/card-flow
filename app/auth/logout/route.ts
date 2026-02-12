import { splitSetCookieHeader } from "better-auth/cookies";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function resolveReturnTo(rawReturnTo: string | null): string {
  if (!rawReturnTo || !rawReturnTo.startsWith("/")) {
    return "/";
  }

  return rawReturnTo;
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const signOutUrl = new URL("/api/auth/sign-out", requestUrl.origin);
  const returnTo = resolveReturnTo(requestUrl.searchParams.get("returnTo"));

  const upstreamResponse = await fetch(signOutUrl, {
    method: "POST",
    headers: {
      cookie: request.headers.get("cookie") ?? "",
    },
    cache: "no-store",
    redirect: "manual",
  });

  const response = NextResponse.redirect(new URL(returnTo, requestUrl.origin));
  const getSetCookie = (
    upstreamResponse.headers as Headers & { getSetCookie?: () => string[] }
  ).getSetCookie;

  if (typeof getSetCookie === "function") {
    const cookies = getSetCookie.call(upstreamResponse.headers);
    for (const cookie of cookies) {
      response.headers.append("set-cookie", cookie);
    }

    return response;
  }

  const setCookie = upstreamResponse.headers.get("set-cookie");
  if (!setCookie) {
    return response;
  }

  for (const cookie of splitSetCookieHeader(setCookie)) {
    response.headers.append("set-cookie", cookie);
  }

  return response;
}
