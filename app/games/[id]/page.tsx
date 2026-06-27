import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Award, ChevronRight, MessageSquare, ShieldCheck, Sparkles, Star } from "lucide-react";
import { FeedbackForm } from "@/app/games/[id]/FeedbackForm";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";

type GamePageProps = {
  params: {
    id: string;
  };
};

function RatingStars({ rating }: { rating: number }) {
  return (
    <span className="rating-stars" aria-label={`${rating} out of 5 rating`}>
      {[1, 2, 3, 4, 5].map((value) => (
        <span
          aria-hidden="true"
          className={value <= rating ? "is-filled" : undefined}
          key={value}
        >
          ★
        </span>
      ))}
    </span>
  );
}

export default async function GamePage({ params }: GamePageProps) {
  const game = await prisma.game.findUnique({
    where: {
      id: params.id
    },
    include: {
      artifacts: {
        orderBy: {
          name: "asc"
        }
      },
      feedbacks: {
        orderBy: {
          createdAt: "desc"
        },
        include: {
          user: true
        },
        take: 6
      },
      _count: {
        select: {
          artifacts: true,
          feedbacks: true
        }
      }
    }
  });

  if (!game) {
    notFound();
  }

  const ratingAggregate = await prisma.feedback.aggregate({
    where: {
      gameId: game.id
    },
    _avg: {
      rating: true
    }
  });
  const averageRating = ratingAggregate._avg.rating
    ? ratingAggregate._avg.rating.toFixed(1)
    : "New";
  const averageRatingRounded = ratingAggregate._avg.rating
    ? Math.round(ratingAggregate._avg.rating)
    : 0;
  const featuredArtifact = game.artifacts[0];

  function formatTimestamp(date: Date) {
    return new Intl.DateTimeFormat("en", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit"
    }).format(date);
  }

  return (
    <div className="page game-detail-page">
      <Link className="back-link" href="/">
        Back to portal
      </Link>

      <section className="game-hero game-hero-redesign">
        <div className="game-hero-media">
          <Image
            src={game.heroUrl}
            alt={`${game.title} hero artwork`}
            width={1400}
            height={820}
            priority
            sizes="(max-width: 960px) 100vw, 64vw"
          />
          {featuredArtifact ? (
            <div className="game-hero-artifact">
              <Image
                src={featuredArtifact.imageUrl}
                alt={`${featuredArtifact.name} preview`}
                width={92}
                height={92}
                sizes="92px"
              />
              <div>
                <span>{featuredArtifact.rarity}</span>
                <strong>{featuredArtifact.name}</strong>
              </div>
            </div>
          ) : null}
        </div>
        <div className="game-buy-panel">
          <p className="eyebrow">{game.developer}</p>
          <h1>{game.title}</h1>
          <p>{game.description}</p>
          <div className="game-quick-stats" aria-label="Game summary">
            <div>
              <ShieldCheck aria-hidden="true" />
              <span>Region</span>
              <strong>{game.region}</strong>
            </div>
            <div>
              <Award aria-hidden="true" />
              <span>Artifacts</span>
              <strong>{game._count.artifacts}</strong>
            </div>
            <div>
              <Star aria-hidden="true" />
              <span>Rating</span>
              <strong>
                {averageRatingRounded ? <RatingStars rating={averageRatingRounded} /> : null}
                {averageRating}
              </strong>
            </div>
            <div>
              <MessageSquare aria-hidden="true" />
              <span>Feedback</span>
              <strong>{game._count.feedbacks}</strong>
            </div>
          </div>
          <div className="actions">
            <Button asChild size="lg">
              <a href="#feedback">
                Leave feedback
              </a>
            </Button>
            <Button asChild size="lg" variant="secondary">
              <Link href="/developer">
                Unlock API
                <ChevronRight aria-hidden="true" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="detail-grid" style={{ marginTop: 24 }}>
        <div>
          <div className="panel lore-panel">
            <p className="kicker">Story archive</p>
            <h2>Digital museum lore</h2>
            <p className="muted">{game.lore}</p>
            <div className="lore-metrics" aria-label="Museum handshake summary">
              <span>
                <Sparkles aria-hidden="true" />
                {game._count.artifacts} artifact rewards
              </span>
              <span>
                <ShieldCheck aria-hidden="true" />
                API unlock ready
              </span>
            </div>
          </div>

          <h2 className="section-title">Hidden artifacts</h2>
          <div className="reward-list">
            {game.artifacts.map((artifact) => (
              <article className="card artifact-card" key={artifact.id}>
                <Image
                  src={artifact.imageUrl}
                  alt={`${artifact.name} artifact`}
                  width={184}
                  height={184}
                  sizes="(max-width: 560px) 100vw, 92px"
                />
                <div className="card-body">
                  <p className="kicker">{artifact.rarity}</p>
                  <h3>{artifact.name}</h3>
                  <p className="muted">{artifact.description}</p>
                  <code>{artifact.id}</code>
                </div>
              </article>
            ))}
          </div>

          <h2 className="section-title">Recent feedback</h2>
          {game.feedbacks.length ? (
            <div className="feedback-list">
              {game.feedbacks.map((feedback) => (
                <article className="panel feedback-item" key={feedback.id}>
                  <p>{feedback.comment}</p>
                  <p className="meta-row">
                    <span>
                      <RatingStars rating={feedback.rating} />
                      {feedback.rating}/5 rating
                    </span>
                    <span>{feedback.user?.name ?? "Anonymous player"}</span>
                    <span>{formatTimestamp(feedback.createdAt)}</span>
                  </p>
                </article>
              ))}
            </div>
          ) : (
            <div className="panel empty-state">
              <h3>No player feedback yet</h3>
              <p className="muted">Submit the first note from the feedback panel.</p>
            </div>
          )}
        </div>

        <aside id="feedback" className="panel sticky-panel">
          <p className="kicker">Community</p>
          <h2>Player feedback</h2>
          <p className="muted">
            Submit a note from a seeded user. It will appear in this game feed and on the
            selected player profile.
          </p>
          <FeedbackForm gameId={game.id} />
        </aside>
      </section>
    </div>
  );
}
