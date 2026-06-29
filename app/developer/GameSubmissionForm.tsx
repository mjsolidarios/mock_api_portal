"use client";

import Image from "next/image";
import { useState } from "react";
import { CheckCircle2, FileJson2, ImagePlus, Loader2, RefreshCcw, Sparkles } from "lucide-react";
import { JsonCodeBlock } from "@/components/JsonCodeBlock";
import { Button } from "@/components/ui/button";

const defaultDraft = {
  title: "Balangay Signal",
  developer: "Tester Studio",
  region: "Region 6",
  description:
    "A browser game about tracing island signals, repairing routes, and discovering a hidden museum artifact.",
  lore:
    "Each restored signal reveals a memory fragment from Western Visayas trade routes and coastal communities.",
  coverUrl: "/game-covers/balangay-signal-cover.png",
  heroUrl: "/game-covers/balangay-signal-hero.png",
  artifactName: "Signal Shell",
  artifactDescription: "A shell marker used to relay warnings between coastal settlements.",
  artifactImageUrl: "/artifacts/signal-shell-sample.png",
  artifactRarity: "Rare"
};

type GameDraft = typeof defaultDraft;
type UploadField = "coverUrl" | "heroUrl" | "artifactImageUrl";
type UploadPurpose = "cover" | "hero" | "artifact";
type SubmissionIssues = Partial<Record<keyof GameDraft, string[]>>;
type SubmissionResponse = {
  status: number;
  body: {
    status?: string;
    message?: string;
    game?: {
      id: string;
      title: string;
      artifacts?: Array<{ id: string; name: string }>;
      apiKeys?: Array<{ key: string }>;
      sessions?: Array<{ id: string }>;
    };
    mockUnlock?: {
      sessionId: string;
      playerId: string;
      gameId: string;
      artifactId: string;
      developerKey: string;
    };
    issues?: SubmissionIssues;
  };
};

const uploadFields: Array<{
  field: UploadField;
  label: string;
  purpose: UploadPurpose;
  helper: string;
  dimensions: string;
  ratio: string;
}> = [
  {
    field: "coverUrl",
    label: "Cover image",
    purpose: "cover",
    helper: "Used in catalogue lists and cards.",
    dimensions: "1200 x 1600 px",
    ratio: "3:4 portrait"
  },
  {
    field: "heroUrl",
    label: "Hero image",
    purpose: "hero",
    helper: "Used on the game detail page.",
    dimensions: "1600 x 900 px",
    ratio: "16:9 landscape"
  },
  {
    field: "artifactImageUrl",
    label: "Artifact image",
    purpose: "artifact",
    helper: "Displayed in the unlock library.",
    dimensions: "1200 x 1200 px",
    ratio: "1:1 square"
  }
];

