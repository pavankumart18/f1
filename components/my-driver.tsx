"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Star, TrendingUp, TrendingDown, Minus } from "lucide-react";
import type { DriverStanding } from "@/lib/f1/types";
import { flag } from "@/lib/f1/flags";
import { teamColor, teamName } from "@/lib/f1/teams";

const KEY = "pitwall-fav";

export interface LastRaceLite {
  name: string;
  results: {
    id: string;
    position: string;
    grid: string;
    points: string;
    status: string;
  }[];
}

export function MyDriverCard({
  drivers,
  lastRace,
}: {
  drivers: DriverStanding[];
  lastRace: LastRaceLite | null;
}) {
  const [fav, setFav] = useState<{ id: string; name: string } | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const read = () => {
      try {
        const r = localStorage.getItem(KEY);
        setFav(r ? JSON.parse(r) : null);
      } catch {
        setFav(null);
      }
    };
    read();
    window.addEventListener("pitwall-fav-change", read);
    return () => window.removeEventListener("pitwall-fav-change", read);
  }, []);

  if (!mounted) return null;

  if (!fav) {
    return (
      <Link
        href="/standings"
        className="flex items-center justify-between gap-3 border border-dashed border-rule-strong px-4 py-3 transition-colors hover:border-accent"
      >
        <span className="flex items-center gap-2 text-sm text-ink-soft">
          <Star className="size-4 text-accent" />
          Pick your driver — open any driver and tap{" "}
          <span className="font-semibold text-ink">“Set as my driver”</span>
        </span>
        <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-accent">
          Browse →
        </span>
      </Link>
    );
  }

  const s = drivers.find((d) => d.Driver.driverId === fav.id);
  const team = s?.Constructors.at(-1);
  const color = teamColor(team?.constructorId);
  const last = lastRace?.results.find((r) => r.id === fav.id);
  const delta = last ? Number(last.grid) - Number(last.position) : 0;

  return (
    <Link
      href={`/driver/${fav.id}`}
      className="block border border-rule-strong transition-colors hover:bg-paper-raised"
      style={{ "--accent": color } as React.CSSProperties}
    >
      <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
        {/* identity */}
        <div className="flex items-center gap-3">
          <span className="h-12 w-1.5" style={{ background: color }} />
          <div>
            <div className="kicker">
              <Star className="mr-1 inline size-3 text-accent" fill="currentColor" />
              Your Driver
            </div>
            <div className="font-display text-xl font-semibold leading-tight">
              {s ? `${flag(s.Driver.nationality)} ` : ""}
              {fav.name}
            </div>
            {team && (
              <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-ink-soft">
                {teamName(team.constructorId, team.name)}
              </div>
            )}
          </div>
        </div>

        {/* live performance */}
        <div className="flex items-stretch gap-3 sm:gap-5">
          {s && (
            <>
              <Metric value={`P${s.position}`} label="Title" accent />
              <Metric value={s.points} label="Points" />
              <Metric value={s.wins} label="Wins" />
            </>
          )}
          {last && (
            <div className="flex flex-col justify-center border-l border-rule pl-3 sm:pl-5">
              <div className="kicker mb-0.5">Last Race</div>
              <div className="flex items-center gap-1.5">
                <span className="font-mono text-lg font-semibold tabular-nums">
                  {/^\d+$/.test(last.position) ? `P${last.position}` : "DNF"}
                </span>
                {delta !== 0 && /^\d+$/.test(last.position) && (
                  <span
                    className={`flex items-center gap-0.5 font-mono text-xs ${
                      delta > 0 ? "text-positive" : "text-negative"
                    }`}
                  >
                    {delta > 0 ? (
                      <TrendingUp className="size-3" />
                    ) : (
                      <TrendingDown className="size-3" />
                    )}
                    {Math.abs(delta)}
                  </span>
                )}
                {delta === 0 && /^\d+$/.test(last.position) && (
                  <Minus className="size-3 text-ink-faint" />
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

function Metric({
  value,
  label,
  accent,
}: {
  value: string | number;
  label: string;
  accent?: boolean;
}) {
  return (
    <div className="flex flex-col justify-center">
      <div
        className={`font-mono text-lg font-semibold tabular-nums ${accent ? "text-accent" : ""}`}
      >
        {value}
      </div>
      <div className="kicker">{label}</div>
    </div>
  );
}
