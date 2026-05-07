import 'dotenv/config';
import { Db, MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI || "mongodb://localhost:27017";
const dbName = process.env.MONGODB_DB || "final-project-db";

export const client: MongoClient = new MongoClient(uri);
let db: Db;

export async function connect(): Promise<Db> {
    await client.connect();
    db = client.db(dbName);

    return db;
}

export async function getDB(): Promise<Db> {
    if (!db) {
        return connect();
    }
    return db;
}