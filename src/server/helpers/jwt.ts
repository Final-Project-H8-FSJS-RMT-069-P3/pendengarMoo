import Jwt from "jsonwebtoken"
import { ObjectId } from "mongodb"

interface IJwtPayload {
    _id: ObjectId;
    email: string;
    role: "user" | "psychiatrist";
}

const secretKey = process.env.JWT_SECRET_KEY || "final-project-secret-key";

export function signToken(payload: IJwtPayload): string {
    const token = Jwt.sign(payload, secretKey)
    return token
}

export function verifyToken(token: string): IJwtPayload {
    try {
        const decoded = Jwt.verify(token, secretKey) as IJwtPayload;
        return decoded;
    } catch (error) {
        throw new Error("Invalid token");
    }
}