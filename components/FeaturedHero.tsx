"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export type FeaturedGame = {
  id: string;
  title: string;
  heroUrl: string;
  coverUrl: string;
};

type FeaturedHeroProps = {
  games: FeaturedGame[];
  signals: Record<string, string>;
  intervalMs?: number;
};

const FADE_MS = 700;

export function FeaturedHero({
  games,
  signals,
  intervalMs = 5000
}: FeaturedHeroProps) {
  const [displayIdx, setDisplayIdx] = useState(0);
  const [outgoingIdx, setOutgoingIdx] = useState<number | null>(null);
  const displayIdxRef = useRef(0);

  useEffect(() => {
    displayIdxRef.current = displayIdx;
  }, [displayIdx]);

  useEffect(() => {
    if (games.length <= 1) return;
    const id = window.setInterval(() => {
      const current = displayIdxRef.current;
      const next = (current + 1) % games.length;
      setOutgoingIdx(current);
      setDisplayIdx(next);
      window.setTimeout(() => setOutgoingIdx(null), FADE_MS + 80);
    }, intervalMs);
    return () => window.clearInterval(id);
  }, [games.length, intervalMs]);

  if (games.length === 0) return null;

  const current = games[displayIdx];

  return (
    <Link
      className="discover-hero-media"
      href={`/games/${current.id}`}
      aria-label={`Featured: ${current.title}`}
    >
      <span className="discover-hero-stage" aria-hidden="true">
        {outgoingIdx !== null && outgoingIdx !== displayIdx ? (
          <Image
            key={`out-${outgoingIdx}`}
            className="discover-hero-img discover-hero-img-out"
            src={games[outgoingIdx].heroUrl}
            alt=""
            width={1400}
            height={900}
            sizes="(max-width: 980px) 100vw, 60vw"
          />
        ) : null}
        <Image
          key={`in-${displayIdx}`}
          className="discover-hero-img discover-hero-img-in"
          src={current.heroUrl}
          alt=""
          width={1400}
          height={900}
          priority
          sizes="(max-width: 980px) 100vw, 60vw"
        />
      </span>
      <span className="discover-hero-glow" aria-hidden="true" />
      <span className="discover-hero-note" key={`note-${current.id}`}>
        {signals[current.id] ?? "Artifact unlocks"}
      </span>
      {games.length > 1 ? (
        <span className="discover-hero-dots" aria-hidden="true">
          {games.map((game, dotIndex) => (
            <span
              key={game.id}
              className={`discover-hero-dot${
                dotIndex === displayIdx ? " is-active" : ""
              }`}
            />
          ))}
        </span>
      ) : null}
    </Link>
  );
}