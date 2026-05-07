import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { buildCalendarConnectUrl } from "@/server/helpers/googleCalendarOAuth";

export async function GET(request: NextRequest) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const returnTo = request.nextUrl.searchParams.get("returnTo") || "/profile";
  const mode = request.nextUrl.searchParams.get("mode") || "json";
  const redirectUri = new URL("/api/calendar/callback", request.nextUrl.origin).toString();

  const connectUrl = buildCalendarConnectUrl(session.user.id, returnTo, redirectUri);

  if (mode === "redirect") {
    return NextResponse.redirect(connectUrl);
  }

  return NextResponse.json({
    message: "Google Calendar connect URL generated",
    url: connectUrl,
  });
}
