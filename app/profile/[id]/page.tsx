import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

type ProfilePageProps = {
  params: {
    id: string;
  };
};

export default async function ProfilePage({ params }: ProfilePageProps) {
  const user = await prisma.user.findUnique({
    where: {
      id: params.id
    },
    include: {
      sessions: {
        include: {
          game: true
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
      }
    }
  });

  if (!user) {
    notFound();
  }

  return (
    <div className="page">
      <Link className="back-link" href="/">
        Back to store
      </Link>

      <section className="profile-header">
        <Image
          className="avatar"
          src={user.avatarUrl}
          alt={`${user.name} avatar`}
          width={224}
          height={224}
          sizes="112px"
        />
        <div>
          <p className="eyebrow">Player library</p>
          <h1 className="page-title">{user.name}</h1>
          <p className="muted">@{user.handle}</p>
        </div>
        <div className="library-stats" aria-label="Player library stats">
          <span>
            <strong>{user.unlocks.length}</strong>
            artifacts
          </span>
          <span>
            <strong>{user.sessions.length}</strong>
            linked sessions
          </span>
        </div>
      </section>

      <section className="detail-grid">
        <div>
          <h2 className="section-title">Permanent collectibles</h2>
          {user.unlocks.length ? (
            <div className="reward-list">
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
                    <p>
                      <Link href={`/games/${unlock.artifact.game.id}`}>
                        {unlock.artifact.game.title}
                      </Link>
                    </p>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="panel empty-state">
              <h3>No artifacts unlocked yet</h3>
              <p className="muted">Use the developer API tester to send a verified unlock.</p>
            </div>
          )}
        </div>

        <aside className="panel">
          <p className="kicker">Library access</p>
          <h2>Linked sessions</h2>
          <p className="muted">
            Sessions are owned by the portal. Games submit the session id when an artifact
            is discovered.
          </p>
          {user.sessions.map((session) => (
            <p className="session-row" key={session.id}>
              <Link href={`/games/${session.game.id}`}>{session.game.title}</Link>
              <br />
              <span className="muted">{session.id}</span>
            </p>
          ))}
        </aside>
      </section>
    </div>
  );
}
