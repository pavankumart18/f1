"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Trophy, Check, X, Lock } from "lucide-react";

export interface RaceLite {
  season: string;
  round: string;
  name: string;
  date: string;
  time?: string;
}
export interface ResultLite {
  season: string;
  round: string;
  name: string;
  results: { id: string; name: string; position: string; grid: string; fl: boolean }[];
}
export type Picks = { p1?: string; p2?: string; p3?: string; pole?: string; fl?: string };

const SLOTS: { key: keyof Picks; label: string; pts: number }[] = [
  { key: "p1", label: "Race Winner", pts: 25 },
  { key: "p2", label: "2nd Place", pts: 18 },
  { key: "p3", label: "3rd Place", pts: 15 },
  { key: "pole", label: "Pole (start P1)", pts: 10 },
  { key: "fl", label: "Fastest Lap", pts: 10 },
];

const keyFor = (r: { season: string; round: string }) =>
  `pitwall-pred-${r.season}-${r.round}`;
const SCORED = "pitwall-pred-scored";

function scoreRace(picks: Picks, res: ResultLite) {
  const top3 = res.results.slice(0, 3).map((r) => r.id);
  const actual = {
    p1: res.results[0]?.id,
    p2: res.results[1]?.id,
    p3: res.results[2]?.id,
    pole: res.results.find((r) => r.grid === "1")?.id,
    fl: res.results.find((r) => r.fl)?.id,
  };
  const lines: { label: string; got: number; pick?: string; hit: "exact" | "partial" | "miss" }[] = [];
  let total = 0;
  for (const s of SLOTS) {
    const pick = picks[s.key];
    let got = 0;
    let hit: "exact" | "partial" | "miss" = "miss";
    if (pick) {
      if (pick === actual[s.key]) { got = s.pts; hit = "exact"; }
      else if ((s.key === "p1" || s.key === "p2" || s.key === "p3") && top3.includes(pick)) {
        got = 5; hit = "partial";
      }
    }
    total += got;
    lines.push({ label: s.label, got, pick, hit });
  }
  return { total, lines, actual };
}

