import { NextResponse } from "next/server";
import midtransClient from "midtrans-client";
import { auth } from "@/lib/auth";
import { getDB } from "../../../server/config/mongodb"; //<-- import dari src yg bener
import { ObjectId } from "mongodb"; //<-- import dari src yg bener
import User from "@/server/models/User";

export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "USER") {
      return NextResponse.json(
        { message: "Doctors cannot book sessions" },
        { status: 403 },
      );
    }

    const body = await req.json();
    const { staffId, formBriefId, date, sessionDuration, amount, sessionType } =
      body;

    if (!staffId || !date) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 },
      );
    }

    // validate staffId is a valid ObjectId
    if (!ObjectId.isValid(staffId)) {
      return NextResponse.json({ message: "Invalid staffId" }, { status: 400 });
    }

    // validate date is a valid ISO datetime
    const dateObj = new Date(date);
    if (Number.isNaN(dateObj.getTime())) {
      return NextResponse.json({ message: "Invalid date" }, { status: 400 });
    }

    const db = await getDB();

    const mapType =
      sessionType === "video"
        ? "videocall"
        : sessionType === "chat"
          ? "chat-only"
          : "offline";

    const bookingData = {
      userId: new ObjectId(session.user.id),
      staffId: new ObjectId(staffId),
      formBriefId: formBriefId ? new ObjectId(formBriefId) : null,
      date: dateObj,
      sessionDuration: parseInt(sessionDuration) || 30,
      amount: Math.round(parseFloat(amount) || 0),
      type: mapType,
      isPaid: false,
      isDone: false,
      createdAt: new Date(),
    };

    // Prevent double-booking for the exact same staff and datetime
    const existing = await db.collection("UserBookings").findOne({
      staffId: new ObjectId(staffId),
      date: bookingData.date,
    });
    if (existing) {
      return NextResponse.json(
        { message: "Time slot already booked" },
        { status: 409 },
      );
    }

    // Do NOT create the booking yet. Create an Order that carries the booking payload
    // and only create the actual UserBookings record after payment is confirmed.

    console.log("aku disini");

    let userData = null;
    let doctorData = null;
    try {
      userData = await User.getUserById(bookingData.userId.toString());
    } catch (e) {
      console.warn("Could not load user data for booking email:", e);
    }
    try {
      doctorData = await User.getUserById(bookingData.staffId.toString());
    } catch (e) {
      console.warn("Could not load doctor data for booking email:", e);
    }
    const bookingDate = bookingData.date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    const bookingTime = bookingData.date.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });

    const orderId = `ORDER-${new ObjectId().toString()}`;

    const snap = new midtransClient.Snap({
      isProduction: process.env.MIDTRANS_IS_PRODUCTION === "true",
      serverKey: process.env.MIDTRANS_SERVER_KEY || "",
      clientKey: process.env.MIDTRANS_CLIENT_KEY || "",
    });

    const parameter = {
      transaction_details: {
        order_id: orderId,
        gross_amount: bookingData.amount,
      },
      item_details: [
        {
          id: staffId,
          price: bookingData.amount,
          quantity: 1,
          name: `Consultation ${mapType}`,
        },
      ],
      customer_details: {
        first_name: userData?.name || "User",
        email: userData?.email || "",
      },
      credit_card: {
        secure: true,
      },
      callbacks: {
        finish: `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/payment/loading?orderId=${orderId}`,
      },
    };

    const transaction = await snap.createTransaction(parameter);

    if (!transaction.token) {
      console.error("Midtrans token missing:", transaction);
      throw new Error("Failed to get Midtrans token");
    }
    console.log("STEP: before insert order");
    await db.collection("Orders").insertOne({
      userId: new ObjectId(session.user.id),
      orderId,
      // booking will be created after payment confirmation
      bookingId: null,
      bookingPayload: bookingData,
      items: parameter.item_details,
      totalAmount: bookingData.amount,
      status: "pending",
      paymentToken: transaction.token,
      customerDetails: parameter.customer_details,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return NextResponse.json(
      {
        message: "Booking created successfully",
        orderId,
        redirect_url: transaction.redirect_url,
        token: transaction.token,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Booking Error:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
}
