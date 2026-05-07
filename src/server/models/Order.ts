import { ObjectId } from "mongodb";
import { getDB } from "../config/mongodb";
// disesuikan aja nnti dengan setup nya yaa 

//yang di comment itu intinya untuk menggunakan ObjectId dari MongoDB, 
//tapi karena kita belum setup MongoDB, jadi aku comment dulu. Nanti kalau udah setup MongoDB, 
//tinggal uncomment aja dan sesuaikan dengan setup nya yaa

export interface IOrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

export interface IOrder {
  _id?: ObjectId;
  userId: string;
  orderId: string;
  bookingId?: ObjectId;
  items: IOrderItem[];
  totalAmount: number;
  status: "pending" | "success" | "failed";
  paymentToken?: string;
  customerDetails: {
    first_name: string;
    email: string;
  };
  createdAt?: Date;
  updatedAt?: Date;
}

export default class Order {
  static async getCollection() {
    const db = await getDB();
    return db.collection<IOrder>("Orders");
  }

  static async createOrder(
    payload: Omit<IOrder, "_id" | "createdAt" | "updatedAt">,
  ) {
    const collection = await this.getCollection();

    const newOrder: Omit<IOrder, "_id"> = {
      ...payload,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await collection.insertOne(newOrder);

    return {
      _id: result.insertedId,
      ...newOrder,
    };
  }

  static async getOrdersByUserId(userId: string) {
    const collection = await this.getCollection();

    const orders = await collection
      .find({ userId })
      .sort({ createdAt: -1 })
      .toArray();

    return orders;
  }

  static async getOrderById(orderId: string) {
    const collection = await this.getCollection();

    const order = await collection.findOne({ orderId });

    return order;
  }

  static async updateOrderStatus(
    orderId: string,
    status: "pending" | "success" | "failed",
  ) {
    const collection = await this.getCollection();

    const result = await collection.updateOne(
      { orderId },
      {
        $set: {
          status,
          updatedAt: new Date(),
        },
      },
    );

    return result;
  }
}
