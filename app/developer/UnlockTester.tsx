"use client";

import { useState } from "react";
import { JsonCodeBlock } from "@/components/JsonCodeBlock";
import { JsonCodeEditor } from "@/components/JsonCodeEditor";
import { Button } from "@/components/ui/button";

const mockRequests = [
  {
    label: "PixelKite unlocks Panay artifact",
    description: "Returns 201 on a fresh seed, then 200 when sent again.",
    payload: {
      sessionId: "session_maya_panay",
      playerId: "user_maya",
      gameId: "game_panay",
      artifactId: "artifact_panay_bell",
      developerKey: "demo-panay-key"
    }
  },
  {
    label: "Lio repeats Sugarline unlock",
    description: "Returns 200 because the seed already grants this artifact.",
    payload: {
      sessionId: "session_lio_sugar",
      playerId: "user_lio",
      gameId: "game_sugar",
      artifactId: "artifact_sugar_token",
      developerKey: "demo-sugar-key"
    }
  },
  {
    label: "Wrong developer key",
    description: "Returns 401 when the key does not match the game.",
    payload: {
      sessionId: "session_maya_panay",
      playerId: "user_maya",
      gameId: "game_panay",
      artifactId: "artifact_panay_bell",
      developerKey: "demo-sugar-key"
    }
  },
  {
    label: "Artifact belongs to another game",
    description: "Returns 400 because the artifact and game do not match.",
    payload: {
      sessionId: "session_maya_panay",
      playerId: "user_maya",
      gameId: "game_panay",
      artifactId: "artifact_sugar_token",
      developerKey: "demo-panay-key"
    }
  }
];

export function UnlockTester() {
  const [payload, setPayload] = useState(JSON.stringify(mockRequests[0].payload, null, 2));
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
    <div className="tester-grid">
      <section className="panel">
        <div className="panel-heading">
          <div>
            <h2>Unlock request</h2>
            <p className="muted">Pick a seed-backed case or edit the JSON directly.</p>
          </div>
        </div>
        <div className="scenario-list" aria-label="Mock request scenarios">
          {mockRequests.map((request) => (
            <button
              className="scenario-button"
              key={request.label}
              type="button"
              onClick={() => {
                setPayload(JSON.stringify(request.payload, null, 2));
                setResponse("");
              }}
            >
              <strong>{request.label}</strong>
              <span>{request.description}</span>
            </button>
          ))}
        </div>
        <JsonCodeEditor
          ariaLabel="Unlock request JSON"
          minRows={14}
          value={payload}
          onChange={setPayload}
        />
        <div className="actions">
          <Button disabled={isSubmitting} onClick={sendUnlock} type="button" size="lg">
            {isSubmitting ? "Sending..." : "Send unlock"}
          </Button>
          <Button asChild size="lg" variant="secondary">
            <a href="/profile/user_maya">
              View PixelKite profile
            </a>
          </Button>
        </div>
      </section>

      <section className="panel">
        <div className="panel-heading">
          <div>
            <h2>API response</h2>
            <p className="muted">The response includes the HTTP status for fast mock testing.</p>
          </div>
        </div>
        <JsonCodeBlock
          ariaLabel="Unlock response JSON"
          value={response}
          emptyText="Submit the sample request to unlock PixelKite's artifact."
        />
      </section>
    </div>
  );
}
