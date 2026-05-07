import { ObjectId, WithId } from "mongodb";
import { IUser } from "./User";
import { getDB } from "../config/mongodb";
import { NotFoundError } from "../helpers/CustomError";

export interface IFormBrief {
  _id: ObjectId;
  userId: ObjectId;
  user?: IUser;
  brief: string;
  result: string;
  notes?: INote[];
  createdAt: Date;
}

interface INote {
  staffId: ObjectId;
  staff?: IUser;
  content: string;
  createdAt: Date;
}

const serializeFormBrief = (formBrief: WithId<IFormBrief>) => ({
  ...formBrief,
  _id: formBrief._id.toString(),
  userId: formBrief.userId.toString(),
  createdAt: formBrief.createdAt.toISOString(),
  notes: formBrief.notes?.map((note) => ({
    ...note,
    staffId: note.staffId.toString(),
    createdAt: note.createdAt.toISOString(),
  })),
});

export default class FormBrief {
  static async getCollection() {
    const db = await getDB();
    const collection = db.collection<IFormBrief>("formBriefs");
    return collection;
  }

  static async create(formBrief: IFormBrief): Promise<string> {
    const collection = await this.getCollection();
    await collection.insertOne(formBrief);
    return "Form brief created successfully";
  }

  static async getFormBriefByUserId(userId: string): Promise<IFormBrief[]> {
    const collection = await this.getCollection();
    if (!userId) {
      throw new NotFoundError("User not found");
    }
    const targetUserId = ObjectId.isValid(userId) ? new ObjectId(userId) : userId;
    const formBriefs = await collection
      .find({
        $or: [{ userId: targetUserId }, { userId }],
      })
      .sort({ createdAt: -1 })
      .toArray();

    return formBriefs.map((formBrief) =>
      serializeFormBrief(formBrief as WithId<IFormBrief>)
    ) as unknown as IFormBrief[];
  }
  static async getFormBriefById(id: string): Promise<IFormBrief | null> {
    if (!id || !ObjectId.isValid(id)) return null;

    const collection = await this.getCollection();
    const result = await collection.findOne({ _id: new ObjectId(id) });

    return result ? (serializeFormBrief(result) as unknown as IFormBrief) : null;
  }

  static async addNoteToFormBrief(formBriefId: string, note: INote): Promise<string> {
    const collection = await this.getCollection();
    const result = await collection.updateOne(
      { _id: new ObjectId(formBriefId) },
      { $push: { notes: note } }
    );
    if (!result.matchedCount) {
      throw new NotFoundError("Form brief not found");
    }
    return "Note added successfully";
  }

}
