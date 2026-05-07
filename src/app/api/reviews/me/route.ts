// src/app/api/reviews/me/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import Review from "@/server/models/Review";

/**
 * GET /api/reviews/me
 * Mengembalikan array bookingId yang sudah pernah di-review oleh user yang login.
 * Digunakan di booking list untuk menentukan apakah tombol "Beri Review" perlu ditampilkan.
 */
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id as string;
    const reviewedBookingIds = await Review.getReviewedBookingIds(userId);

    return NextResponse.json({ data: reviewedBookingIds });
  } catch (err) {
    console.error("[GET /api/reviews/me]", err);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
