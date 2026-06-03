import Link from "next/link";
import {
  getDriverStandings,
  getConstructorStandings,
  getSeasonSchedule,
} from "@/lib/f1/api";
import {
  DriverStandingsTable,
  ConstructorStandingsTable,
} from "@/components/standings";
import { SectionHeading } from "@/components/section-heading";
import { teamColor, teamName } from "@/lib/f1/teams";
import { flag } from "@/lib/f1/flags";

export const revalidate = 86400;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ year: string }>;
}) {
  const { year } = await params;
  return { title: `${year} Season — The Pit Wall` };
}

export default async function SeasonPage({
  params,
}: {
  params: Promise<{ year: string }>;
}) {
  const { year } = await params;
  const [drivers, constructors, schedule] = await Promise.all([
    getDriverStandings(year).catch(() => []),
    getConstructorStandings(year).catch(() => []),
    getSeasonSchedule(year).catch(() => []),
  ]);

  const champDriver = drivers[0];
  const champTeam = constructors[0];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <Link href="/archive" className="kicker hover:text-accent">
        ← Archive
      </Link>
      <h1 className="mt-3 font-display text-5xl font-semibold tracking-tight sm:text-6xl">
        {year} <span className="italic text-accent">Season</span>
      </h1>

      {/* Champions */}
      <div className="mt-6 grid gap-4 border-y border-rule-strong py-5 sm:grid-cols-2">
        {champDriver && (
          <div className="flex items-center gap-4">
            <span
              className="h-12 w-1.5"
              style={{
                background: teamColor(
                  champDriver.Constructors.at(-1)?.constructorId
                ),
              }}
            />
            <div>
              <div className="kicker">World Champion</div>
              <Link
                href={`/driver/${champDriver.Driver.driverId}`}
                className="font-display text-2xl font-semibold hover:text-accent"
              >
                {flag(champDriver.Driver.nationality)}{" "}
                {champDriver.Driver.givenName} {champDriver.Driver.familyName}
              </Link>
              <div className="font-mono text-xs text-ink-soft">
                {champDriver.points} pts · {champDriver.wins} wins
              </div>
            </div>
          </div>
        )}
        {champTeam && (
          <div className="flex items-center gap-4">
            <span
              className="h-12 w-1.5"
              style={{ background: teamColor(champTeam.Constructor.constructorId) }}
            />
            <div>
              <div className="kicker">Constructors&apos; Champion</div>
              <Link
                href={`/constructor/${champTeam.Constructor.constructorId}`}
                className="font-display text-2xl font-semibold hover:text-accent"
              >
                {teamName(
                  champTeam.Constructor.constructorId,
                  champTeam.Constructor.name
                )}
              </Link>
              <div className="font-mono text-xs text-ink-soft">
                {champTeam.points} pts · {champTeam.wins} wins
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Standings */}
      <div className="mt-8 grid gap-10 lg:grid-cols-2">
        <div>
          <SectionHeading label="Final Standings" title="Drivers" />
          {drivers.length ? (
            <DriverStandingsTable standings={drivers} />
          ) : (
            <p className="text-sm text-ink-soft">No data for this season.</p>
          )}
        </div>
        <div>
          <SectionHeading label="Final Standings" title="Constructors" />
          {constructors.length ? (
            <ConstructorStandingsTable standings={constructors} />
          ) : (
            <p className="text-sm text-ink-soft">
              Constructors&apos; title began in 1958.
            </p>
          )}
        </div>
      </div>

      {/* Calendar */}
      {schedule.length > 0 && (
        <div className="mt-10">
          <SectionHeading label="The Season" title={`${schedule.length} Races`} />
          <div className="grid gap-2 sm:grid-cols-2">
            {schedule.map((race) => (
              <Link
                key={race.round}
                href={`/race/${year}/${race.round}`}
                className="flex items-center justify-between border border-rule px-3 py-2 transition-colors hover:border-rule-strong hover:bg-paper-raised"
              >
                <span className="flex items-center gap-2">
                  <span className="font-mono text-[11px] text-ink-faint">
                    R{race.round}
                  </span>
                  <span className="text-sm">
                    {flag(race.Circuit.Location.country)}
                  </span>
                  <span className="font-display text-sm font-medium">
                    {race.raceName}
                  </span>
                </span>
                <span className="font-mono text-[11px] text-ink-soft">
                  {race.date.slice(5)}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
