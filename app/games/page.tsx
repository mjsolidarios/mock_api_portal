import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Boxes, MessageSquare, Trophy } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { prisma } from "@/lib/prisma";

const gameGenres: Record<string, string> = {
  game_panay: "Adventure",
  game_faith: "Puzzle",
  game_dagat: "Strategy",
  game_sugar: "Logistics",
  game_weave: "Coastal"
};

export default async function GamesPage() {
  const games = await prisma.game.findMany({
    where: {
      id: {
        startsWith: "game_"
      }
    },
    orderBy: {
      title: "asc"
    },
    include: {
      artifacts: true,
      feedbacks: true
    }
  });

  return (
    <div className="page catalogue-page">
      <Link className="back-link" href="/">
        Back to portal
      </Link>

      <section className="catalogue-hero" aria-labelledby="catalogue-title">
        <Badge className="discover-eyebrow" variant="outline">
          <Boxes aria-hidden="true" />
          Public game catalogue
        </Badge>
        <h1 id="catalogue-title">Browse every Region 6 game.</h1>
        <p>
          Open each title to inspect its story archive, hidden artifact rewards, community
          feedback, and unlock API details.
        </p>
      </section>

      <section className="catalogue-grid" aria-label="All games">
        {games.map((game) => (
          <Link className="catalogue-card" href={`/games/${game.id}`} key={game.id}>
            <div className="catalogue-card-media">
              <Image
                src={game.coverUrl}
                alt={`${game.title} cover art`}
                width={720}
                height={460}
                sizes="(max-width: 720px) 100vw, 33vw"
              />
              <span>{gameGenres[game.id] ?? "Portal game"}</span>
            </div>
            <div className="catalogue-card-body">
              <div>
                <p>{game.developer}</p>
                <h2>{game.title}</h2>
              </div>
              <p>{game.description}</p>
              <div className="catalogue-card-meta" aria-label={`${game.title} summary`}>
                <span>
                  <Trophy aria-hidden="true" />
                  {game.artifacts.length} artifacts
                </span>
                <span>
                  <MessageSquare aria-hidden="true" />
                  {game.feedbacks.length} notes
                </span>
                <ArrowRight aria-hidden="true" />
              </div>
            </div>
          </Link>
        ))}
      </section>
    </div>
  );
}
