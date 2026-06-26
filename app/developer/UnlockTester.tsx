"use client";

import { useState } from "react";

const samplePayload = {
  sessionId: "session_maya_panay",
  playerId: "user_maya",
  gameId: "game_panay",
  artifactId: "artifact_panay_bell",
  developerKey: "demo-panay-key"
};

export function UnlockTester() {
  const [payload, setPayload] = useState(JSON.stringify(samplePayload, null, 2));
  const [response, setResponse] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function sendUnlock() {
    setIsSubmitting(true);
    setResponse("");

    try {
      const parsed = JSON.parse(payload) as unknown;
      const apiResponse = await fetch("/api/achievements/unlock", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(parsed)
      });
      const data = await apiResponse.json();
      setResponse(JSON.stringify({ status: apiResponse.status, body: data }, null, 2));
    } catch (error) {
      setResponse(
        JSON.stringify(
          {
            error: error instanceof Error ? error.message : "Invalid request payload."
          },
          null,
          2
        )
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="detail-grid">
      <section className="panel">
        <h2>Unlock request</h2>
        <textarea
          aria-label="Unlock request JSON"
          className="code-input"
          rows={14}
          value={payload}
          onChange={(event) => setPayload(event.target.value)}
        />
        <div className="actions">
          <button className="button" disabled={isSubmitting} onClick={sendUnlock} type="button">
            {isSubmitting ? "Sending..." : "Send unlock"}
          </button>
          <a className="button secondary" href="/profile/user_maya">
            View Maya profile
          </a>
        </div>
      </section>

      <section className="panel">
        <h2>API response</h2>
        <pre>{response || "Submit the sample request to unlock Maya's artifact."}</pre>
      </section>
    </div>
  );
}
