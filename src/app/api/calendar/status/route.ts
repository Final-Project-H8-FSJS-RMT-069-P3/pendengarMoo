import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import User from "@/server/models/User";

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const user = await User.getUserById(session.user.id);

  return NextResponse.json({
    message: "Google Calendar status fetched",
    data: {
      connected: Boolean(user?.googleCalendar?.connected),
      providerEmail: user?.googleCalendar?.providerEmail || null,
      connectedAt: user?.googleCalendar?.connectedAt || null,
      updatedAt: user?.googleCalendar?.updatedAt || null,
    },
  });
}
