"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { F1Car } from "./f1-car";

export interface ShowcaseTeam {
  id: string;
  name: string;
  color: string;
  drivers: string[];
  points: string;
  position: string;
}

export function CarShowcase({ teams }: { teams: ShowcaseTeam[] }) {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const n = teams.length;

  const go = useCallback(
    (d: number) => setI((p) => (p + d + n) % n),
    [n]
  );

  useEffect(() => {
    if (paused || n <= 1) return;
    const id = setInterval(() => setI((p) => (p + 1) % n), 4000);
    return () => clearInterval(id);
  }, [paused, n]);

  if (!n) return null;
  const t = teams[i];

  return (
    <section
      className="relative overflow-hidden border-y border-rule-strong"
      style={{ background: `${t.color}0d` }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* team-colour top spine */}
      <div className="h-1 w-full transition-colors duration-700" style={{ background: t.color }} />

      <div className="mx-auto grid max-w-6xl items-center gap-4 px-4 py-7 sm:px-6 md:grid-cols-[1fr_1.3fr]">
        {/* copy */}
        <div key={`copy-${t.id}`} className="animate-rise order-2 md:order-1">
          <div className="kicker mb-1">
            The 2026 Grid · {String(i + 1).padStart(2, "0")} / {n}
          </div>
          <Link
            href={`/constructor/${t.id}`}
            className="font-display text-3xl font-semibold leading-none tracking-tight hover:text-accent sm:text-5xl"
          >
            {t.name}
          </Link>
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1">
            {t.drivers.map((d) => (
              <span key={d} className="font-display text-sm font-medium">
                {d}
              </span>
            ))}
          </div>
          <div className="mt-3 inline-flex items-center gap-3 border border-rule px-3 py-1.5">
            <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink-soft">
              Championship
            </span>
            <span className="font-mono text-sm font-semibold tabular-nums">
              P{t.position} · {t.points} pts
            </span>
          </div>
        </div>

        {/* car */}
        <div key={`car-${t.id}`} className="relative order-1 md:order-2">
          {/* speed lines */}
          <div className="pointer-events-none absolute inset-y-0 left-0 right-1/3 flex flex-col justify-center gap-2 opacity-40">
            {[60, 90, 70, 100, 55].map((w, k) => (
              <span
                key={k}
                className="block h-[2px] animate-rise"
                style={{ width: `${w}%`, background: t.color, animationDelay: `${k * 60}ms` }}
              />
            ))}
          </div>
          <F1Car color={t.color} spinning className="car-float relative w-full" />
        </div>
      </div>

      {/* controls */}
      <div className="absolute inset-x-0 bottom-2 flex items-center justify-center gap-2">
        <button onClick={() => go(-1)} aria-label="Previous" className="text-ink-faint hover:text-accent">
          <ChevronLeft className="size-4" />
        </button>
        {teams.map((tm, k) => (
          <button
            key={tm.id}
            onClick={() => setI(k)}
            aria-label={tm.name}
            className="h-1.5 rounded-full transition-all"
            style={{
              width: k === i ? 18 : 6,
              background: k === i ? t.color : "var(--rule-strong)",
            }}
          />
        ))}
        <button onClick={() => go(1)} aria-label="Next" className="text-ink-faint hover:text-accent">
          <ChevronRight className="size-4" />
        </button>
      </div>
    </section>
  );
}
