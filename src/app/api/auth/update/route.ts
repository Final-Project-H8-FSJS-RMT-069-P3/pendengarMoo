import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import User from "@/server/models/User";

export async function PATCH(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, phoneNumber, address, psychiatristInfo } = body;

    console.log("=== PATCH UPDATE DIPANGGIL ===");
    console.log("Session role:", session.user.role);
    console.log("psychiatristInfo:", psychiatristInfo);

    // Update basic fields
    const collection = await User.getCollection();
    await collection.updateOne(
      { _id: new (await import("mongodb")).ObjectId(session.user.id) },
      { $set: { name, phoneNumber, address } }
    );

    if (psychiatristInfo && session.user.role === "DOCTOR") {
      console.log("=== MASUK BLOCK PSYCHIATRIST ===");
      console.log("psychiatristInfo.imageUrl:", psychiatristInfo.imageUrl);

      const user = await User.getUserById(session.user.id);
      console.log("User psychiatristInfo exists:", !!user?.psychiatristInfo);

      if (
        user?.psychiatristInfo &&
        Object.keys(user.psychiatristInfo).length > 0
      ) {
        console.log("Calling update method");
        await User.updatePsychiatristInfo(session.user.id, psychiatristInfo);
      } else {
        console.log("Calling create method");
        await User.createPsychiatristInfo(session.user.id, psychiatristInfo);
      }
    }

    return NextResponse.json({ message: "Profile updated" });
  } catch (err: any) {
    console.error("Profile update error:", err);
    const message =
      err instanceof Error ? err.message : "Failed to update profile";
    return NextResponse.json({ message }, { status: 500 });
  }
}
