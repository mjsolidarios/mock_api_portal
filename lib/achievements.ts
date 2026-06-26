import { Prisma } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

export const unlockArtifactSchema = z.object({
  sessionId: z.string().min(1),
  playerId: z.string().min(1),
  gameId: z.string().min(1),
  artifactId: z.string().min(1),
  developerKey: z.string().min(1)
});

export type UnlockArtifactInput = z.infer<typeof unlockArtifactSchema>;

export type UnlockArtifactResult =
  | {
      status: "unlocked" | "already_unlocked";
      unlock: {
        id: string;
        unlockedAt: Date;
        artifact: {
          id: string;
          name: string;
          rarity: string;
        };
      };
    }
  | {
      status: "unauthorized" | "invalid_session" | "invalid_artifact";
      message: string;
    };

export async function unlockArtifact(input: UnlockArtifactInput): Promise<UnlockArtifactResult> {
  const developerKey = await prisma.developerApiKey.findFirst({
    where: {
      key: input.developerKey,
      gameId: input.gameId
    }
  });

  if (!developerKey) {
    return {
      status: "unauthorized",
      message: "Developer key is not authorized for this game."
    };
  }

  const session = await prisma.gameSession.findFirst({
    where: {
      id: input.sessionId,
      userId: input.playerId,
      gameId: input.gameId,
      expiresAt: {
        gt: new Date()
      }
    }
  });

  if (!session) {
    return {
      status: "invalid_session",
      message: "Session must exist, belong to the player and game, and be active."
    };
  }

  const artifact = await prisma.artifact.findFirst({
    where: {
      id: input.artifactId,
      gameId: input.gameId
    },
    select: {
      id: true,
      name: true,
      rarity: true
    }
  });

  if (!artifact) {
    return {
      status: "invalid_artifact",
      message: "Artifact must exist and belong to the submitted game."
    };
  }

  const existing = await prisma.unlockedArtifact.findUnique({
    where: {
      userId_artifactId: {
        userId: input.playerId,
        artifactId: input.artifactId
      }
    },
    include: {
      artifact: {
        select: {
          id: true,
          name: true,
          rarity: true
        }
      }
    }
  });

  if (existing) {
    return {
      status: "already_unlocked",
      unlock: {
        id: existing.id,
        unlockedAt: existing.unlockedAt,
        artifact: existing.artifact
      }
    };
  }

  const unlock = await prisma.unlockedArtifact.create({
    data: {
      userId: input.playerId,
      artifactId: input.artifactId,
      sessionId: input.sessionId
    },
    include: {
      artifact: {
        select: {
          id: true,
          name: true,
          rarity: true
        }
      }
    }
  });

  return {
    status: "unlocked",
    unlock: {
      id: unlock.id,
      unlockedAt: unlock.unlockedAt,
      artifact: unlock.artifact
    }
  };
}

export function isKnownPrismaConflict(error: unknown) {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
}
