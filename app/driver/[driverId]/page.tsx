import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import {
  getDriver,
  getDriverCareer,
  getDriverSeasonResults,
} from "@/lib/f1/api";
import { getDriverProgression } from "@/lib/f1/archive";
import { getWikiImage } from "@/lib/f1/wiki";
import { flag } from "@/lib/f1/flags";
import { teamColor, teamName } from "@/lib/f1/teams";
import { StatTile } from "@/components/stat-tile";
import { SectionHeading } from "@/components/section-heading";
import { DriverTrack } from "@/components/driver-track";
import { LineChart, VBars } from "@/components/charts";
import { DRIVER_SONGS } from "@/lib/f1/songs";

export const revalidate = 86400;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ driverId: string }>;
}) {
  const { driverId } = await params;
  const d = await getDriver(driverId);
  return {
    title: d
      ? `${d.givenName} ${d.familyName} — The Pit Wall`
      : "Driver — The Pit Wall",
  };
}

function age(dob: string) {
  const diff = Date.now() - new Date(dob).getTime();
  return Math.floor(diff / 31_557_600_000);
}

export default async function DriverPage({
  params,
}: {
  params: Promise<{ driverId: string }>;
}) {
  const { driverId } = await params;
  const [driver, career, season, progression] = await Promise.all([
    getDriver(driverId),
    getDriverCareer(driverId),
    getDriverSeasonResults(driverId, "current"),
    getDriverProgression(driverId),
  ]);

  if (!driver) notFound();

  const photo = await getWikiImage(driver.url);
  const song = DRIVER_SONGS[driverId];

  const currentTeam =
    season.at(-1)?.Results?.[0]?.Constructor ?? null;
  const accent = teamColor(currentTeam?.constructorId);

  return (
    <div
      className="mx-auto max-w-5xl px-4 py-8 sm:px-6"
      style={{ "--accent": accent } as React.CSSProperties}
    >
      <Link href="/standings" className="kicker hover:text-accent">
        ← Standings
      </Link>

      <div className="mt-3 flex items-stretch gap-4 border-b border-rule-strong pb-6 sm:gap-6">
        {photo ? (
          <div
            className="relative h-28 w-24 shrink-0 overflow-hidden border-l-4 sm:h-40 sm:w-36"
            style={{ borderColor: accent }}
          >
            <Image
              src={photo}
              alt={`${driver.givenName} ${driver.familyName}`}
              fill
              sizes="144px"
              className="object-cover object-top"
            />
          </div>
        ) : (
          <span
            className="mt-1 h-16 w-2 shrink-0"
            style={{ background: accent }}
          />
        )}
        <div className="self-end">
          <div className="kicker mb-1">
            {flag(driver.nationality)} {driver.nationality}
            {driver.permanentNumber ? ` · No. ${driver.permanentNumber}` : ""}
          </div>
          <h1 className="font-display text-4xl font-semibold leading-[0.95] tracking-tight sm:text-6xl">
            {driver.givenName}{" "}
            <span className="italic">{driver.familyName}</span>
          </h1>
          <p className="mt-2 font-mono text-xs uppercase tracking-[0.1em] text-ink-soft">
            Age {age(driver.dateOfBirth)} · Born{" "}
            {new Date(driver.dateOfBirth).toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "short",
              year: "numeric",
              timeZone: "UTC",
            })}
            {currentTeam
              ? ` · ${teamName(currentTeam.constructorId, currentTeam.name)}`
              : ""}
          </p>
          {song && (
            <DriverTrack
              song={song}
              driver={`${driver.givenName} ${driver.familyName}`}
              accent={accent}
            />
          )}
        </div>
      </div>

      {/* Career stats */}
      {career && (
        <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-5">
          <StatTile value={career.championships} label="Titles" accent />
          <StatTile value={career.wins} label="Wins" />
          <StatTile value={career.podiums} label="Podiums" />
          <StatTile value={career.poles} label="Poles" />
          <StatTile value={career.starts} label="Starts" />
        </div>
      )}

      {/* Career trajectory */}
      {progression.length > 1 && (
        <div className="mt-10">
          <SectionHeading
            label="Career Trajectory"
            title={`Points by Season · ${progression[0].year}–${progression.at(-1)!.year}`}
          />
          <LineChart
            data={progression.map((p) => ({ label: p.year, value: p.points }))}
            height={180}
          />
          {progression.some((p) => p.wins > 0) && (
            <div className="mt-8">
              <SectionHeading label="Race Wins" title="Wins by Season" />
              <VBars
                data={progression
                  .filter((p) => p.wins > 0)
                  .map((p) => ({ label: p.year, value: p.wins }))}
              />
            </div>
          )}
        </div>
      )}

      {/* Current season */}
      {season.length > 0 && (
        <div className="mt-10">
          <SectionHeading
            label="This Season"
            title={`${season[0].season} Results`}
          />
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-rule-strong text-left">
                  <th className="kicker pb-2 pl-1 font-normal">Rd</th>
                  <th className="kicker pb-2 font-normal">Grand Prix</th>
                  <th className="kicker pb-2 text-center font-normal">Grid</th>
                  <th className="kicker pb-2 text-center font-normal">Finish</th>
                  <th className="kicker pb-2 pr-1 text-right font-normal">Pts</th>
                </tr>
              </thead>
              <tbody>
                {season.map((race) => {
                  const r = race.Results?.[0];
                  return (
                    <tr
                      key={race.round}
                      className="border-b border-rule hover:bg-paper-raised"
                    >
                      <td className="py-2.5 pl-1 font-mono text-sm tabular-nums text-ink-faint">
                        {race.round}
                      </td>
                      <td className="py-2.5">
                        <Link
                          href={`/race/${race.season}/${race.round}`}
                          className="font-display text-[15px] font-medium hover:text-accent"
                        >
                          {flag(race.Circuit.Location.country)} {race.raceName}
                        </Link>
                      </td>
                      <td className="py-2.5 text-center font-mono text-sm tabular-nums text-ink-soft">
                        {r?.grid ?? "—"}
                      </td>
                      <td className="py-2.5 text-center font-mono text-sm font-semibold tabular-nums">
                        {r?.positionText ?? "—"}
                      </td>
                      <td className="py-2.5 pr-1 text-right font-mono text-sm tabular-nums">
                        {r?.points ?? "0"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <a
        href={driver.url}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-8 inline-block font-mono text-[11px] uppercase tracking-[0.14em] text-ink-soft hover:text-accent"
      >
        Wikipedia →
      </a>
    </div>
  );
}
