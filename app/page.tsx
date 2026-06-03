import Link from "next/link";
import {
  getSeasonSchedule,
  getNextRace,
  getDriverStandings,
  getConstructorStandings,
  getLastResults,
} from "@/lib/f1/api";
import { teamName, teamColor } from "@/lib/f1/teams";
import { flag } from "@/lib/f1/flags";
import { Countdown } from "@/components/countdown";
import { Ticker } from "@/components/ticker";
import { CalendarStrip } from "@/components/calendar-strip";
import {
  DriverStandingsTable,
  ConstructorStandingsTable,
} from "@/components/standings";
import { SectionHeading } from "@/components/section-heading";
import { Greeting } from "@/components/greeting";
import { CarShowcase, type ShowcaseTeam } from "@/components/car-showcase";
import { F1Car } from "@/components/f1-car";
import type {
  DriverStanding,
  ConstructorStanding,
  Race,
  RaceResult,
} from "@/lib/f1/types";

export const revalidate = 600;

function raceStart(race: { date: string; time?: string }) {
  return `${race.date}T${race.time ?? "12:00:00Z"}`;
}

export default async function Home() {
  const [schedule, nextRace, drivers, constructors, lastRace] =
    await Promise.all([
      getSeasonSchedule("current").catch(() => []),
      getNextRace(),
      getDriverStandings("current").catch(() => []),
      getConstructorStandings("current").catch(() => []),
      getLastResults(),
    ]);

  const season = schedule[0]?.season ?? new Date().getFullYear().toString();
  const nextRound = nextRace ? Number(nextRace.round) : null;
  const leader = drivers[0];
  const second = drivers[1];
  const gap =
    leader && second ? Number(leader.points) - Number(second.points) : 0;
  const cLeader = constructors[0];
  const lastWinner = lastRace?.Results?.[0];
  const fastest = lastRace?.Results?.find((r) => r.FastestLap?.rank === "1");
  const roundsDone = nextRound ? nextRound - 1 : schedule.length;

  // Group drivers under their constructor for the car slideshow.
  const teams: ShowcaseTeam[] = constructors.map((c) => ({
    id: c.Constructor.constructorId,
    name: teamName(c.Constructor.constructorId, c.Constructor.name),
    color: teamColor(c.Constructor.constructorId),
    drivers: drivers
      .filter((d) =>
        d.Constructors.some(
          (x) => x.constructorId === c.Constructor.constructorId
        )
      )
      .map((d) => `${d.Driver.givenName} ${d.Driver.familyName}`),
    points: c.points,
    position: c.position,
  }));

  // Live ticker — every item is derived from real data, not invented.
  const ticker: string[] = [
    leader &&
      `Championship leader · ${leader.Driver.givenName} ${leader.Driver.familyName} · ${leader.points} pts`,
    leader && second && `Title gap · ${gap} pts to ${second.Driver.familyName}`,
    cLeader &&
      `Constructors lead · ${teamName(cLeader.Constructor.constructorId, cLeader.Constructor.name)} · ${cLeader.points} pts`,
    nextRace &&
      `Next round · ${nextRace.raceName} · ${nextRace.Circuit.Location.locality}`,
    lastWinner &&
      `Last winner · ${lastWinner.Driver.givenName} ${lastWinner.Driver.familyName} at ${lastRace?.raceName}`,
    fastest?.FastestLap &&
      `Fastest lap · ${fastest.Driver.familyName} · ${fastest.FastestLap.Time?.time}`,
    `Season · ${season} · ${schedule.length} rounds · ${constructors.length} teams`,
    `${roundsDone} of ${schedule.length} rounds complete`,
  ].filter(Boolean) as string[];

  return (
    <div>
      <Ticker items={ticker} />

      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* Masthead */}
        <section className="relative overflow-hidden border-b border-rule-strong py-8 sm:py-10">
          {/* car driving across the background */}
          <div
            className="drive-across pointer-events-none absolute bottom-2 left-0 w-40 opacity-[0.07] sm:w-56"
            aria-hidden
          >
            <F1Car color="var(--ink)" spinning className="w-full" />
          </div>

          <div className="relative flex items-center justify-between">
            <p className="kicker">
              <Greeting /> Pit Wall
            </p>
            <p className="kicker hidden sm:block">
              {season} World Championship · Round {nextRound ?? schedule.length}
            </p>
          </div>
          <h1 className="relative mt-3 font-display text-5xl font-semibold leading-[0.95] tracking-tight sm:text-7xl">
            The <span className="italic text-accent">Pit Wall</span>.
          </h1>
          <p className="relative mt-3 max-w-2xl text-sm text-ink-soft sm:text-base">
            Your editorial briefing for the {season} Formula 1 season — live
            timing, championship standings, the full calendar, and a stats
            archive going back to 1950.
          </p>
        </section>
      </div>

      {/* The grid — car slideshow (full-bleed band) */}
      {teams.length > 0 && <CarShowcase teams={teams} />}

      <div className="mx-auto max-w-6xl px-4 sm:px-6">

        {/* Featured race + countdown */}
        {nextRace && (
          <section className="grid gap-6 border-b border-rule py-7 md:grid-cols-[1.4fr_1fr] md:items-center">
            <div>
              <div className="kicker mb-2">
                Next Grand Prix · Round {nextRace.round} ·{" "}
                {flag(nextRace.Circuit.Location.country)}{" "}
                {nextRace.Circuit.Location.country}
              </div>
              <h2 className="font-display text-3xl font-semibold leading-none tracking-tight sm:text-4xl">
                {nextRace.raceName.replace(/Grand Prix/i, "")}
                <span className="italic"> Grand Prix</span>
              </h2>
              <p className="mt-2 text-sm text-ink-soft">
                {nextRace.Circuit.circuitName} ·{" "}
                {nextRace.Circuit.Location.locality}
              </p>
              <Link
                href={`/race/${season}/${nextRace.round}`}
                className="mt-4 inline-flex items-center gap-1.5 border border-rule-strong px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.14em] hover:bg-ink hover:text-paper transition-colors"
              >
                Race weekend details →
              </Link>
            </div>
            <div className="flex flex-col items-start gap-2 md:items-end">
              <span className="kicker">Countdown to lights out</span>
              <Countdown target={raceStart(nextRace)} />
            </div>
          </section>
        )}

        {/* Season calendar */}
        <section className="py-7">
          <SectionHeading
            label="The Schedule"
            title="Season Calendar"
            href="/schedule"
          />
          <CalendarStrip
            races={schedule}
            nextRound={nextRound}
            season={season}
          />
        </section>

        {/* Standings + Paddock Intel */}
        <section className="grid gap-8 py-7 lg:grid-cols-[1fr_1fr_0.9fr]">
          <div>
            <SectionHeading
              label="The Title Race"
              title="Drivers"
              href="/standings"
            />
            <DriverStandingsTable standings={drivers} limit={10} />
          </div>
          <div>
            <SectionHeading
              label="The Cup"
              title="Constructors"
              href="/standings"
            />
            <ConstructorStandingsTable standings={constructors} />
          </div>
          <div>
            <SectionHeading label="From the Garage" title="Paddock Intel" />
            <PaddockIntel
              leader={leader}
              gap={gap}
              cLeader={cLeader}
              lastRace={lastRace}
              lastWinner={lastWinner}
              fastest={fastest}
            />
          </div>
        </section>
      </div>
    </div>
  );
}

