import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  ChevronRight,
  Compass,
  Globe2,
  MessageSquare,
  ShieldCheck,
  Sparkles
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DiscoverMotion } from "@/app/DiscoverMotion";
import { FeaturedHero, type FeaturedGame } from "@/components/FeaturedHero";
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
    genre: "Adventure",
    tone: "harbor routes and archive fragments",
    signal: "Map-led exploration"
  },
  game_faith: {
    genre: "Puzzle",
    tone: "sacred relics and parish chronicles",
    signal: "Inscription decoding"
  },
  game_dagat: {
    genre: "Strategy",
    tone: "coastal watch and maritime heritage",
    signal: "Patrol routing"
  },
  game_sugar: {
    genre: "Logistics",
    tone: "rail schedules, ledgers, and timed dispatch",
    signal: "Route planning"
  },
  game_weave: {
    genre: "Coastal",
    tone: "pattern repair and community memory",
    signal: "Craft restoration"
  }
};

const featuredShelf = ["game_panay", "game_faith", "game_dagat"] as const;

const featureItems = [
  {
    icon: BookOpen,
    eyebrow: "01",
    title: "Curated Games",
    description: "Quality games from local creators across Region 6, hand-picked for cultural depth."
  },
  {
    icon: Compass,
    eyebrow: "02",
    title: "Cultural Artifacts",
    description: "Collect, learn about, and preserve the heritage embedded in every unlock."
  },
  {
    icon: MessageSquare,
    eyebrow: "03",
    title: "Unlock API",
    description: "Connect play data to public player libraries with a single signed handshake."
  },
  {
    icon: ShieldCheck,
    eyebrow: "04",
    title: "Public & Open",
    description: "Built for transparency. Every portal entry is auditable by the community."
  }
];

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

  const featuredGame = games.find((game) => game.id === "game_panay") ?? games[0];
  const rotationGames: FeaturedGame[] = (featuredGame ? [featuredGame] : []).concat(
    games.filter((game) => game.id !== featuredGame?.id)
  );
  const signals: Record<string, string> = {};
  for (const game of games) {
    signals[game.id] = gameMeta[game.id]?.signal ?? "Artifact unlocks";
  }
  const shelfGames = featuredShelf
    .map((id) => games.find((game) => game.id === id))
    .filter((game): game is NonNullable<typeof game> => Boolean(game));

  return (
    <div className="page store-discover">
      <DiscoverMotion />
      <section className="discover-hero" aria-labelledby="hero-title">
        <div className="discover-hero-copy">
          <Badge className="discover-eyebrow" variant="outline">
            <Globe2 aria-hidden="true" />
            Region 6 public catalogue
          </Badge>
          <h1 id="hero-title" className="discover-headline">
            A game portal
            <br /> for{" "}
            <span className="discover-headline-accent">artifact-led</span>
            <br /> discovery.
          </h1>
          <p className="dishero-lede">
            Browse civic games, collect cultural artifacts, and test the unlock API that
            connects play sessions to public player libraries.
          </p>
          <div className="discover-hero-actions">
            <Button asChild size="lg" className="discover-primary-cta">
              <Link href="#featured-shelf">
                Browse Games
                <ChevronRight aria-hidden="true" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="discover-secondary-cta">
              <Link href="/developer">
                <MessageSquare aria-hidden="true" />
                API tools
              </Link>
            </Button>
          </div>
        </div>

        {featuredGame ? (
          <FeaturedHero games={rotationGames} signals={signals} />
        ) : null}
      </section>

      <section className="discover-features" aria-label="Portal pillars">
        <div className="discover-features-panel">
          {featureItems.map((feature) => {
            const Icon = feature.icon;
            return (
              <article className="discover-feature" key={feature.title}>
                <span className="discover-feature-eyebrow">{feature.eyebrow}</span>
                <span className="discover-feature-icon" aria-hidden="true">
                  <Icon />
                </span>
                <div>
                  <h2>{feature.title}</h2>
                  <p>{feature.description}</p>
                </div>
                <span className="discover-feature-arrow" aria-hidden="true">
                  <Sparkles />
                </span>
              </article>
            );
          })}
        </div>
      </section>

      <section className="discover-featured" id="featured-shelf" aria-labelledby="featured-title">
        <div className="discover-featured-copy">
          <p className="discover-featured-eyebrow">FEATURED</p>
          <h2 id="featured-title" className="discover-featured-title">
            Echoes of Panay
          </h2>
          <p className="discover-featured-desc">
            Explore forgotten harbor routes and reconstruct the stories they left behind.
          </p>
        </div>

        <div className="discover-shelf" aria-label="Featured game shelf">
          {shelfGames.map((game) => {
            const meta = gameMeta[game.id];
            const isPrimary = game.id === featuredGame?.id;
            return (
              <Link
                key={game.id}
                href={`/games/${game.id}`}
                className={`discover-shelf-card${isPrimary ? " is-primary" : ""}`}
              >
                <div className="discover-shelf-cover">
                  <Image
                    src={game.coverUrl}
                    alt={`${game.title} cover art`}
                    width={720}
                    height={460}
                    sizes="(max-width: 980px) 100vw, 22vw"
                  />
                  <div className="discover-shelf-fade" aria-hidden="true" />
                </div>
                <div className="discover-shelf-body">
                  <h3>{game.title}</h3>
                  <span className="discover-shelf-genre">{meta?.genre ?? "Portal game"}</span>
                </div>
              </Link>
            );
          })}

          <Link className="discover-shelf-card discover-shelf-cta" href="/games">
            <div className="discover-shelf-body">
              <span className="discover-shelf-cta-icon" aria-hidden="true">
                <ArrowRight />
              </span>
              <h3>View all games</h3>
              <p>Explore the full catalogue</p>
            </div>
          </Link>
        </div>
      </section>
    </div>
  );
}
