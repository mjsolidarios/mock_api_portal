import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://r6portal.dev";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const games = await prisma.game.findMany({
    select: { id: true, createdAt: true }
  });
  const users = await prisma.user.findMany({
    select: { id: true, createdAt: true }
  });

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${SITE_URL}/`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1
    },
    {
      url: `${SITE_URL}/games`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9
    },
    {
      url: `${SITE_URL}/developer`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7
    },
    {
      url: `${SITE_URL}/profile/user_maya`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.5
    }
  ];

  const gameRoutes: MetadataRoute.Sitemap = games.map((game) => ({
    url: `${SITE_URL}/games/${game.id}`,
    lastModified: game.createdAt,
    changeFrequency: "weekly",
    priority: 0.8
  }));

  const userRoutes: MetadataRoute.Sitemap = users.map((user) => ({
    url: `${SITE_URL}/profile/${user.id}`,
    lastModified: user.createdAt,
    changeFrequency: "weekly",
    priority: 0.5
  }));

  return [...staticRoutes, ...gameRoutes, ...userRoutes];
}