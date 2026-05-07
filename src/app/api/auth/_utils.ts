import { NextResponse } from "next/server";
import { z } from "zod";
import { CustomError } from "@/server/helpers/CustomError";

export const AUTH_COOKIE_NAME = process.env.AUTH_COOKIE_NAME ?? "access_token";
export const AUTH_PROXY_BASE_URL = process.env.AUTH_PROXY_BASE_URL?.replace(/\/$/, "") ?? "";

export const loginSchema = z.object({
  email: z.email("Email is required"),
  password: z.string().min(1, "Password is required"),
});

export const registerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.email("Email is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  phoneNumber: z.string().min(1, "Phone number is required"),
  address: z.string().min(1, "Address is required"),
  role: z.enum(["user", "psychiatrist"]).optional().default("user"),
});

export function withAuthCookie(response: NextResponse, token: string): NextResponse {
  response.cookies.set(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return response;
}

export function clearAuthCookie(response: NextResponse): NextResponse {
  response.cookies.set(AUTH_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  return response;
}

export async function parseJsonBody(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    throw new CustomError("Invalid JSON request body", 400);
  }
}

export function toErrorResponse(error: unknown): NextResponse {
  if (error instanceof z.ZodError) {
    return NextResponse.json(
      {
        message: "Validation error",
        errors: error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        })),
      },
      { status: 400 }
    );
  }

  if (error instanceof CustomError) {
    return NextResponse.json({ message: error.message }, { status: error.status });
  }

  const message = error instanceof Error ? error.message : "Internal server error";
  return NextResponse.json({ message }, { status: 500 });
}

export async function proxyAuthRequest(path: string, payload: unknown): Promise<{ status: number; data: unknown }> {
  const response = await fetch(`${AUTH_PROXY_BASE_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  const rawBody = await response.text();

  let data: unknown = null;
  if (rawBody) {
    try {
      data = JSON.parse(rawBody);
    } catch {
      data = { message: rawBody };
    }
  }

  return { status: response.status, data };
}

export function extractToken(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  const maybeTokenPayload = payload as {
    access_token?: unknown;
    token?: unknown;
    data?: { access_token?: unknown; token?: unknown };
  };

  const value =
    maybeTokenPayload.access_token ??
    maybeTokenPayload.token ??
    maybeTokenPayload.data?.access_token ??
    maybeTokenPayload.data?.token;

  return typeof value === "string" ? value : null;
}
