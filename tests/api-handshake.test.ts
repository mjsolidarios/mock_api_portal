import assert from "node:assert/strict";
import { PrismaClient } from "@prisma/client";
import { unlockArtifact } from "@/lib/achievements";

const prisma = new PrismaClient();

async function resetTestData() {
  await prisma.unlockedArtifact.deleteMany();
  await prisma.feedback.deleteMany();
  await prisma.gameSession.deleteMany();
  await prisma.developerApiKey.deleteMany();
  await prisma.artifact.deleteMany();
  await prisma.game.deleteMany();
  await prisma.user.deleteMany();

  await prisma.user.create({
    data: {
      id: "test_user",
      name: "Test User",
      handle: "test_user",
      avatarUrl:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=240&q=80"
    }
  });

  await prisma.game.create({
    data: {
      id: "test_game",
      title: "Test Game",
      region: "Region 6",
      developer: "Test Dev",
      description: "Test description",
      lore: "Test lore",
      coverUrl:
        "https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=800&q=80",
      heroUrl:
        "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1600&q=80"
    }
  });

  await prisma.artifact.create({
    data: {
      id: "test_artifact",
      gameId: "test_game",
      name: "Test Artifact",
      description: "Artifact description",
      imageUrl:
        "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=600&q=80",
      rarity: "Rare"
    }
  });

  await prisma.developerApiKey.create({
    data: {
      gameId: "test_game",
      label: "Test key",
      key: "test-key"
    }
  });

  await prisma.gameSession.create({
    data: {
      id: "test_session",
      userId: "test_user",
      gameId: "test_game",
      expiresAt: new Date("2035-01-01T00:00:00.000Z")
    }
  });
}

async function run() {
  await resetTestData();

  const success = await unlockArtifact({
    sessionId: "test_session",
    playerId: "test_user",
    gameId: "test_game",
    artifactId: "test_artifact",
    developerKey: "test-key"
  });

  assert.equal(success.status, "unlocked");

  const duplicate = await unlockArtifact({
    sessionId: "test_session",
    playerId: "test_user",
    gameId: "test_game",
    artifactId: "test_artifact",
    developerKey: "test-key"
  });

  assert.equal(duplicate.status, "already_unlocked");

  const unlockCount = await prisma.unlockedArtifact.count({
    where: {
      userId: "test_user",
      artifactId: "test_artifact"
    }
  });

  assert.equal(unlockCount, 1);

  const unauthorized = await unlockArtifact({
    sessionId: "test_session",
    playerId: "test_user",
    gameId: "test_game",
    artifactId: "test_artifact",
    developerKey: "wrong-key"
  });

  assert.equal(unauthorized.status, "unauthorized");

  const invalidSession = await unlockArtifact({
    sessionId: "missing_session",
    playerId: "test_user",
    gameId: "test_game",
    artifactId: "test_artifact",
    developerKey: "test-key"
  });

  assert.equal(invalidSession.status, "invalid_session");

  console.log("API handshake tests passed.");
}

run()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
