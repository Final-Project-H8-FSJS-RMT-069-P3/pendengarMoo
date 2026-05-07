import { NextRequest, NextResponse } from "next/server";
import midtransClient from "midtrans-client"
import { auth } from "@/lib/auth";
import Order from "@/server/models/Order";
import { ObjectId } from "mongodb";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { orderId, bookingId, grossAmount, items, customerDetails } = body;

    // Create Snap API instance
    const snap = new midtransClient.Snap({
      isProduction: process.env.MIDTRANS_IS_PRODUCTION === "true",
      serverKey: process.env.MIDTRANS_SERVER_KEY || "",
      clientKey: process.env.MIDTRANS_CLIENT_KEY || "",
    });

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

    const parameter = {
      transaction_details: {
        order_id: orderId,
        gross_amount: grossAmount,
      },
      item_details: items,
      customer_details: customerDetails,
      credit_card: {
        secure: true,
      },
      callbacks: {
        finish: `${baseUrl}/bookinglist`,
      },
    };

    const transaction = await snap.createTransaction(parameter);

    // Create Order record in database
    await Order.createOrder({
      userId: session.user.id,
      orderId,
      bookingId: new ObjectId(bookingId),
      items,
      totalAmount: grossAmount,
      status: "pending",
      paymentToken: transaction.token,
      customerDetails,
    });

    return NextResponse.json({
      token: transaction.token,
      redirect_url: transaction.redirect_url,
    });
  } catch (error: unknown) {
    console.error("Payment error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to create payment",
      },
      { status: 500 },
    );
  }
}
