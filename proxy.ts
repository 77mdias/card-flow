import type { NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";
import { NextResponse } from "next/server";

const privatePathPrefixes = ["/dashboard", "/api/private"];

function isPrivatePath(pathname: string): boolean {
  return privatePathPrefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

export async function proxy(request: NextRequest) {
  if (!isPrivatePath(request.nextUrl.pathname)) {
    return NextResponse.next();
  }

  const sessionToken = getSessionCookie(request);
  if (sessionToken) {
    return NextResponse.next();
  }

  const returnTo = `${request.nextUrl.pathname}${request.nextUrl.search}`;
  const loginUrl = new URL("/auth/login", request.nextUrl.origin);
  loginUrl.searchParams.set("returnTo", returnTo);

  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/dashboard/:path*", "/api/private/:path*"],
};
