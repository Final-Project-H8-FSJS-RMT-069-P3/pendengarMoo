import { getDB } from "@/server/config/mongodb";
import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { bookingId, orderId } = await req.json();
  const db = await getDB();

  let order = null;
  if (orderId) {
    order = await db.collection("Orders").findOne({ orderId, status: "pending" });
  } else if (bookingId) {
    order = await db.collection("Orders").findOne({ bookingId: new ObjectId(bookingId), status: "pending" });
  }

  if (!order) {
    return NextResponse.json(
      { message: "Order not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({
    token: order.paymentToken,
  });
}