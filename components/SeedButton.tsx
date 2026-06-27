"use client";

import { useState, useTransition } from "react";
import { Database, Loader2, RefreshCw } from "lucide-react";

type SeedState = "idle" | "loading" | "success" | "error";

export function SeedButton() {
  const [state, setState] = useState<SeedState>("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const handleSeed = async () => {
    setState("loading");
    setMessage(null);
    try {
      const response = await fetch("/api/admin/seed", { method: "POST" });
      const data = await response.json();
      if (!response.ok || !data.ok) {
        throw new Error(data?.message ?? "Seed failed.");
      }
      setState("success");
      setMessage(
        `Seeded ${data.summary.games} games, ${data.summary.artifacts} artifacts.`
      );
      startTransition(() => {
        if (typeof window !== "undefined") {
          window.location.reload();
        }
      });
    } catch (error) {
      setState("error");
      setMessage(error instanceof Error ? error.message : "Seed failed.");
    }
  };

  const isLoading = state === "loading";
  const icon = isLoading ? Loader2 : state === "success" ? RefreshCw : Database;

  return (
    <div className="seed-button-wrap">
      <button
        type="button"
        className={`seed-button seed-button-${state}`}
        onClick={handleSeed}
        disabled={isLoading}
        aria-label="Reset and reseed demo data"
        title="Reset and reseed demo data"
      >
        {(() => {
          const Icon = icon;
          return <Icon aria-hidden="true" className={isLoading ? "spin" : undefined} />;
        })()}
        <span>{isLoading ? "Seeding…" : "Seed demo data"}</span>
      </button>
      {message ? (
        <span
          className={`seed-button-toast seed-button-toast-${state}`}
          role={state === "error" ? "alert" : "status"}
        >
          {message}
        </span>
      ) : null}
    </div>
  );
}