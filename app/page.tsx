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
  Sparkles,
  Trophy
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

const featuredShelf = ["game_faith", "game_panay", "game_dagat"] as const;

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

      <section className="discover-featured mb-32" id="featured-shelf" aria-labelledby="featured-title">
        <div className="discover-featured-copy">
          <div>
            <p className="discover-featured-eyebrow">Featured release</p>
            <h2 id="featured-title" className="discover-featured-title">
              Echoes of Panay
            </h2>
          </div>
          <p className="discover-featured-desc">
            Explore forgotten harbor routes and reconstruct the civic stories they left behind.
          </p>
          <Link className="discover-featured-link ml-4" href={`/games/${featuredGame?.id ?? "game_panay"}`}>
            Start with Panay
            <ArrowRight aria-hidden="true" />
          </Link>
        </div>

        <div className="discover-shelf" aria-label="Featured game shelf">
          {shelfGames.map((game, idx) => {
            const meta = gameMeta[game.id];
            const isPrimary = game.id === featuredGame?.id;
            const position = isPrimary ? "is-active" : idx === 0 ? "is-prev" : idx === 2 ? "is-next" : "";
            return (
              <Link
                key={game.id}
                href={`/games/${game.id}`}
                className={`discover-shelf-card${isPrimary ? " is-active" : ""}`}
                data-shelf-card
                data-position={position}
                aria-label={`${game.title}, ${meta?.genre ?? "Portal game"}, by ${game.developer}`}
              >
                <div className="discover-shelf-cover">
                  <Image
                    src={game.coverUrl}
                    alt={`${game.title} cover art`}
                    width={720}
                    height={960}
                    sizes="(max-width: 980px) 100vw, 22vw"
                  />
                  <div className="discover-shelf-fade" aria-hidden="true" />
                  <div className="discover-shelf-overlay">
                    <div className="discover-shelf-tags" aria-hidden="true">
                      {isPrimary ? (
                        <span className="discover-shelf-tag discover-shelf-tag-gold">
                          <Sparkles />
                          Featured
                        </span>
                      ) : null}
                      <span className="discover-shelf-tag discover-shelf-tag-region">
                        <Compass />
                        {game.region}
                      </span>
                      <span className="discover-shelf-tag discover-shelf-tag-genre">
                        {meta?.genre ?? "Portal game"}
                      </span>
                    </div>
                    <div className="discover-shelf-body">
                      <div className="discover-shelf-titles">
                        <p className="discover-shelf-developer">{game.developer}</p>
                        <h3>{game.title}</h3>
                        <p className="discover-shelf-signal">{meta?.signal ?? "Artifact unlocks"}</p>
                      </div>
                      <span className="discover-shelf-cta-pill" aria-hidden="true">
                        <span>Explore</span>
                        <ArrowRight />
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}

          <Link
            className="discover-shelf-card discover-shelf-cta"
            href="/games"
            data-shelf-card
            aria-label="View all games in the catalogue"
          >
            <div className="discover-shelf-body">
              <span className="discover-shelf-cta-icon" aria-hidden="true">
                <ArrowRight />
              </span>
              <h3>View all games</h3>
              <p>Explore the full catalogue</p>
              <span className="discover-shelf-cta-pill" aria-hidden="true">
                <span>Open catalogue</span>
                <ArrowRight />
              </span>
            </div>
          </Link>
        </div>
      </section>
    </div>
  );
}
