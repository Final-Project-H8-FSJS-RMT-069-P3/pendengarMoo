import { getDB } from "@/server/config/mongodb";
import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { bookingId, orderId } = await req.json();
  const db = await getDB();

  let order = null as any;
  if (orderId) {
    order = await db.collection("Orders").findOne({ orderId, status: "pending" });

    if (!order) {
      const existingOrder = await db.collection("Orders").findOne({ orderId });
      if (existingOrder?.status === "success") {
        return NextResponse.json(
          { message: "Order already paid" },
          { status: 409 }
        );
      }
      if (existingOrder && existingOrder.status !== "pending") {
        return NextResponse.json(
          { message: `Order is ${existingOrder.status}` },
          { status: 409 }
        );
      }
    }
  } else if (bookingId) {
    if (!ObjectId.isValid(bookingId)) {
      return NextResponse.json(
        { message: "Invalid booking id" },
        { status: 400 }
      );
    }

    const bookingObjectId = new ObjectId(bookingId);
    order = await db.collection("Orders").findOne({ bookingId: bookingObjectId, status: "pending" });

    if (!order) {
      const latestOrder = await db
        .collection("Orders")
        .find({ bookingId: bookingObjectId })
        .sort({ createdAt: -1 })
        .limit(1)
        .next();

      if (latestOrder?.status === "success") {
        return NextResponse.json(
          { message: "Booking already paid" },
          { status: 409 }
        );
      }

      if (latestOrder) {
        return NextResponse.json(
          { message: `Order is ${latestOrder.status}` },
          { status: 409 }
        );
      }

      const booking = await db.collection("UserBookings").findOne({ _id: bookingObjectId });
      if (booking?.isPaid) {
        return NextResponse.json(
          { message: "Booking already paid" },
          { status: 409 }
        );
      }
    }
  }

  if (!order) {
    return NextResponse.json(
      { message: "No pending order found for this booking" },
      { status: 404 }
    );
  }

  return NextResponse.json({
    token: order.paymentToken,
    orderId: order.orderId,
  });
}