import { ObjectId, WithId } from "mongodb";
import { getDB } from "../config/mongodb";
import { comparePassword, hashPassword } from "../helpers/bcrypt";
import { signToken } from "../helpers/jwt";
import { NotFoundError, UnauthorizedError } from "../helpers/CustomError";
import { IReview } from "./Review";



export interface IUserGoogleCalendar {
    connected: boolean;
    provider: "google";
    providerEmail?: string;
    accessToken?: string;
    refreshToken?: string;
    scope?: string;
    tokenType?: string;
    expiryDate?: number;
    connectedAt?: Date;
    updatedAt: Date;
}

export interface IUser {
    _id: ObjectId;
    name: string;
    email: string;
    password: string;
    role: "user" | "psychiatrist";
    phoneNumber: string;
    address: string;
    googleCalendar?: IUserGoogleCalendar;
    psychiatristInfo?: {
        certificate?: string;
        experience?: number;
        imageUrl?: string;
        roleSpecialist?: string;
        speciality?: string[];
        about?: string;
        paket?: IPrice[];
        mode?: "online" | "offline" | "online & offline";
        scheduleDays?: string[];
        scheduleTimes?: string[];
        reviews?: IReview[];
    };
}

interface IPrice {
    price: number;
    type: "videocall" | "chat-only" | "offline";
}


export default class User {
    static async getCollection() {
        const db = await getDB();
        const collection = db.collection<IUser>("Users");
        return collection;
    }

    static async register(user: IUser): Promise<string> {
        const collection = await this.getCollection();
        user.password = hashPassword(user.password);
        const result = await collection.insertOne(user);
        return "User registered successfully";
    }

    static async getUserById(id: string): Promise<WithId<IUser> | null> {
        const collection = await this.getCollection();
        const user = await collection.findOne({ _id: new ObjectId(id) });
        if (!user) {
            throw new NotFoundError("User not found");
        }
        return user;
    }

    static async getUserByEmail(email: string): Promise<WithId<IUser> | null> {
        const collection = await this.getCollection();
        const user = await collection.findOne({ email });
        if (!user) {
            throw new NotFoundError("User not found");
        }
        return user;
    }

    static async login(input: Pick<IUser, "email" | "password">): Promise<string> {
        const collection = await this.getCollection();
        const user = await collection.findOne({ email: input.email });
        if (!user) {
            throw new NotFoundError("User not found");
        }
        const isPasswordValid = comparePassword(input.password, user.password);
        if (!isPasswordValid) {
            throw new UnauthorizedError("Invalid password");
        }
        const payload = {
            _id: user._id,
            email: user.email,
            role: user.role
        };
        const token = signToken(payload);
        return token;
    }

    static async getAllPsychiatrists(): Promise<WithId<IUser>[]> {
        const collection = await this.getCollection();
        const psychiatrists = await collection.find({ role: "psychiatrist" }).toArray();
        return psychiatrists;
    }

    static async getPsychiatristById(id: string): Promise<WithId<IUser> | null> {
        const collection = await this.getCollection();
        const psychiatrist = await collection.aggregate([
            { $match: { _id: new ObjectId(id), role: "psychiatrist" } },
            { $lookup: { from: "Reviews", localField: "_id", foreignField: "staffId", as: "reviews" } }
        ]).toArray() as WithId<IUser>[];
        if (!psychiatrist.length) {
            throw new NotFoundError("Psychiatrist not found");
        }
        return psychiatrist[0];
    }

    static async createPsychiatristInfo(id: string, info: Partial<IUser["psychiatristInfo"]>): Promise<string> {
        const collection = await this.getCollection();
        const result = await collection.updateOne(
            { _id: new ObjectId(id) },
            { $set: { psychiatristInfo: info } }
        );
        if (result.matchedCount === 0) {
            throw new NotFoundError("User not found");
        }
        return "Psychiatrist info created successfully";
    }

    static async updatePsychiatristInfo(id: string, info: Partial<IUser["psychiatristInfo"]>): Promise<string> {
        const collection = await this.getCollection();
        const result = await collection.updateOne(
            { _id: new ObjectId(id) },
            { $set: { psychiatristInfo: info } }
        );
        if (result.matchedCount === 0) {
            throw new NotFoundError("User not found");
        }
        return "Psychiatrist info updated successfully";
    }

    static async updateGoogleCalendarConnection(
        id: string,
        payload: Omit<IUserGoogleCalendar, "updatedAt"> & { updatedAt?: Date },
    ): Promise<string> {
        const collection = await this.getCollection();
        const result = await collection.updateOne(
            { _id: new ObjectId(id) },
            {
                $set: {
                    googleCalendar: {
                        ...payload,
                        updatedAt: payload.updatedAt ?? new Date(),
                    },
                },
            }
        );
        if (result.matchedCount === 0) {
            throw new NotFoundError("User not found");
        }
        return "Google Calendar connected successfully";
    }

    static async clearGoogleCalendarConnection(id: string): Promise<string> {
        const collection = await this.getCollection();
        const result = await collection.updateOne(
            { _id: new ObjectId(id) },
            { $unset: { googleCalendar: "" } }
        );
        if (result.matchedCount === 0) {
            throw new NotFoundError("User not found");
        }
        return "Google Calendar disconnected successfully";
    }
    
}