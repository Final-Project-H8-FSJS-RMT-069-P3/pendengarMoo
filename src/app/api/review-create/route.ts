import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { ReviewSchema } from "@/server/validations/review";
import Review from "@/server/models/Review";
import { ObjectId } from "mongodb";

export async function POST(req: Request) {
    const session = await auth();
    if (!session || !session.user?.id) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "USER") {
        return NextResponse.json({ message: "Only users can create reviews" }, { status: 403 });
    }
    try {
        const body = await req.json();
        const result = ReviewSchema.safeParse(body);
        if (!result.success) {
            return NextResponse.json({ error: result.error.flatten().fieldErrors }, { status: 400 });
        }
        const { bookingId, userId = session.user.id, staffId, rating, comment } = result.data;
        const review = await Review.createReview({
            bookingId: new ObjectId(bookingId),
            userId: new ObjectId(userId),
            staffId: new ObjectId(staffId),
            rating,
            comment
        });
        return NextResponse.json({ message: "Review created successfully", review });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Failed to create review";
        return NextResponse.json({ message }, { status: 500 });
    }
}