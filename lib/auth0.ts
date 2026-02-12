import "server-only";

import { Auth0Client } from "@auth0/nextjs-auth0/server";
import { NextResponse } from "next/server";

import { env } from "@/lib/env";

const AUTH0_HTTP_TIMEOUT_MS = 15_000;

function resolveSafeReturnTo(returnTo: string | undefined): string {
  if (!returnTo) {
    return "/";
  }

  if (returnTo.startsWith("/")) {
    return returnTo;
  }

  try {
    const parsed = new URL(returnTo);
    const appBaseUrl = new URL(env.APP_BASE_URL);
    if (parsed.origin === appBaseUrl.origin) {
      return `${parsed.pathname}${parsed.search}${parsed.hash}`;
    }
  } catch {
    return "/";
  }

  return "/";
}

export const auth0 = new Auth0Client({
  domain: env.AUTH0_DOMAIN,
  clientId: env.AUTH0_CLIENT_ID,
  clientSecret: env.AUTH0_CLIENT_SECRET,
  secret: env.AUTH0_SECRET,
  appBaseUrl: env.APP_BASE_URL,
  httpTimeout: AUTH0_HTTP_TIMEOUT_MS,
  onCallback: async (error, ctx) => {
    const safeReturnTo = resolveSafeReturnTo(ctx.returnTo);

    if (error) {
      console.warn("[auth] callback-failure", {
        message: error.message,
        code: error.code,
      });

      const errorUrl = new URL("/auth-error", env.APP_BASE_URL);
      errorUrl.searchParams.set("returnTo", safeReturnTo);
      return NextResponse.redirect(errorUrl);
    }

    return NextResponse.redirect(new URL(safeReturnTo, env.APP_BASE_URL));
  },
  authorizationParameters: {
    scope: "openid profile email",
  },
});
