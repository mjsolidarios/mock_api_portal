import { randomUUID } from "node:crypto";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const imageUrlSchema = z
  .string()
  .trim()
  .min(1)
  .refine(
    (value) => {
      if (value.startsWith("/")) {
        return true;
      }

      try {
        const url = new URL(value);
        return url.protocol === "https:";
      } catch {
        return false;
      }
    },
    {
      message: "Use a secure https:// image URL or a local /public path."
    }
  );

export const createTesterGameSchema = z.object({
  title: z.string().trim().min(2).max(90),
  developer: z.string().trim().min(2).max(90),
  region: z.string().trim().min(2).max(80).default("Region 6"),
  description: z.string().trim().min(20).max(420),
  lore: z.string().trim().min(20).max(700),
  coverUrl: imageUrlSchema,
  heroUrl: imageUrlSchema.optional(),
  artifactName: z.string().trim().min(2).max(90),
  artifactDescription: z.string().trim().min(12).max(320),
  artifactImageUrl: imageUrlSchema,
  artifactRarity: z.string().trim().min(2).max(40).default("Rare")
});

export type CreateTesterGameInput = z.input<typeof createTesterGameSchema>;

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 36);
}

function token(length = 10) {
  return randomUUID().replace(/-/g, "").slice(0, length);
}

export async function createTesterGame(input: CreateTesterGameInput) {
  const data = createTesterGameSchema.parse(input);
  const slug = slugify(data.title) || "tester_game";
  const suffix = token(8);
  const gameId = `game_${slug}_${suffix}`;
  const artifactId = `artifact_${slug}_${suffix}`;
  const sessionId = `session_maya_${slug}_${suffix}`;
  const developerKey = `mock-${slug}-${token(16)}`;
  const heroUrl = data.heroUrl?.trim() || data.coverUrl;

  const game = await prisma.game.create({
    data: {
      id: gameId,
      title: data.title,
      region: data.region,
      developer: data.developer,
      description: data.description,
      lore: data.lore,
      coverUrl: data.coverUrl,
      heroUrl,
      artifacts: {
        create: {
          id: artifactId,
          name: data.artifactName,
          description: data.artifactDescription,
          imageUrl: data.artifactImageUrl,
          rarity: data.artifactRarity
        }
      },
      apiKeys: {
        create: {
          label: "Mock tester key",
          key: developerKey
        }
      },
      sessions: {
        create: {
          id: sessionId,
          user: {
            connect: {
              id: "user_maya"
            }
          },
          expiresAt: new Date("2035-01-01T00:00:00.000Z")
        }
      }
    },
    include: {
      artifacts: true,
      apiKeys: true,
      sessions: true
    }
  });

  return {
    game,
    mockUnlock: {
      sessionId,
      playerId: "user_maya",
      gameId,
      artifactId,
      developerKey
    }
  };
}

export function isKnownPrismaMissingReference(error: unknown) {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2003";
}
