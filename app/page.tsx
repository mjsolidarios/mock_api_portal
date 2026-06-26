import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, Box, Database, KeyRound, Sparkles, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";

const gameMeta: Record<
  string,
  {
    genre: string;
    tone: string;
    signal: string;
  }
> = {
  game_panay: {
    genre: "civic mystery",
    tone: "harbor routes and archive fragments",
    signal: "Map-led exploration"
  },
  game_sugar: {
    genre: "logistics puzzle",
    tone: "rail schedules, ledgers, and timed dispatch",
    signal: "Route planning"
  },
  game_weave: {
    genre: "coastal adventure",
    tone: "pattern repair and community memory",
    signal: "Craft restoration"
  }
};

export default async function HomePage() {
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

  const featuredGame = games[0];
  const artifactCount = games.reduce((total, game) => total + game.artifacts.length, 0);
  const feedbackCount = games.reduce((total, game) => total + game.feedbacks.length, 0);
  const featuredMeta = featuredGame ? gameMeta[featuredGame.id] : undefined;

  return (
    <div className="page store-page storefront-redesign">
      {featuredGame ? (
        <section className="storefront-hero" aria-labelledby="featured-game">
          <div className="hero-art-stack">
            <Link className="hero-art-primary" href={`/games/${featuredGame.id}`}>
              <Image
                src={featuredGame.heroUrl}
                alt={`${featuredGame.title} featured artwork`}
                width={1400}
                height={900}
                priority
                sizes="(max-width: 920px) 100vw, 56vw"
              />
              <Badge className="hero-art-badge" variant="secondary">
                Featured build
              </Badge>
            </Link>
            <div className="hero-art-note" aria-label="Featured game signal">
              <Sparkles aria-hidden="true" />
              <span>{featuredMeta?.signal ?? "Artifact unlocks"}</span>
            </div>
          </div>

          <div className="storefront-hero-copy">
            <Badge variant="outline">Region 6 public catalogue</Badge>
            <h1 id="featured-game">A game store for artifact-led discovery.</h1>
            <p>
              Browse civic games, collect cultural artifacts, and test the unlock API that
              connects play sessions to public player libraries.
            </p>
            <div className="featured-callout">
              <span>Featured</span>
              <strong>{featuredGame.title}</strong>
              <small>{featuredMeta?.tone ?? featuredGame.description}</small>
            </div>
            <div className="storefront-actions">
              <Button asChild size="lg">
                <Link href={`/games/${featuredGame.id}`}>
                  Open featured game
                  <ArrowUpRight aria-hidden="true" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="secondary">
                <Link href="/developer">
                  <KeyRound aria-hidden="true" />
                  Test unlock API
                </Link>
              </Button>
            </div>
          </div>
        </section>
      ) : null}

      <section className="storefront-ledger" aria-label="Portal summary">
        <Card className="ledger-card">
          <CardContent>
            <Database aria-hidden="true" />
            <strong>{games.length}</strong>
            <span>published games</span>
          </CardContent>
        </Card>
        <Card className="ledger-card">
          <CardContent>
            <Box aria-hidden="true" />
            <strong>{artifactCount}</strong>
            <span>museum artifacts</span>
          </CardContent>
        </Card>
        <Card className="ledger-card">
          <CardContent>
            <Star aria-hidden="true" />
            <strong>{feedbackCount}</strong>
            <span>player notes</span>
          </CardContent>
        </Card>
      </section>

      <div className="section-heading storefront-section-heading">
        <h2 id="games" className="section-title">
          Curated game shelf
        </h2>
        <p className="muted">
          Each listing ships with playable session data, unlockable museum artifacts, and
          feedback records for the public profile flow.
        </p>
      </div>

      <section className="storefront-grid" aria-label="Featured games">
        {games.map((game) => (
          <Link className="game-shelf-link" key={game.id} href={`/games/${game.id}`}>
            <Card className="game-shelf-card">
              <div className="game-shelf-cover">
                <Image
                  src={game.coverUrl}
                  alt={`${game.title} cover art`}
                  width={900}
                  height={560}
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
                <Badge className="game-shelf-region" variant="secondary">
                  {game.region}
                </Badge>
              </div>
              <CardContent className="game-shelf-body">
                <div>
                  <p className="game-shelf-genre">{gameMeta[game.id]?.genre ?? "portal game"}</p>
                  <h2>{game.title}</h2>
                  <p>{game.description}</p>
                </div>
                <div className="game-shelf-footer">
                  <span>{game.artifacts.length} artifacts</span>
                  <span>{game.feedbacks.length} notes</span>
                  <ArrowUpRight aria-hidden="true" />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </section>
    </div>
  );
}
