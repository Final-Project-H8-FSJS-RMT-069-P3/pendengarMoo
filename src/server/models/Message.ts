import { ObjectId } from "mongodb";
import { IUser } from "./User";
import { getDB } from "../config/mongodb";
import { NotFoundError } from "../helpers/CustomError";



export interface IRoom {
    _id: ObjectId;
    roomName: string;
    userId: ObjectId;
    user?: IUser;
    staffId: ObjectId;
    staff?: IUser;
}

export interface IMessage {
    _id: ObjectId;
    roomId: ObjectId;
    room?: IRoom;
    senderId: ObjectId;
    sender?: IUser;
    text: string;
    createdAt: Date;
}


export default class Message {
    static async getRoomCollection() {
        const db = await getDB();
        const collection = db.collection<IRoom>("rooms");
        return collection;
    }

    static async getMessageCollection() {
        const db = await getDB();
        const collection = db.collection<IMessage>("messages");
        return collection;
    }

    static async createRoom(room: IRoom): Promise<string> {
        const collection = await this.getRoomCollection();
        await collection.insertOne(room);
        return "Room created successfully";
    }

    static async getRoomById(roomId: string): Promise<IRoom | null> {
        const collection = await this.getRoomCollection();
        // const room = await collection.findOne({ _id: new ObjectId(roomId) });
        // return room;
        if (!ObjectId.isValid(roomId)) {
            throw new NotFoundError("Room not found");
        }
        const room = await collection.aggregate([
            { $match: { _id: new ObjectId(roomId) } },
            { $lookup: {
                from: "Users",
                localField: "userId",
                foreignField: "_id",
                as: "user"
            }},
            { $unwind: "$user" },
            { $lookup: {
                from: "Users",
                localField: "staffId",
                foreignField: "_id",
                as: "staff"
            }},
            { $unwind: "$staff" }
        ]).toArray() as IRoom[];
        return room[0] || null;
    }

    static async getRoomByRoomName(roomName: string): Promise<IRoom | null> {
        const collection = await this.getRoomCollection();
        const room = await collection.aggregate([
            { $match: { roomName: { $regex: roomName, $options: "i" } } },
            { $lookup: {
                from: "Users",
                localField: "userId",
                foreignField: "_id",
                as: "user"
            }},
            { $unwind: "$user" },
            { $lookup: {
                from: "Users",
                localField: "staffId",
                foreignField: "_id",
                as: "staff"
            }},
            { $unwind: "$staff" }
        ]).toArray() as IRoom[];
        return room[0] || null;
    }

    static async createMessage(message: IMessage): Promise<string> {
        const collection = await this.getMessageCollection();
        await collection.insertOne(message);
        return "Message created successfully";
    }

    static async getMessagesByRoomId(roomId: string): Promise<IMessage[]> {
        const collection = await this.getMessageCollection();
        const roomCollection = await this.getRoomCollection();
        const room = await roomCollection.findOne({ _id: new ObjectId(roomId) });
        if (!room) {
            throw new NotFoundError("Room not found");
        }
        const messages = await collection.aggregate([
            { $match: { roomId: room._id } },
            {
                $lookup: {
                    from: "Users",
                    localField: "senderId",
                    foreignField: "_id",
                    as: "sender"
                }
            },
            { $unwind: "$sender" },
            {
                $lookup: {
                    from: "rooms",
                    localField: "roomId",
                    foreignField: "_id",
                    as: "room"
                }
            },
            { $unwind: "$room" },
            { $sort: { createdAt: -1 } }
        ]).toArray() as IMessage[];
        return messages.reverse();
    }
}