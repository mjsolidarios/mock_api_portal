import { NextResponse } from "next/server";
import { ZodError } from "zod";
import {
  createTesterGame,
  createTesterGameSchema,
  isKnownPrismaMissingReference
} from "@/lib/games";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const games = await prisma.game.findMany({
    orderBy: {
      title: "asc"
    },
    include: {
      artifacts: {
        select: {
          id: true,
          name: true,
          rarity: true
        }
      }
    }
  });

  return NextResponse.json({ games });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = await createTesterGame(createTesterGameSchema.parse(body));

    return NextResponse.json(
      {
        status: "created",
        game: result.game,
        mockUnlock: result.mockUnlock
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          status: "invalid_request",
          message: "Game submission is missing required fields or contains invalid values.",
          issues: error.flatten().fieldErrors
        },
        { status: 400 }
      );
    }

    if (isKnownPrismaMissingReference(error)) {
      return NextResponse.json(
        {
          status: "seed_required",
          message: "Seed demo users before creating tester games."
        },
        { status: 409 }
      );
    }

    throw error;
  }
}
