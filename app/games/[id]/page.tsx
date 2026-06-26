import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FeedbackForm } from "@/app/games/[id]/FeedbackForm";
import { prisma } from "@/lib/prisma";

type GamePageProps = {
  params: {
    id: string;
  };
};

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
      }
    }
  });

  if (!game) {
    notFound();
  }

  return (
    <div className="page">
      <Link className="back-link" href="/">
        Back to store
      </Link>

      <section className="game-hero">
        <div className="game-hero-media">
          <Image
            src={game.heroUrl}
            alt={`${game.title} hero artwork`}
            width={1400}
            height={820}
            priority
            sizes="(max-width: 960px) 100vw, 64vw"
          />
        </div>
        <div className="game-buy-panel">
          <p className="eyebrow">{game.developer}</p>
          <h1>{game.title}</h1>
          <p>{game.description}</p>
          <div className="store-tags" aria-label="Game details">
            <span>{game.region}</span>
            <span>{game.artifacts.length} hidden rewards</span>
            <span>{game.feedbacks.length} reviews</span>
          </div>
          <div className="actions">
            <a className="button" href="#feedback">
              Leave feedback
            </a>
            <Link className="button secondary" href="/developer">
              Unlock API
            </Link>
          </div>
        </div>
      </section>

      <section className="detail-grid" style={{ marginTop: 24 }}>
        <div>
          <div className="panel lore-panel">
            <p className="kicker">Story archive</p>
            <h2>Digital museum lore</h2>
            <p className="muted">{game.lore}</p>
            <p>
              This game has {game.artifacts.length} hidden artifacts ready for the museum
              handshake.
            </p>
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
                    <span>{feedback.rating}/5 rating</span>
                    <span>{feedback.user?.name ?? "Anonymous player"}</span>
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
            The public portal collects player feedback nationwide while unlocks are handled
            through the API.
          </p>
          <FeedbackForm gameId={game.id} />
        </aside>
      </section>
    </div>
  );
}