function IntelItem({
  tag,
  color,
  children,
}: {
  tag: string;
  color?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border-b border-rule py-3">
      <span
        className="mb-1.5 inline-block px-1.5 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-[0.14em] text-paper"
        style={{ background: color ?? "var(--ink)" }}
      >
        {tag}
      </span>
      <p className="text-sm leading-snug text-ink">{children}</p>
    </div>
  );
}

function PaddockIntel({
  leader,
  gap,
  cLeader,
  lastRace,
  lastWinner,
  fastest,
}: {
  leader?: DriverStanding;
  gap: number;
  cLeader?: ConstructorStanding;
  lastRace: Race | null;
  lastWinner?: RaceResult;
  fastest?: RaceResult;
}) {
  return (
    <div>
      {leader && (
        <IntelItem
          tag="Standings"
          color={teamColor(leader.Constructors.at(-1)?.constructorId)}
        >
          <strong className="font-semibold">
            {leader.Driver.givenName} {leader.Driver.familyName}
          </strong>{" "}
          leads the championship on {leader.points} points with {leader.wins}{" "}
          {leader.wins === "1" ? "win" : "wins"}
          {gap > 0 ? `, ${gap} clear of second.` : "."}
        </IntelItem>
      )}
      {cLeader && (
        <IntelItem
          tag="Constructors"
          color={teamColor(cLeader.Constructor.constructorId)}
        >
          <strong className="font-semibold">
            {teamName(
              cLeader.Constructor.constructorId,
              cLeader.Constructor.name
            )}
          </strong>{" "}
          top the constructors&apos; standings on {cLeader.points} points.
        </IntelItem>
      )}
      {lastWinner && lastRace && (
        <IntelItem
          tag="Last Race"
          color={teamColor(lastWinner.Constructor.constructorId)}
        >
          <strong className="font-semibold">
            {lastWinner.Driver.givenName} {lastWinner.Driver.familyName}
          </strong>{" "}
          won the {lastRace.raceName} from P{lastWinner.grid} on the grid.
        </IntelItem>
      )}
      {fastest?.FastestLap && (
        <IntelItem
          tag="Fastest Lap"
          color={teamColor(fastest.Constructor.constructorId)}
        >
          <strong className="font-semibold">{fastest.Driver.familyName}</strong>{" "}
          set the fastest lap last time out: {fastest.FastestLap.Time?.time}
          {fastest.FastestLap.AverageSpeed
            ? ` (${fastest.FastestLap.AverageSpeed.speed} ${fastest.FastestLap.AverageSpeed.units})`
            : ""}
          .
        </IntelItem>
      )}
    </div>
  );
}
