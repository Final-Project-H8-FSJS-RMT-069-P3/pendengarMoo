import { NextResponse } from "next/server";
import User from "@/server/models/User";

export async function GET() {
  try {
    const doctors = await User.getAllPsychiatrists();

    const safeDoctors = doctors.map((doctor) => ({
      _id: doctor._id,
      name: doctor.name,
      email: doctor.email,
      role: doctor.role,
      phoneNumber: doctor.phoneNumber,
      address: doctor.address,
      psychiatristInfo: doctor.psychiatristInfo,
    }));

    return NextResponse.json({
      message: "Doctors fetched successfully",
      data: safeDoctors,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ message }, { status: 500 });
  }
}