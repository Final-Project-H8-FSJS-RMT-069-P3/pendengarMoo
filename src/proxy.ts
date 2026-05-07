import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export const proxy = auth((request) => {
  const isAuthenticated = Boolean(request.auth);
  const isAuthPage =
    request.nextUrl.pathname.startsWith("/login") ||
    request.nextUrl.pathname.startsWith("/register");

  if (isAuthenticated && isAuthPage) {
    const homeUrl = new URL("/", request.url);
    return NextResponse.redirect(homeUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/login/:path*", "/register/:path*"],
};
