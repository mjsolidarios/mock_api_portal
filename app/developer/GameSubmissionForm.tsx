"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

const defaultPayload = {
  title: "Balangay Signal",
  developer: "Tester Studio",
  region: "Region 6",
  description:
    "A browser game about tracing island signals, repairing routes, and discovering a hidden museum artifact.",
  lore:
    "Each restored signal reveals a memory fragment from Western Visayas trade routes and coastal communities.",
  coverUrl: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
  heroUrl: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1800&q=80",
  artifactName: "Signal Shell",
  artifactDescription: "A shell marker used to relay warnings between coastal settlements.",
  artifactImageUrl:
    "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=700&q=80",
  artifactRarity: "Rare"
};

type UploadField = "coverUrl" | "heroUrl" | "artifactImageUrl";
type UploadPurpose = "cover" | "hero" | "artifact";

export function GameSubmissionForm() {
  const [payload, setPayload] = useState(JSON.stringify(defaultPayload, null, 2));
  const [response, setResponse] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingField, setUploadingField] = useState<UploadField | null>(null);

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
    setResponse("");

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("purpose", purpose);

      const uploadResponse = await fetch("/api/uploads/image", {
        method: "POST",
        body: formData
      });
      const data = (await uploadResponse.json()) as {
        status?: string;
        message?: string;
        upload?: {
          secureUrl?: string;
        };
      };

      if (!uploadResponse.ok || !data.upload?.secureUrl) {
        throw new Error(data.message || "Image upload failed.");
      }

      const parsed = JSON.parse(payload) as Record<string, unknown>;
      parsed[field] = data.upload.secureUrl;
      setPayload(JSON.stringify(parsed, null, 2));
      setResponse(
        JSON.stringify(
          { status: "uploaded", field, secureUrl: data.upload.secureUrl },
          null,
          2
        )
      );
    } catch (error) {
      setResponse(
        JSON.stringify(
          {
            status: "upload_failed",
            field,
            error: error instanceof Error ? error.message : "Image upload failed."
          },
          null,
          2
        )
      );
    } finally {
      setUploadingField(null);
    }
  }

  async function submitGame() {
    setIsSubmitting(true);
    setResponse("");

    try {
      const parsed = JSON.parse(payload) as unknown;
      const apiResponse = await fetch("/api/games", {
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
            error: error instanceof Error ? error.message : "Invalid game submission payload."
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
            <h2>Tester game JSON</h2>
            <p className="muted">
              Upload images to Cloudinary or paste hosted URLs directly.
            </p>
          </div>
        </div>
        <div className="upload-grid" aria-label="Cloudinary image uploads">
          {[
            { field: "coverUrl", label: "Cover", purpose: "cover" },
            { field: "heroUrl", label: "Hero", purpose: "hero" },
            { field: "artifactImageUrl", label: "Artifact", purpose: "artifact" }
          ].map((item) => (
            <label className="upload-tile" key={item.field}>
              <span>{item.label}</span>
              <input
                accept="image/gif,image/jpeg,image/png,image/webp"
                disabled={uploadingField === item.field}
                type="file"
                onChange={(event) => {
                  const file = event.target.files?.[0];

                  if (file) {
                    uploadImage({
                      field: item.field as UploadField,
                      purpose: item.purpose as UploadPurpose,
                      file
                    });
                  }

                  event.target.value = "";
                }}
              />
              <small>
                {uploadingField === item.field
                  ? "Uploading to Cloudinary..."
                  : "Choose image, portal uploads it"}
              </small>
            </label>
          ))}
        </div>
        <noscript>
          <div className="upload-grid" aria-label="Cloudinary image uploads unavailable">
            {[
              { field: "coverUrl", label: "Cover" },
              { field: "heroUrl", label: "Hero" },
              { field: "artifactImageUrl", label: "Artifact" }
            ].map((item) => (
              <button
                key={item.field}
                className="upload-tile"
                disabled
                type="button"
              >
                <span>{item.label}</span>
                <small>JavaScript required</small>
              </button>
            ))}
          </div>
        </noscript>
        <textarea
          aria-label="Tester game JSON"
          className="code-input tall-code-input"
          rows={22}
          value={payload}
          onChange={(event) => setPayload(event.target.value)}
        />
        <div className="actions">
          <Button disabled={isSubmitting} onClick={submitGame} type="button" size="lg">
            {isSubmitting ? "Creating..." : "Create tester game"}
          </Button>
          <Button asChild size="lg" variant="secondary">
            <a href="/games">Browse catalogue</a>
          </Button>
        </div>
      </section>

      <section className="panel">
        <div className="panel-heading">
          <div>
            <h2>Created mock setup</h2>
            <p className="muted">
              The response includes the generated API key and unlock payload IDs.
            </p>
          </div>
        </div>
        <pre>
          {response ||
            "Submit a tester game to generate gameId, artifactId, sessionId, and developerKey."}
        </pre>
      </section>
    </div>
  );
}
