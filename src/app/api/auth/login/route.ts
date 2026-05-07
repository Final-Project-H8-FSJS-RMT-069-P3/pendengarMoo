import { NextResponse } from "next/server";
import { AuthError } from "next-auth";
import { signIn } from "@/lib/auth";
import {
	loginSchema,
	parseJsonBody,
	toErrorResponse,
} from "../_utils";

export async function POST(request: Request) {
	try {
		const body = await parseJsonBody(request);
		const payload = loginSchema.parse(body);

		await signIn("credentials", {
			email: payload.email,
			password: payload.password,
			redirect: false,
		});

		return NextResponse.json({ message: "Login success" }, { status: 200 });
	} catch (error) {
		if (error instanceof AuthError) {
			return NextResponse.json({ message: "Invalid email or password" }, { status: 401 });
		}

		return toErrorResponse(error);
	}
}