export function GameSubmissionForm() {
  const [draft, setDraft] = useState<GameDraft>(defaultDraft);
  const [response, setResponse] = useState<SubmissionResponse | null>(null);
  const [issues, setIssues] = useState<SubmissionIssues>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingField, setUploadingField] = useState<UploadField | null>(null);

  function updateField<K extends keyof GameDraft>(field: K, value: GameDraft[K]) {
    setDraft((current) => ({
      ...current,
      [field]: value
    }));
    setIssues((current) => ({
      ...current,
      [field]: undefined
    }));
  }

  async function uploadImage({
    field,
    purpose,
    file
  }: {
    field: UploadField;
    purpose: UploadPurpose;
    file: File;
  }) {
    setUploadingField(field);
    setResponse(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("purpose", purpose);

      const uploadResponse = await fetch("/api/uploads/image", {
        method: "POST",
        body: formData
      });
      const data = (await uploadResponse.json()) as {
        message?: string;
        upload?: {
          secureUrl?: string;
        };
      };

      if (!uploadResponse.ok || !data.upload?.secureUrl) {
        throw new Error(data.message || "Image upload failed.");
      }

      updateField(field, data.upload.secureUrl);
      setResponse({
        status: 200,
        body: {
          status: "uploaded",
          message: `${file.name} uploaded for ${field}.`
        }
      });
    } catch (error) {
      setResponse({
        status: 400,
        body: {
          status: "upload_failed",
          message: error instanceof Error ? error.message : "Image upload failed."
        }
      });
    } finally {
      setUploadingField(null);
    }
  }

  async function submitGame() {
    setIsSubmitting(true);
    setIssues({});
    setResponse(null);

    try {
      const apiResponse = await fetch("/api/games", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(draft)
      });
      const data = (await apiResponse.json()) as SubmissionResponse["body"];
      setResponse({
        status: apiResponse.status,
        body: data
      });

      if (apiResponse.status === 400 && data.issues) {
        setIssues(data.issues);
      }
    } catch (error) {
      setResponse({
        status: 500,
        body: {
          status: "request_failed",
          message:
            error instanceof Error ? error.message : "Unable to create tester game."
        }
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  function resetDraft() {
    setDraft(defaultDraft);
    setIssues({});
    setResponse(null);
  }

  const created = response?.status === 201 ? response.body : null;
  const payloadPreview = JSON.stringify(draft, null, 2);

  return (
    <div className="submission-workspace">
      <section className="panel submission-form-panel">
        <div className="panel-heading submission-panel-heading">
          <div>
            <h2>Game submission</h2>
            <p className="muted">
              Fill the record directly. The portal builds the request payload and returns
              the generated game, artifact, session, and key IDs.
            </p>
          </div>
          <div className="submission-toolbar">
            <Button type="button" variant="outline" size="sm" onClick={resetDraft}>
              <RefreshCcw aria-hidden="true" />
              Reset draft
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setDraft(defaultDraft)}
            >
              <Sparkles aria-hidden="true" />
              Use sample
            </Button>
          </div>
        </div>

        <div className="submission-flow">
          <div>
            <strong>1</strong>
            <span>Fill the catalogue and artifact fields.</span>
          </div>
          <div>
            <strong>2</strong>
            <span>Upload images or keep hosted URLs.</span>
          </div>
          <div>
            <strong>3</strong>
            <span>Create the mock setup and inspect the generated IDs.</span>
          </div>
        </div>

        <div className="submission-section">
          <div className="submission-section-heading">
            <h3>Game basics</h3>
            <p>Core catalogue information shown across the store and game detail pages.</p>
          </div>
          <div className="submission-grid submission-grid-two">
            <label className="field">
              <span>Game title</span>
              <input
                value={draft.title}
                onChange={(event) => updateField("title", event.target.value)}
              />
              {issues.title ? <small>{issues.title[0]}</small> : null}
            </label>
            <label className="field">
              <span>Developer</span>
              <input
                value={draft.developer}
                onChange={(event) => updateField("developer", event.target.value)}
              />
              {issues.developer ? <small>{issues.developer[0]}</small> : null}
            </label>
            <label className="field">
              <span>Region</span>
              <input
                value={draft.region}
                onChange={(event) => updateField("region", event.target.value)}
              />
              {issues.region ? <small>{issues.region[0]}</small> : null}
            </label>
            <div className="submission-note">
              <strong>Mock session target</strong>
              <span>The portal currently creates the seed-backed session for PixelKite.</span>
            </div>
          </div>
        </div>

        <div className="submission-section">
          <div className="submission-section-heading">
            <h3>Description and lore</h3>
            <p>Keep the short description practical and reserve story detail for lore.</p>
          </div>
          <div className="submission-grid">
            <label className="field">
              <span>Description</span>
              <textarea
                rows={4}
                value={draft.description}
                onChange={(event) => updateField("description", event.target.value)}
              />
              {issues.description ? <small>{issues.description[0]}</small> : null}
            </label>
            <label className="field">
              <span>Lore</span>
              <textarea
                rows={5}
                value={draft.lore}
                onChange={(event) => updateField("lore", event.target.value)}
              />
              {issues.lore ? <small>{issues.lore[0]}</small> : null}
            </label>
          </div>
        </div>

        <div className="submission-section">
          <div className="submission-section-heading">
            <h3>Media</h3>
            <p>Each upload writes the Cloudinary URL back into the draft immediately.</p>
          </div>
          <div className="media-grid" aria-label="Game submission image uploads">
            {uploadFields.map((item) => (
              <article className="media-card" key={item.field}>
                <div className="media-preview">
                  {draft[item.field] ? (
                    <Image
                      src={draft[item.field]}
                      alt={item.label}
                      fill
                      sizes="(max-width: 720px) 100vw, 30vw"
                    />
                  ) : null}
                </div>
                <div className="media-card-body">
                  <div>
                    <strong>{item.label}</strong>
                    <p>{item.helper}</p>
                  </div>
                  <div className="media-specs" aria-label={`${item.label} upload guidance`}>
                    <span>{item.dimensions}</span>
                    <small>{item.ratio}</small>
                  </div>
                  <label className="media-upload-button">
                    <input
                      accept="image/gif,image/jpeg,image/png,image/webp"
                      disabled={uploadingField === item.field}
                      type="file"
                      onChange={(event) => {
                        const file = event.target.files?.[0];

                        if (file) {
                          uploadImage({
                            field: item.field,
                            purpose: item.purpose,
                            file
                          });
                        }

                        event.target.value = "";
                      }}
                    />
                    {uploadingField === item.field ? (
                      <Loader2 aria-hidden="true" className="spin" />
                    ) : (
                      <ImagePlus aria-hidden="true" />
                    )}
                    <span>
                      {uploadingField === item.field ? "Uploading..." : "Upload image"}
                    </span>
                  </label>
                  <label className="field field-compact">
                    <span>Hosted URL</span>
                    <input
                      value={draft[item.field]}
                      onChange={(event) => updateField(item.field, event.target.value)}
                    />
                    {issues[item.field] ? <small>{issues[item.field]?.[0]}</small> : null}
                  </label>
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="submission-section">
          <div className="submission-section-heading">
            <h3>Unlock artifact</h3>
            <p>The hidden artifact is created alongside the game for API-handshake testing.</p>
          </div>
          <div className="submission-grid submission-grid-two">
            <label className="field">
              <span>Artifact name</span>
              <input
                value={draft.artifactName}
                onChange={(event) => updateField("artifactName", event.target.value)}
              />
              {issues.artifactName ? <small>{issues.artifactName[0]}</small> : null}
            </label>
            <label className="field">
              <span>Rarity</span>
              <select
                value={draft.artifactRarity}
                onChange={(event) => updateField("artifactRarity", event.target.value)}
              >
                {["Common", "Rare", "Epic", "Legendary"].map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              {issues.artifactRarity ? <small>{issues.artifactRarity[0]}</small> : null}
            </label>
            <label className="field submission-grid-full">
              <span>Artifact description</span>
              <textarea
                rows={4}
                value={draft.artifactDescription}
                onChange={(event) => updateField("artifactDescription", event.target.value)}
              />
              {issues.artifactDescription ? (
                <small>{issues.artifactDescription[0]}</small>
              ) : null}
            </label>
          </div>
        </div>

        <div className="actions submission-actions">
          <Button disabled={isSubmitting} onClick={submitGame} type="button" size="lg">
            {isSubmitting ? "Creating..." : "Create tester game"}
          </Button>
          <Button asChild size="lg" variant="secondary">
            <a href="/games">Browse catalogue</a>
          </Button>
        </div>
      </section>

      <aside className="submission-sidebar">
        <section className="panel submission-response-panel">
          <div className="panel-heading">
            <div>
              <h2>Latest result</h2>
              <p className="muted">The portal returns the generated IDs needed for unlock testing.</p>
            </div>
          </div>

          {created ? (
            <div className="result-stack">
              <div className="result-banner result-banner-success">
                <CheckCircle2 aria-hidden="true" />
                <div>
                  <strong>Tester game created</strong>
                  <span>{created.game?.title}</span>
                </div>
              </div>
              <div className="result-grid">
                <div>
                  <span>Game ID</span>
                  <code>{created.mockUnlock?.gameId}</code>
                </div>
                <div>
                  <span>Artifact ID</span>
                  <code>{created.mockUnlock?.artifactId}</code>
                </div>
                <div>
                  <span>Session ID</span>
                  <code>{created.mockUnlock?.sessionId}</code>
                </div>
                <div>
                  <span>Developer key</span>
                  <code>{created.mockUnlock?.developerKey}</code>
                </div>
              </div>
            </div>
          ) : (
            <div
              className={`result-banner${response ? " result-banner-muted" : " result-banner-idle"}`}
            >
              <CheckCircle2 aria-hidden="true" />
              <div>
                <strong>{response?.body.status || "No submission yet"}</strong>
                <span>
                  {response?.body.message ||
                    "Create a tester game to generate the mock unlock IDs."}
                </span>
              </div>
            </div>
          )}

          <JsonCodeBlock
            ariaLabel="Game submission response JSON"
            value={response ? JSON.stringify(response, null, 2) : ""}
            emptyText="Waiting for a submission result."
          />
        </section>

        <section className="panel submission-preview-panel">
          <div className="panel-heading">
            <div>
              <h2>Payload preview</h2>
              <p className="muted">This is the exact body sent to POST /api/games.</p>
            </div>
            <FileJson2 aria-hidden="true" className="submission-preview-icon" />
          </div>
          <JsonCodeBlock
            ariaLabel="Game submission payload JSON"
            value={payloadPreview}
          />
        </section>
      </aside>
    </div>
  );
}
