import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Award, Layers, ShieldCheck, Sparkles, Trophy } from "lucide-react";
import { prisma } from "@/lib/prisma";

type ProfilePageProps = {
  params: {
    id: string;
  };
};

const RARITY_ORDER = ["Common", "Rare", "Epic", "Legendary"];

function pickBanner(id: string) {
  if (id === "user_lio") return "/avatars/banner-neon-rogue.jpg";
  return null;
}

function formatTimestamp(date: Date) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  }).format(date);
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const user = await prisma.user.findUnique({
    where: {
      id: params.id
    },
    include: {
      sessions: {
        include: {
          game: {
            include: {
              _count: {
                select: {
                  artifacts: true
                }
              }
            }
          }
        }
      },
      unlocks: {
        orderBy: {
          unlockedAt: "desc"
        },
        include: {
          artifact: {
            include: {
              game: true
            }
          }
        }
      },
      feedbacks: {
        orderBy: {
          createdAt: "desc"
        },
        take: 4
      }
    }
  });

  if (!user) {
    notFound();
  }

  const bannerUrl = pickBanner(user.id);
  const rarityTallies = RARITY_ORDER.map((rarity) => ({
    rarity,
    count: user.unlocks.filter((unlock) => unlock.artifact.rarity === rarity).length
  }));
  const totalUnlocks = user.unlocks.length;
  const rarityFocus = rarityTallies.reduce((best, entry) =>
    entry.count > best.count ? entry : best
  );
  const collectionRate = user.sessions.length === 0
    ? 0
    : Math.min(
        100,
        Math.round(
          (totalUnlocks /
            user.sessions.reduce(
              (sum, session) => sum + session.game._count.artifacts,
              0
            )) *
            100
        ) || 0
      );
  const joinDate = new Intl.DateTimeFormat("en", {
    month: "long",
    year: "numeric"
  }).format(user.createdAt);

  return (
    <div className="page profile-page">
      <Link className="back-link" href="/">
        Back to portal
      </Link>

      <section
        className={`profile-banner${bannerUrl ? " has-image" : ""}`}
        style={bannerUrl ? { backgroundImage: `url(${bannerUrl})` } : undefined}
        aria-label={`${user.name} banner`}
      >
        <div className="profile-banner-fade" aria-hidden="true" />
        <div className="profile-banner-row">
          <div className="profile-avatar-wrap">
            <Image
              className="profile-avatar"
              src={user.avatarUrl}
              alt={`${user.name} avatar`}
              width={256}
              height={256}
              sizes="(max-width: 720px) 120px, 160px"
              priority
            />
            <span className="profile-rank" aria-label="Player rank">
              <Trophy aria-hidden="true" />
              <span>Rank {Math.max(1, Math.floor(totalUnlocks / 2) + 1)}</span>
            </span>
          </div>
          <div className="profile-identity">
            <p className="eyebrow">Player library</p>
            <h1 className="profile-name">{user.name}</h1>
            <p className="profile-handle">@{user.handle}</p>
            <p className="profile-meta">
              <ShieldCheck aria-hidden="true" />
              Joined {joinDate}
            </p>
          </div>
          <div className="profile-actions">
            <Link className="profile-action" href={`/games`}>
              <Sparkles aria-hidden="true" />
              Browse catalogue
            </Link>
            <Link className="profile-action profile-action-ghost" href={`/developer`}>
              <Layers aria-hidden="true" />
              Open API tools
            </Link>
          </div>
        </div>
      </section>

      <section className="profile-stats" aria-label="Player library stats">
        <article className="profile-stat">
          <span className="profile-stat-icon">
            <Award aria-hidden="true" />
          </span>
          <div>
            <strong>{totalUnlocks}</strong>
            <span className="profile-stat-label">Artifacts unlocked</span>
          </div>
        </article>
        <article className="profile-stat">
          <span className="profile-stat-icon profile-stat-icon-gold">
            <Trophy aria-hidden="true" />
          </span>
          <div>
            <strong>{user.sessions.length}</strong>
            <span className="profile-stat-label">Linked sessions</span>
          </div>
        </article>
        <article className="profile-stat">
          <span className="profile-stat-icon profile-stat-icon-purple">
            <Sparkles aria-hidden="true" />
          </span>
          <div>
            <strong>{collectionRate}%</strong>
            <span className="profile-stat-label">Collection rate</span>
          </div>
        </article>
        <article className="profile-stat">
          <span className="profile-stat-icon profile-stat-icon-teal">
            <Layers aria-hidden="true" />
          </span>
          <div>
            <strong>{user.feedbacks.length}</strong>
            <span className="profile-stat-label">Reviews shared</span>
          </div>
        </article>
      </section>

      <section className="detail-grid">
        <div className="profile-main">
          <div className="section-heading">
            <div>
              <p className="kicker">Permanent collectibles</p>
              <h2 className="section-title">Artifact collection</h2>
            </div>
            <p className="muted">
              Highlight rarity: <strong>{rarityFocus.rarity}</strong> · {rarityFocus.count}{" "}
              piece{rarityFocus.count === 1 ? "" : "s"}.
            </p>
          </div>

          {user.unlocks.length ? (
            <>
              <div className="profile-rarity">
                {rarityTallies.map((entry) => {
                  const width = totalUnlocks
                    ? Math.round((entry.count / totalUnlocks) * 100)
                    : 0;
                  return (
                    <div className="profile-rarity-row" key={entry.rarity}>
                      <span className="profile-rarity-label">{entry.rarity}</span>
                      <span
                        className={`profile-rarity-bar profile-rarity-${entry.rarity.toLowerCase()}`}
                        aria-hidden="true"
                      >
                        <span
                          className="profile-rarity-fill"
                          style={{ width: `${width}%` }}
                        />
                      </span>
                      <span className="profile-rarity-count">{entry.count}</span>
                    </div>
                  );
                })}
              </div>

              <div className="reward-list profile-unlocks">
                {user.unlocks.map((unlock) => (
                  <article className="card artifact-card" key={unlock.id}>
                    <Image
                      src={unlock.artifact.imageUrl}
                      alt={`${unlock.artifact.name} artifact`}
                      width={184}
                      height={184}
                      sizes="(max-width: 560px) 100vw, 92px"
                    />
                    <div className="card-body">
                      <p className="kicker">{unlock.artifact.rarity}</p>
                      <h2>{unlock.artifact.name}</h2>
                      <p className="muted">{unlock.artifact.description}</p>
                      <div className="profile-unlock-meta">
                        <Link href={`/games/${unlock.artifact.game.id}`}>
                          {unlock.artifact.game.title}
                        </Link>
                        <span>{formatTimestamp(unlock.unlockedAt)}</span>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </>
          ) : (
            <div className="panel empty-state">
              <h3>No artifacts unlocked yet</h3>
              <p className="muted">
                Use the developer API tester to send a verified unlock and start the
                collection.
              </p>
              <Link className="profile-action profile-action-ghost" href="/developer">
                Open API tools
              </Link>
            </div>
          )}

          {user.feedbacks.length ? (
            <>
              <h2 className="section-title">Recent reviews</h2>
              <div className="feedback-list">
                {user.feedbacks.map((feedback) => (
                  <article className="panel feedback-item" key={feedback.id}>
                    <p>{feedback.comment}</p>
                    <p className="meta-row">
                      <span>{feedback.rating}/5 rating</span>
                      <span>{formatTimestamp(feedback.createdAt)}</span>
                    </p>
                  </article>
                ))}
              </div>
            </>
          ) : null}
        </div>

        <aside className="panel profile-side">
          <p className="kicker">Linked sessions</p>
          <h2>Active play</h2>
          <p className="muted">
            Sessions owned by the portal. Games submit the session id when an artifact is
            discovered.
          </p>
          {user.sessions.length ? (
            <div className="profile-sessions">
              {user.sessions.map((session) => (
                <Link
                  href={`/games/${session.game.id}`}
                  className="profile-session-card"
                  key={session.id}
                >
                  <div className="profile-session-cover">
                    <Image
                      src={session.game.coverUrl}
                      alt={`${session.game.title} cover`}
                      width={120}
                      height={76}
                      sizes="76px"
                    />
                  </div>
                  <div className="profile-session-body">
                    <strong>{session.game.title}</strong>
                    <span className="muted">{session.id}</span>
                    <span className="profile-session-meta">
                      Expires {formatTimestamp(session.expiresAt)}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="profile-session-empty">
              <p className="muted">No active sessions.</p>
            </div>
          )}
        </aside>
      </section>
    </div>
  );
}
