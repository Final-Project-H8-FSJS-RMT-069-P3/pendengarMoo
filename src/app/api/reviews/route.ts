// src/app/api/reviews/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getDB } from "@/server/config/mongodb";
import Review from "@/server/models/Review";
import { IUserBooking } from "@/server/models/UserBooking";
import { ObjectId } from "mongodb";
import { z } from "zod";

const reviewPayloadSchema = z.object({
  bookingId: z.string().length(24, "Booking ID must be a valid ObjectId"),
  rating: z
    .number()
    .min(1, "Rating must be at least 1")
    .max(5, "Rating cannot be more than 5"),
  comment: z
    .string()
    .trim()
    .min(1, "Comment is required")
    .max(500, "Comment cannot exceed 500 characters"),
});

// ─── POST /api/reviews  (submit review) ───────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const parsed = reviewPayloadSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json(
        {
          message:
            parsed.error.flatten().fieldErrors.bookingId?.[0] ??
            parsed.error.flatten().fieldErrors.rating?.[0] ??
            parsed.error.flatten().fieldErrors.comment?.[0] ??
            "Invalid review payload",
        },
        { status: 400 },
      );
    }

    const { bookingId, rating, comment } = parsed.data;

    const userId = session.user.id as string;
    const userName = session.user.name ?? "Anonymous";

    const db = await getDB();
    const booking = await db.collection<IUserBooking>("UserBookings").findOne({
      _id: new ObjectId(bookingId),
      userId: new ObjectId(userId),
      isDone: true,
    });

    if (!booking) {
      return NextResponse.json(
        { message: "Booking tidak ditemukan atau belum selesai" },
        { status: 404 },
      );
    }

    const alreadyReviewed = await Review.hasReviewed(userId, bookingId);
    if (alreadyReviewed) {
      return NextResponse.json(
        { message: "Kamu sudah memberikan review untuk sesi ini" },
        { status: 409 },
      );
    }

    const review = await Review.createReview({
      userId: new ObjectId(userId),
      staffId: booking.staffId,
      bookingId: new ObjectId(bookingId),
      rating,
      comment: comment.trim(),
    });

    return NextResponse.json(
      { message: "Review berhasil disimpan", data: review, userName },
      { status: 201 },
    );
  } catch (err) {
    console.error("[POST /api/reviews]", err);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}

// ─── GET /api/reviews  (ambil semua review untuk home page) ───────────────────
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const rawLimit = Number(searchParams.get("limit") ?? 20);
    const limit = Number.isNaN(rawLimit) ? 20 : rawLimit;

    const raw = await Review.getAllReviews();
    const sorted = raw.sort((a, b) => {
      if (b.rating !== a.rating) return b.rating - a.rating;
      return b.createdAt.getTime() - a.createdAt.getTime();
    });

    const total = sorted.length;
    const selected = limit === 0 ? sorted : sorted.slice(0, Math.max(1, limit));

    const data = selected.map((r) => ({
      _id: r._id?.toString() ?? "",
      rating: r.rating,
      comment: r.comment,
      createdAt: r.createdAt?.toISOString?.() ?? new Date().toISOString(),
      userName: r.user?.name ?? "Anonim",
    }));

    return NextResponse.json({ data, total });
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to fetch reviews", error: String(error) },
      { status: 500 },
    );
  }
}
