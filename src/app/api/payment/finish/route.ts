import { NextResponse } from "next/server";

export async function GET(req: Request) {
	try {
		const url = new URL(req.url);
		const orderId = url.searchParams.get("order_id") || url.searchParams.get("orderId");
		const txStatus = url.searchParams.get("transaction_status") || url.searchParams.get("status_code") || "";

		const redirectUrl = new URL(`/bookinglist${orderId ? `?order_id=${orderId}&transaction_status=${txStatus}` : ""}`, req.url);
		return NextResponse.redirect(redirectUrl);
	} catch (err) {
		return NextResponse.json({ message: "Invalid request" }, { status: 400 });
	}
}

