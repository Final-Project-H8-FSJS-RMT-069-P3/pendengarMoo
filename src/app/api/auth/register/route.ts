import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import User from "@/server/models/User";
import { BadRequestError } from "@/server/helpers/CustomError";
import {
	parseJsonBody,
	registerSchema,
	toErrorResponse,
} from "../_utils";

export async function POST(request: Request) {
	try {
		const body = await parseJsonBody(request);
		const payload = registerSchema.parse(body);

		const collection = await User.getCollection();
		const existingUser = await collection.findOne({ email: payload.email });
		if (existingUser) {
			throw new BadRequestError("Email is already registered");
		}

		await User.register({
			_id: new ObjectId(),
			name: payload.name,
			email: payload.email,
			password: payload.password,
			role: payload.role,
			phoneNumber: payload.phoneNumber,
			address: payload.address,
		});

		return NextResponse.json({ message: "User registered successfully" }, { status: 201 });
	} catch (error) {
		return toErrorResponse(error);
	}
}
