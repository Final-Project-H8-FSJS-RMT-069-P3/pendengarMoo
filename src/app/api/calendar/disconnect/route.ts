import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import User from "@/server/models/User";

export async function POST() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  await User.clearGoogleCalendarConnection(session.user.id);

  return NextResponse.json({
    message: "Google Calendar disconnected",
  });
}
