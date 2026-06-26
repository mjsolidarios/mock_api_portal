import { NextResponse } from "next/server";
import { unlockArtifact, unlockArtifactSchema } from "@/lib/achievements";

const statusCodeByResult = {
  unlocked: 201,
  already_unlocked: 200,
  unauthorized: 401,
  invalid_session: 400,
  invalid_artifact: 400
} as const;

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = unlockArtifactSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        status: "invalid_request",
        message: "Request body must include sessionId, playerId, gameId, artifactId, and developerKey.",
        issues: parsed.error.flatten()
      },
      { status: 400 }
    );
  }

  const result = await unlockArtifact(parsed.data);

  return NextResponse.json(result, {
    status: statusCodeByResult[result.status]
  });
}
