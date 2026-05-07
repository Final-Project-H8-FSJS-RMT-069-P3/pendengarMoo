import {z} from "zod";

export const ReviewSchema = z.object({
    bookingId: z.string().length(24, "Booking ID must be a valid ObjectId"),
    userId: z.string().length(24, "User ID must be a valid ObjectId"),
    staffId: z.string().length(24, "Staff ID must be a valid ObjectId"),
    rating: z.number().min(1, "Rating must be at least 1").max(5, "Rating cannot be more than 5"),
    comment: z.string().min(1, "Comment is required").max(500, "Comment cannot exceed 500 characters")
});