import { NextResponse } from "next/server";
import { signOut } from "@/lib/auth";

export async function POST() {
	await signOut({ redirect: false });
	return NextResponse.json({ message: "Logged out successfully" }, { status: 200 });
}
