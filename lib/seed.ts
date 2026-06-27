import type { PrismaClient } from "@prisma/client";
import { prisma } from "@/lib/prisma";

const future = new Date("2035-01-01T00:00:00.000Z");

export type SeedSummary = {
  users: number;
  games: number;
  artifacts: number;
  apiKeys: number;
  sessions: number;
  unlocks: number;
  feedbacks: number;
};

export type SeedResult = {
  ok: true;
  summary: SeedSummary;
};

export async function seedMockData(
  client: PrismaClient = prisma
): Promise<SeedResult> {
  await client.unlockedArtifact.deleteMany();
  await client.feedback.deleteMany();
  await client.gameSession.deleteMany();
  await client.developerApiKey.deleteMany();
  await client.artifact.deleteMany();
  await client.game.deleteMany();
  await client.user.deleteMany();

  const users = await client.user.createMany({
    data: [
      {
        id: "user_maya",
        name: "PixelKite",
        handle: "pixel_kite",
        avatarUrl: "/avatars/pixel-kite_001.jpg"
      },
      {
        id: "user_lio",
        name: "NeonRogue",
        handle: "neon_rogue",
        avatarUrl: "/avatars/neon-rogue.jpg"
      }
    ]
  });

  const games = await client.game.createMany({
    data: [
      {
        id: "game_panay",
        title: "Echoes of Panay",
        region: "Region 6",
        developer: "Team Irong-Irong",
        description:
          "Explore old trade routes, solve civic puzzles, and recover cultural artifacts hidden across a stylized Panay map.",
        lore:
          "A lost archive resurfaces through fragments left in ports, plazas, and ancestral houses.",
        coverUrl: "/game-covers/echoes-of-panay.jpg",
        heroUrl: "/game-covers/echoes-of-panay.jpg"
      },
      {
        id: "game_faith",
        title: "Fragments of Faith",
        region: "Region 6",
        developer: "Iloilo Heritage Studio",
        description:
          "Decode centuries-old stone inscriptions, reassemble scattered relics, and uncover the lost chronicle of a forgotten parish.",
        lore:
          "Each carved fragment locks the next. Only the right order reveals the relic that started the devotion.",
        coverUrl: "/game-covers/fragments-of-faith.jpg",
        heroUrl: "/game-covers/fragments-of-faith.jpg"
      },
      {
        id: "game_dagat",
        title: "Bantay Dagat",
        region: "Region 6",
        developer: "Visayan Sea Collective",
        description:
          "Command a coastal watch network, dispatch outrigger patrols, and protect maritime heritage from rival poachers.",
        lore:
          "Every dawn brings a new sighting chart. Strategy decides which signal reaches the lighthouse first.",
        coverUrl: "/game-covers/bantay-dagat.jpg",
        heroUrl: "/game-covers/bantay-dagat.jpg"
      },
      {
        id: "game_sugar",
        title: "Sugarline Dispatch",
        region: "Region 6",
        developer: "Negros Interactive Lab",
        description:
          "Route cargo, decode telegrams, and uncover an artifact tied to the history of the sugar rail lines.",
        lore:
          "Every station holds a clue, but only one timetable reveals the ceremonial marker.",
        coverUrl: "/game-covers/sugarline-dispatch.jpg",
        heroUrl: "/game-covers/sugarline-dispatch.jpg"
      },
      {
        id: "game_weave",
        title: "Weaver's Tide",
        region: "Region 6",
        developer: "Aklan Story Forge",
        description:
          "A coastal adventure about patterns, memory, and the communities that shaped island craft traditions.",
        lore:
          "The sea returns a woven token whenever a player restores the correct pattern.",
        coverUrl: "/game-covers/weavers-tide.jpg",
        heroUrl: "/game-covers/weavers-tide.jpg"
      }
    ]
  });

  const artifacts = await client.artifact.createMany({
    data: [
      {
        id: "artifact_panay_bell",
        gameId: "game_panay",
        name: "Harbor Bell Fragment",
        description: "A bronze fragment tied to the ports that connected Panay's early settlements.",
        imageUrl: "/artifacts/harbor-bell-fragment.jpg",
        rarity: "Rare"
      },
      {
        id: "artifact_faith_reliquary",
        gameId: "game_faith",
        name: "Parish Reliquary",
        description: "An ornate silver reliquary recovered from beneath the nave's mosaic floor.",
        imageUrl: "/artifacts/parish-reliquary.jpg",
        rarity: "Epic"
      },
      {
        id: "artifact_dagat_chart",
        gameId: "game_dagat",
        name: "Coastal Watch Chart",
        description: "A hand-drawn chart of patrol routes and signal lantern codes used by sea guardians.",
        imageUrl: "/artifacts/coastal-watch-chart.jpg",
        rarity: "Rare"
      },
      {
        id: "artifact_sugar_token",
        gameId: "game_sugar",
        name: "Railway Cane Token",
        description: "A work token carried across sugar rail lines and station ledgers.",
        imageUrl: "/artifacts/railway-cane-token.jpg",
        rarity: "Epic"
      },
      {
        id: "artifact_weave_shell",
        gameId: "game_weave",
        name: "Tide Loom Shell",
        description: "A shell charm used to mark the start of a community weaving pattern.",
        imageUrl: "/artifacts/tide-loom-shell.jpg",
        rarity: "Rare"
      }
    ]
  });

  const apiKeys = await client.developerApiKey.createMany({
    data: [
      { gameId: "game_panay", label: "Demo key", key: "demo-panay-key" },
      { gameId: "game_faith", label: "Demo key", key: "demo-faith-key" },
      { gameId: "game_dagat", label: "Demo key", key: "demo-dagat-key" },
      { gameId: "game_sugar", label: "Demo key", key: "demo-sugar-key" },
      { gameId: "game_weave", label: "Demo key", key: "demo-weave-key" }
    ]
  });

  const sessions = await client.gameSession.createMany({
    data: [
      {
        id: "session_maya_panay",
        userId: "user_maya",
        gameId: "game_panay",
        expiresAt: future
      },
      {
        id: "session_lio_sugar",
        userId: "user_lio",
        gameId: "game_sugar",
        expiresAt: future
      }
    ]
  });

  const unlocks = await client.unlockedArtifact.create({
    data: {
      userId: "user_lio",
      artifactId: "artifact_sugar_token",
      sessionId: "session_lio_sugar"
    }
  });

  const feedbacks = await client.feedback.createMany({
    data: [
      {
        userId: "user_maya",
        gameId: "game_panay",
        rating: 5,
        comment: "The museum unlock made the discovery feel connected to the larger portal."
      },
      {
        userId: "user_lio",
        gameId: "game_sugar",
        rating: 4,
        comment: "Strong setting and a clear artifact goal."
      }
    ]
  });

  return {
    ok: true,
    summary: {
      users: users.count,
      games: games.count,
      artifacts: artifacts.count,
      apiKeys: apiKeys.count,
      sessions: sessions.count,
      unlocks: unlocks ? 1 : 0,
      feedbacks: feedbacks.count
    }
  };
}
