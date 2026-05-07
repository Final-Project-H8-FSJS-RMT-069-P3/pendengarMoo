// src/app/api/reviews/me/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import Review from "@/server/models/Review";
import { ObjectId } from "mongodb";

/**
 * GET /api/reviews/me
 * Mengembalikan array bookingId yang sudah pernah di-review oleh user yang login.
 * Digunakan di booking list untuk menentukan apakah tombol "Beri Review" perlu ditampilkan.
 */
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id as string;
    const { searchParams } = new URL(req.url);
    const bookingId = searchParams.get("bookingId");

    if (bookingId) {
      if (!ObjectId.isValid(bookingId)) {
        return NextResponse.json({ message: "Invalid bookingId" }, { status: 400 });
      }

      const collection = await Review.getCollection();
      const review = await collection.findOne({
        userId: new ObjectId(userId),
        bookingId: new ObjectId(bookingId),
      });

      return NextResponse.json({ data: review ?? null });
    }

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