export function PredictionsGame({
  nextRace,
  lastRace,
  drivers,
}: {
  nextRace: RaceLite | null;
  lastRace: ResultLite | null;
  drivers: { id: string; name: string }[];
}) {
  const [mounted, setMounted] = useState(false);
  const [picks, setPicks] = useState<Picks>({});
  const [saved, setSaved] = useState(false);
  const [scoredMap, setScoredMap] = useState<Record<string, number>>({});

  const nameOf = useMemo(
    () => Object.fromEntries(drivers.map((d) => [d.id, d.name])),
    [drivers]
  );

  useEffect(() => {
    setMounted(true);
    try {
      if (nextRace) {
        const raw = localStorage.getItem(keyFor(nextRace));
        if (raw) { setPicks(JSON.parse(raw)); setSaved(true); }
      }
      const sc: Record<string, number> = JSON.parse(
        localStorage.getItem(SCORED) || "{}"
      );
      // Score the last race if it was predicted and not yet scored.
      if (lastRace) {
        const lk = `${lastRace.season}-${lastRace.round}`;
        const predRaw = localStorage.getItem(keyFor(lastRace));
        if (predRaw && !(lk in sc)) {
          sc[lk] = scoreRace(JSON.parse(predRaw), lastRace).total;
          localStorage.setItem(SCORED, JSON.stringify(sc));
        }
      }
      setScoredMap(sc);
    } catch {}
  }, [nextRace, lastRace]);

  const locked = nextRace
    ? Date.now() > new Date(`${nextRace.date}T${nextRace.time ?? "12:00:00Z"}`).getTime()
    : false;

  function set(key: keyof Picks, id: string) {
    setPicks((p) => ({ ...p, [key]: id || undefined }));
    setSaved(false);
  }
  function save() {
    if (!nextRace) return;
    localStorage.setItem(keyFor(nextRace), JSON.stringify(picks));
    setSaved(true);
  }

  const season = nextRace?.season ?? lastRace?.season ?? "";
  const seasonTotal = Object.entries(scoredMap)
    .filter(([k]) => k.startsWith(`${season}-`))
    .reduce((a, [, v]) => a + v, 0);

  const lastResult =
    mounted && lastRace && localStorage.getItem(keyFor(lastRace))
      ? scoreRace(JSON.parse(localStorage.getItem(keyFor(lastRace))!), lastRace)
      : null;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <div className="flex items-end justify-between">
        <div>
          <div className="kicker mb-1">Play · The Pit Wall</div>
          <h1 className="font-display text-4xl font-semibold tracking-tight sm:text-5xl">
            Podium <span className="italic text-accent">Predictor</span>
          </h1>
        </div>
        {mounted && season && (
          <div className="text-right">
            <div className="font-mono text-2xl font-bold tabular-nums text-accent">
              {seasonTotal}
            </div>
            <div className="kicker">{season} pts</div>
          </div>
        )}
      </div>

      {/* Last race score */}
      {mounted && lastResult && lastRace && (
        <div className="mt-6 border border-rule-strong p-4">
          <div className="flex items-center justify-between">
            <div className="kicker">Last Race · {lastRace.name}</div>
            <div className="font-mono text-lg font-bold tabular-nums text-accent">
              +{lastResult.total} pts
            </div>
          </div>
          <ul className="mt-3 space-y-1.5">
            {lastResult.lines.map((l, i) => (
              <li key={i} className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  {l.hit === "exact" ? (
                    <Check className="size-3.5 text-positive" />
                  ) : l.hit === "partial" ? (
                    <Trophy className="size-3.5 text-accent" />
                  ) : (
                    <X className="size-3.5 text-ink-faint" />
                  )}
                  <span className="text-ink-soft">{l.label}:</span>
                  <span className="font-medium">
                    {l.pick ? nameOf[l.pick] ?? l.pick : "—"}
                  </span>
                </span>
                <span className="font-mono tabular-nums text-ink-soft">
                  {l.got > 0 ? `+${l.got}` : "0"}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Next race prediction */}
      {nextRace ? (
        <div className="mt-6">
          <div className="mb-3 flex items-center justify-between border-b border-rule-strong pb-2">
            <h2 className="font-display text-xl font-semibold">
              Your call · {nextRace.name}
            </h2>
            {locked && (
              <span className="flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">
                <Lock className="size-3" /> Locked
              </span>
            )}
          </div>

          <div className="space-y-3">
            {SLOTS.map((s) => (
              <label key={s.key} className="flex items-center gap-3">
                <span className="w-32 shrink-0 text-sm">
                  {s.label}{" "}
                  <span className="font-mono text-[10px] text-ink-faint">+{s.pts}</span>
                </span>
                <select
                  disabled={!mounted || locked}
                  value={picks[s.key] ?? ""}
                  onChange={(e) => set(s.key, e.target.value)}
                  className="flex-1 border border-rule-strong bg-paper px-3 py-2 font-display text-sm focus:border-accent focus:outline-none disabled:opacity-60"
                >
                  <option value="">Select driver…</option>
                  {drivers.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </label>
            ))}
          </div>

          {!locked && (
            <button
              onClick={save}
              disabled={!mounted}
              className="mt-5 inline-flex items-center gap-2 bg-ink px-5 py-2.5 font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-paper hover:bg-accent disabled:opacity-50"
            >
              {saved ? (
                <>
                  <Check className="size-4" /> Picks saved
                </>
              ) : (
                "Lock in my picks"
              )}
            </button>
          )}
          {locked && (
            <p className="mt-4 text-sm text-ink-soft">
              Predictions are locked — come back after the race to see your score.
            </p>
          )}
          <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">
            Saved on this device · scored automatically after the chequered flag
          </p>
        </div>
      ) : (
        <p className="mt-6 text-sm text-ink-soft">
          No upcoming race to predict right now. Check the{" "}
          <Link href="/schedule" className="text-accent">schedule</Link>.
        </p>
      )}
    </div>
  );
}
