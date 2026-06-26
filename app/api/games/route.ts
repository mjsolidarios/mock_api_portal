import { NextResponse } from "next/server";
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
