import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const future = new Date("2035-01-01T00:00:00.000Z");

async function main() {
  await prisma.unlockedArtifact.deleteMany();
  await prisma.feedback.deleteMany();
  await prisma.gameSession.deleteMany();
  await prisma.developerApiKey.deleteMany();
  await prisma.artifact.deleteMany();
  await prisma.game.deleteMany();
  await prisma.user.deleteMany();

  await prisma.user.createMany({
    data: [
      {
        id: "user_maya",
        name: "Maya Reyes",
        handle: "maya_reyes",
        avatarUrl:
          "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=240&q=80"
      },
      {
        id: "user_lio",
        name: "Lio Santos",
        handle: "lio_santos",
        avatarUrl:
          "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=240&q=80"
      }
    ]
  });

  await prisma.game.createMany({
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
        coverUrl: "/game-covers/echoes-of-panay.png",
        heroUrl: "/game-covers/echoes-of-panay.png"
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
        coverUrl: "/game-covers/sugarline-dispatch.png",
        heroUrl: "/game-covers/sugarline-dispatch.png"
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
        coverUrl: "/game-covers/weavers-tide.png",
        heroUrl: "/game-covers/weavers-tide.png"
      }
    ]
  });

  await prisma.artifact.createMany({
    data: [
      {
        id: "artifact_panay_bell",
        gameId: "game_panay",
        name: "Harbor Bell Fragment",
        description: "A bronze fragment tied to the ports that connected Panay's early settlements.",
        imageUrl:
          "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=600&q=80",
        rarity: "Rare"
      },
      {
        id: "artifact_sugar_token",
        gameId: "game_sugar",
        name: "Railway Cane Token",
        description: "A work token carried across sugar rail lines and station ledgers.",
        imageUrl:
          "https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?auto=format&fit=crop&w=600&q=80",
        rarity: "Epic"
      },
      {
        id: "artifact_weave_shell",
        gameId: "game_weave",
        name: "Tide Loom Shell",
        description: "A shell charm used to mark the start of a community weaving pattern.",
        imageUrl:
          "https://images.unsplash.com/photo-1501959915551-4e8d30928317?auto=format&fit=crop&w=600&q=80",
        rarity: "Rare"
      }
    ]
  });

  await prisma.developerApiKey.createMany({
    data: [
      { gameId: "game_panay", label: "Demo key", key: "demo-panay-key" },
      { gameId: "game_sugar", label: "Demo key", key: "demo-sugar-key" },
      { gameId: "game_weave", label: "Demo key", key: "demo-weave-key" }
    ]
  });

  await prisma.gameSession.createMany({
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

  await prisma.unlockedArtifact.create({
    data: {
      userId: "user_lio",
      artifactId: "artifact_sugar_token",
      sessionId: "session_lio_sugar"
    }
  });

  await prisma.feedback.createMany({
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
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
