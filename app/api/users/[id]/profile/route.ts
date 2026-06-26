import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type ProfileRouteContext = {
  params: {
    id: string;
  };
};

export async function GET(_request: Request, { params }: ProfileRouteContext) {
  const user = await prisma.user.findUnique({
    where: {
      id: params.id
    },
    include: {
      unlocks: {
        orderBy: {
          unlockedAt: "desc"
        },
        include: {
          artifact: {
            include: {
              game: {
                select: {
                  id: true,
                  title: true
                }
              }
            }
          }
        }
      }
    }
  });

  if (!user) {
    return NextResponse.json({ message: "User not found." }, { status: 404 });
  }

  return NextResponse.json({ user });
}
