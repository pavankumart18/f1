import Link from "next/link";
import type { Race } from "@/lib/f1/types";
import { flag } from "@/lib/f1/flags";

function shortDate(date: string) {
  const d = new Date(date + "T00:00:00Z");
  return {
    day: d.toLocaleDateString("en-GB", { day: "2-digit", timeZone: "UTC" }),
    month: d
      .toLocaleDateString("en-GB", { month: "short", timeZone: "UTC" })
      .toUpperCase(),
  };
}

export function CalendarStrip({
  races,
  nextRound,
  season,
}: {
  races: Race[];
  nextRound: number | null;
  season: string;
}) {
  return (
    <div className="thin-scroll -mx-1 flex gap-2 overflow-x-auto px-1 pb-3">
      {races.map((race) => {
        const round = Number(race.round);
        const isNext = nextRound === round;
        const isDone = nextRound !== null && round < nextRound;
        const d = shortDate(race.date);
        return (
          <Link
            key={race.round}
            href={`/race/${season}/${race.round}`}
            className={[
              "group relative flex min-w-[8.5rem] shrink-0 flex-col justify-between border p-3 transition-colors",
              isNext
                ? "border-accent bg-paper-raised"
                : "border-rule hover:border-rule-strong",
              isDone ? "opacity-55 hover:opacity-100" : "",
            ].join(" ")}
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-faint">
                R{race.round}
              </span>
              {isNext && (
                <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-accent">
                  ● Next
                </span>
              )}
              {isDone && (
                <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-ink-faint">
                  ✓
                </span>
              )}
            </div>
            <div className="mt-3">
              <div className="text-lg leading-none">{flag(race.Circuit.Location.country)}</div>
              <div className="mt-1.5 font-display text-sm font-semibold leading-tight group-hover:text-accent">
                {race.Circuit.Location.locality}
              </div>
              <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.1em] text-ink-soft">
                {d.day} {d.month}
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
