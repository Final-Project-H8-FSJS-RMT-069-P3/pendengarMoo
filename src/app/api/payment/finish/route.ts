import { NextResponse } from "next/server";

export async function GET(req: Request) {
	try {
		const url = new URL(req.url);
		const orderId = url.searchParams.get("order_id") || url.searchParams.get("orderId");
		const redirectUrl = new URL(
			orderId ? `/payment/loading?orderId=${encodeURIComponent(orderId)}` : "/bookinglist",
			req.url,
		);
		return NextResponse.redirect(redirectUrl);
	} catch (err) {
		return NextResponse.json({ message: "Invalid request" }, { status: 400 });
	}
}

