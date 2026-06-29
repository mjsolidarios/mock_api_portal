import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const activeUserCookie = "portal_active_user_id";

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      {
        status: "invalid_request",
        message: "Request body must be valid JSON."
      },
      { status: 400 }
    );
  }

  const userId = typeof body === "object" && body !== null ? (body as { userId?: unknown }).userId : null;

  if (typeof userId !== "string" || !userId.trim()) {
    return NextResponse.json(
      {
        status: "invalid_request",
        message: "Missing userId."
      },
      { status: 400 }
    );
  }

  const user = await prisma.user.findUnique({
    where: {
      id: userId
    },
    select: {
      id: true
    }
  });

  if (!user) {
    return NextResponse.json(
      {
        status: "not_found",
        message: "User not found."
      },
      { status: 404 }
    );
  }

  const response = NextResponse.json({
    status: "selected",
    userId: user.id
  });

  response.cookies.set(activeUserCookie, user.id, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30
  });

  return response;
}
