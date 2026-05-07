import { ObjectId } from "mongodb";
import { getDB } from "../config/mongodb";
import { IUser } from "./User";
import { IUserBooking } from "./UserBooking";
import { NotFoundError } from "../helpers/CustomError";

export interface IReview {
    _id?: ObjectId;
    userId: ObjectId;
    user?: IUser;
    staffId: ObjectId;
    staff?: IUser;
    bookingId: ObjectId;
    rating: number;
    comment: string;
    createdAt: Date;
}

export default class Review {
    static async getCollection() {
        const db = await getDB();
        const collection = db.collection<IReview>("Reviews");
        return collection;
    }

    static async bookingCollection() {
        const db = await getDB();
        const collection = db.collection<IUserBooking>("UserBookings");
        return collection;
    }

    static async getAllReviews(): Promise<IReview[]> {
        const collection = await this.getCollection();
        return collection.aggregate([
            {
                $lookup: {
                    from: "Users",
                    localField: "userId",
                    foreignField: "_id",
                    as: "user",
                },
            },
            {
                $lookup: {
                    from: "Users",
                    localField: "staffId",
                    foreignField: "_id",
                    as: "staff",
                },
            },
            { $unwind: "$user" },
            { $unwind: "$staff" },
            { $sort: { createdAt: -1 } },
        ]).toArray() as Promise<IReview[]>;
    }

    static async getReviewedBookingIds(userId: string): Promise<string[]> {
        const collection = await this.getCollection();
        const reviews = await collection
            .find({ userId: new ObjectId(userId) }, { projection: { bookingId: 1 } })
            .toArray();

        return reviews.map((review) => review.bookingId.toString());
    }

    static async hasReviewed(userId: string, bookingId: string) {
        const collection = await this.getCollection();
        const existing = await collection.findOne({
            userId: new ObjectId(userId),
            bookingId: new ObjectId(bookingId),
        });

        return !!existing;
    }

    static async getReviewsByStaffId(staffId: string): Promise<IReview[]> {
        const collection = await this.getCollection();
        const reviews = await collection.aggregate([
            { $match: { staffId: new ObjectId(staffId) } },
            { $lookup: {
                from: "Users",
                localField: "userId",
                foreignField: "_id",
                as: "user"
            }},
            { $lookup: {
                from: "Users",
                localField: "staffId",
                foreignField: "_id",
                as: "staff"
            }},
            { $unwind: "$user" },
            { $unwind: "$staff" }
        ]).toArray() as IReview[];
        return reviews;
    }

    static async createReview(data: Omit<IReview, "_id" | "createdAt">): Promise<string> {
        const collection = await this.getCollection();
        const bookingCollection = await this.bookingCollection();

        const booking = await bookingCollection.findOne({
            _id: new ObjectId(data.bookingId),
            userId: new ObjectId(data.userId),
            isDone: true,
        });

        if (!booking) {
            throw new NotFoundError("Booking not found or not completed");
        }

        await collection.insertOne({
            ...data,
            createdAt: new Date()
         });
        return "Review created successfully";
    }


}