import { ObjectId } from "mongodb";
import { getDB } from "../config/mongodb";

export interface IAppReview {
  _id?: ObjectId;
  userId: string;
  userName: string;
  bookingId: string; // referensi ke UserBookings._id
  rating: number; // 1–5
  comment: string;
  createdAt?: Date;
}

export default class AppReview {
  static async getCollection() {
    const db = await getDB();
    return db.collection<IAppReview>("AppReviews");
  }

  /** Simpan review baru */
  static async createReview(payload: Omit<IAppReview, "_id" | "createdAt">) {
    const collection = await this.getCollection();
    const doc: Omit<IAppReview, "_id"> = { ...payload, createdAt: new Date() };
    const result = await collection.insertOne(doc);
    return { _id: result.insertedId, ...doc };
  }

  /** Cek apakah user sudah pernah review booking ini */
  static async hasReviewed(userId: string, bookingId: string) {
    const collection = await this.getCollection();
    const existing = await collection.findOne({ userId, bookingId });
    return !!existing;
  }

  /** Ambil semua review, terbaru duluan */
  static async getAllReviews() {
    const collection = await this.getCollection();
    return collection.find({}).sort({ createdAt: -1 }).toArray();
  }
}
