import { NextRequest, NextResponse } from "next/server";
import User from "@/server/models/User";
import { exchangeCodeForCalendarTokens } from "@/server/helpers/googleCalendarOAuth";

function buildRedirect(request: NextRequest, path: string, key: string, value: string) {
  const safePath = path.startsWith("/") ? path : "/profile";
  const redirectUrl = new URL(safePath, request.nextUrl.origin);
  redirectUrl.searchParams.set(key, value);
  return redirectUrl;
}

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");
  const oauthError = request.nextUrl.searchParams.get("error");

  if (oauthError) {
    return NextResponse.redirect(
      buildRedirect(request, "/profile", "calendar", `oauth-${oauthError}`),
    );
  }

  if (!code || !state) {
    return NextResponse.redirect(
      buildRedirect(request, "/profile", "calendar", "missing-code"),
    );
  }

  try {
    const redirectUri = new URL(request.nextUrl.pathname, request.nextUrl.origin).toString();
    const { userId, returnTo, providerEmail, tokens } =
      await exchangeCodeForCalendarTokens(code, state, redirectUri);

    const existingUser = await User.getUserById(userId);
    if (!existingUser) {
      return NextResponse.redirect(
        buildRedirect(request, "/profile", "calendar", "user-not-found"),
      );
    }

    const refreshToken = tokens.refresh_token || existingUser.googleCalendar?.refreshToken;

    if (!refreshToken) {
      return NextResponse.redirect(
        buildRedirect(request, returnTo, "calendar", "missing-refresh-token"),
      );
    }

    await User.updateGoogleCalendarConnection(userId, {
      connected: true,
      provider: "google",
      providerEmail: providerEmail || existingUser.googleCalendar?.providerEmail || existingUser.email,
      accessToken: tokens.access_token || existingUser.googleCalendar?.accessToken,
      refreshToken,
      scope: tokens.scope || existingUser.googleCalendar?.scope,
      tokenType: tokens.token_type || existingUser.googleCalendar?.tokenType,
      expiryDate: tokens.expiry_date || existingUser.googleCalendar?.expiryDate,
      connectedAt: existingUser.googleCalendar?.connectedAt || new Date(),
    });

    return NextResponse.redirect(
      buildRedirect(request, returnTo, "calendar", "connected"),
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "unknown-error";
    return NextResponse.redirect(
      buildRedirect(request, "/profile", "calendar_error", message),
    );
  }
}
