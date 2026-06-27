import { UnlockTester } from "@/app/developer/UnlockTester";
import { SeedButton } from "@/components/SeedButton";
import { Button } from "@/components/ui/button";

const requestBody = `{
  "sessionId": "session_maya_panay",
  "playerId": "user_maya",
  "gameId": "game_panay",
  "artifactId": "artifact_panay_bell",
  "developerKey": "demo-panay-key"
}`;

const curlExample = `curl -X POST http://localhost:3000/api/achievements/unlock \\
  -H "Content-Type: application/json" \\
  -d '${requestBody}'`;

const successResponse = `{
  "status": "unlocked",
  "unlock": {
    "id": "generated-unlock-id",
    "unlockedAt": "2026-06-27T00:00:00.000Z",
    "artifact": {
      "id": "artifact_panay_bell",
      "name": "Harbor Bell Fragment",
      "rarity": "Rare"
    }
  }
}`;

const fixtures = [
  {
    game: "Echoes of Panay",
    gameId: "game_panay",
    key: "demo-panay-key",
    session: "session_maya_panay",
    player: "user_maya",
    artifact: "artifact_panay_bell",
    expected: "201 first unlock, 200 after repeat"
  },
  {
    game: "Sugarline Dispatch",
    gameId: "game_sugar",
    key: "demo-sugar-key",
    session: "session_lio_sugar",
    player: "user_lio",
    artifact: "artifact_sugar_token",
    expected: "200 already unlocked from seed"
  },
  {
    game: "Fragments of Faith",
    gameId: "game_faith",
    key: "demo-faith-key",
    session: "No seeded session",
    player: "Create one or use API tests",
    artifact: "artifact_faith_reliquary",
    expected: "400 until a matching active session exists"
  },
  {
    game: "Bantay Dagat",
    gameId: "game_dagat",
    key: "demo-dagat-key",
    session: "No seeded session",
    player: "Create one or use API tests",
    artifact: "artifact_dagat_chart",
    expected: "400 until a matching active session exists"
  },
  {
    game: "Weaver's Tide",
    gameId: "game_weave",
    key: "demo-weave-key",
    session: "No seeded session",
    player: "Create one or use API tests",
    artifact: "artifact_weave_shell",
    expected: "400 until a matching active session exists"
  }
];

const statusCodes = [
  {
    code: "201",
    status: "unlocked",
    meaning: "The artifact was attached to the player profile."
  },
  {
    code: "200",
    status: "already_unlocked",
    meaning: "The same player already owns the artifact. This is safe to retry."
  },
  {
    code: "401",
    status: "unauthorized",
    meaning: "The developer key is missing or does not belong to the submitted game."
  },
  {
    code: "400",
    status: "invalid_session",
    meaning: "The session is missing, expired, tied to another player, or tied to another game."
  },
  {
    code: "400",
    status: "invalid_artifact",
    meaning: "The artifact does not exist or does not belong to the submitted game."
  },
  {
    code: "400",
    status: "invalid_request",
    meaning: "The JSON body is malformed or missing a required field."
  }
];

export default function DeveloperPage() {
  return (
    <div className="page developer-page">
      <section className="developer-hero">
        <div>
          <p className="eyebrow">Developer API</p>
          <h1 className="page-title">Artifact unlock handshake</h1>
          <p className="lead">
            Use this endpoint when a game awards a hidden artifact. It validates the
            developer key, active session, player, game, and artifact before writing to
            the portal profile.
          </p>
          <div className="actions">
            <Button asChild size="lg">
              <a href="#mock-tester">Test endpoint</a>
            </Button>
            <Button asChild size="lg" variant="secondary">
              <a href="/profile/user_maya">View PixelKite profile</a>
            </Button>
          </div>
        </div>
        <aside className="endpoint-card" aria-label="Endpoint summary">
          <span>POST</span>
          <code>/api/achievements/unlock</code>
          <p>
            Content type: <code>application/json</code>
          </p>
          <p>
            Reset fixture data before each demo run if you need the first request to
            return <code>201</code>.
          </p>
          <SeedButton />
        </aside>
      </section>

      <section className="doc-section">
        <h2 className="section-title">Request contract</h2>
        <div className="contract-grid">
          <article className="panel">
            <h3>Required fields</h3>
            <div className="field-list">
              <div>
                <code>sessionId</code>
                <span>Active portal session for the player and game.</span>
              </div>
              <div>
                <code>playerId</code>
                <span>Portal user ID that owns the session.</span>
              </div>
              <div>
                <code>gameId</code>
                <span>Game issuing the unlock.</span>
              </div>
              <div>
                <code>artifactId</code>
                <span>Artifact that belongs to the submitted game.</span>
              </div>
              <div>
                <code>developerKey</code>
                <span>Game-specific API key from the seed data or developer setup.</span>
              </div>
            </div>
          </article>

          <article className="panel">
            <h3>Example request body</h3>
            <pre>{requestBody}</pre>
          </article>
        </div>
      </section>

      <section className="doc-section">
        <h2 className="section-title">Example usage</h2>
        <div className="example-grid">
          <article className="panel">
            <h3>cURL</h3>
            <pre>{curlExample}</pre>
          </article>
          <article className="panel">
            <h3>201 response</h3>
            <pre>{successResponse}</pre>
          </article>
        </div>
      </section>

      <section className="doc-section">
        <h2 className="section-title">Seed fixtures for mock testing</h2>
        <p className="muted doc-copy">
          These values come from <code>lib/seed.ts</code>. Use the seed button or
          <code>npm run db:seed</code> to restore this state before testing.
        </p>
        <div className="fixture-table-wrap">
          <table className="fixture-table">
            <thead>
              <tr>
                <th>Game</th>
                <th>IDs to send</th>
                <th>Expected result</th>
              </tr>
            </thead>
            <tbody>
              {fixtures.map((fixture) => (
                <tr key={fixture.gameId}>
                  <td>
                    <strong>{fixture.game}</strong>
                    <code>{fixture.gameId}</code>
                    <code>{fixture.key}</code>
                  </td>
                  <td>
                    <code>{fixture.session}</code>
                    <code>{fixture.player}</code>
                    <code>{fixture.artifact}</code>
                  </td>
                  <td>{fixture.expected}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="doc-section">
        <h2 className="section-title">Status behavior</h2>
        <div className="status-grid">
          {statusCodes.map((item) => (
            <article className="status-card" key={`${item.code}-${item.status}`}>
              <strong>{item.code}</strong>
              <code>{item.status}</code>
              <p>{item.meaning}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="doc-section" id="mock-tester">
        <h2 className="section-title">Live mock tester</h2>
        <p className="muted doc-copy">
          The default payload matches the seeded PixelKite session and Echoes of Panay artifact.
          Send it once after reseeding to create the unlock, then send it again to verify
          idempotency.
        </p>
        <UnlockTester />
      </section>
    </div>
  );
}
