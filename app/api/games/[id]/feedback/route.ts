import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { feedbackSchema } from "@/lib/feedback";
import { prisma } from "@/lib/prisma";

type FeedbackRouteContext = {
  params: {
    id: string;
  };
};

export async function POST(request: Request, { params }: FeedbackRouteContext) {
  const body = await request.json().catch(() => null);
  const parsed = feedbackSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        message: "Feedback requires a 1-5 rating and an 8-500 character comment.",
        issues: parsed.error.flatten()
      },
      { status: 400 }
    );
  }

  const game = await prisma.game.findUnique({
    where: {
      id: params.id
    },
    select: {
      id: true
    }
  });

  if (!game) {
    return NextResponse.json({ message: "Game not found." }, { status: 404 });
  }

  const userId = parsed.data.userId || null;

  if (userId) {
    const user = await prisma.user.findUnique({
      where: {
        id: userId
      },
      select: {
        id: true
      }
    });

    if (!user) {
      return NextResponse.json({ message: "User not found." }, { status: 404 });
    }
  }

  const feedback = await prisma.feedback.create({
    data: {
      gameId: params.id,
      userId,
      rating: parsed.data.rating,
      comment: parsed.data.comment
    }
  });

  revalidatePath(`/games/${params.id}`);
  if (userId) {
    revalidatePath(`/profile/${userId}`);
  }

  return NextResponse.json({ feedback }, { status: 201 });
}
