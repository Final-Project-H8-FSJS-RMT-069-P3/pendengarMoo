import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import User from "@/server/models/User";

export async function GET() {
  try {
    const session = await auth();

    if (!session || !session.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const user = await User.getUserById(session.user.id);

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      message: "User profile fetched successfully",
      data: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        phoneNumber: user.phoneNumber ?? null,
        address: user.address ?? null,
        psychiatristInfo: user.psychiatristInfo ?? null,
        googleCalendar: {
          connected: Boolean(user.googleCalendar?.connected),
          providerEmail: user.googleCalendar?.providerEmail ?? null,
          connectedAt: user.googleCalendar?.connectedAt ?? null,
          updatedAt: user.googleCalendar?.updatedAt ?? null,
        },
      },
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch user profile";

    return NextResponse.json({ message }, { status: 500 });
  }
}
