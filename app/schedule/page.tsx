import Link from "next/link";
import { getSeasonSchedule, getNextRace } from "@/lib/f1/api";
import { flag } from "@/lib/f1/flags";

export const revalidate = 3600;
export const metadata = { title: "Schedule — The Pit Wall" };

function fmt(date: string, time?: string) {
  const d = new Date(`${date}T${time ?? "00:00:00Z"}`);
  return d.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    timeZone: "UTC",
  });
}

export default async function SchedulePage() {
  const [races, nextRace] = await Promise.all([
    getSeasonSchedule("current").catch(() => []),
    getNextRace(),
  ]);
  const season = races[0]?.season ?? "";
  const nextRound = nextRace ? Number(nextRace.round) : null;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <div className="kicker mb-1">{season} Calendar · {races.length} Rounds</div>
      <h1 className="mb-8 font-display text-4xl font-semibold tracking-tight sm:text-5xl">
        Season <span className="italic text-accent">Schedule</span>
      </h1>

      <div className="border-t border-rule-strong">
        {races.map((race) => {
          const round = Number(race.round);
          const isNext = nextRound === round;
          const isDone = nextRound !== null && round < nextRound;
          return (
            <Link
              key={race.round}
              href={`/race/${season}/${race.round}`}
              className={`group grid grid-cols-[2.5rem_1fr_auto] items-center gap-3 border-b border-rule py-4 transition-colors hover:bg-paper-raised sm:grid-cols-[3rem_1.4rem_1fr_auto] sm:gap-4 ${
                isDone ? "opacity-60 hover:opacity-100" : ""
              }`}
            >
              <span className="font-mono text-sm tabular-nums text-ink-faint">
                R{race.round}
              </span>
              <span className="hidden text-xl sm:block">
                {flag(race.Circuit.Location.country)}
              </span>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-display text-lg font-semibold leading-tight group-hover:text-accent">
                    {race.raceName}
                  </span>
                  {isNext && (
                    <span className="shrink-0 bg-accent px-1.5 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-[0.14em] text-accent-ink">
                      Next
                    </span>
                  )}
                </div>
                <div className="truncate font-mono text-[11px] uppercase tracking-[0.1em] text-ink-soft">
                  {race.Circuit.circuitName} · {race.Circuit.Location.locality},{" "}
                  {race.Circuit.Location.country}
                </div>
              </div>
              <div className="text-right">
                <div className="font-mono text-sm tabular-nums">
                  {fmt(race.date, race.time)}
                </div>
                {race.Sprint && (
                  <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-accent">
                    Sprint
                  </div>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
