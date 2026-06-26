import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type GameRouteContext = {
  params: {
    id: string;
  };
};

export async function GET(_request: Request, { params }: GameRouteContext) {
  const game = await prisma.game.findUnique({
    where: {
      id: params.id
    },
    include: {
      artifacts: true,
      feedbacks: {
        orderBy: {
          createdAt: "desc"
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              handle: true
            }
          }
        }
      }
    }
  });

  if (!game) {
    return NextResponse.json({ message: "Game not found." }, { status: 404 });
  }

  return NextResponse.json({ game });
}
