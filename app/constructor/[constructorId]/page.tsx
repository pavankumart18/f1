import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getConstructor,
  getConstructorStandings,
  getDriverStandings,
} from "@/lib/f1/api";
import { flag } from "@/lib/f1/flags";
import { teamColor, teamName } from "@/lib/f1/teams";
import { StatTile } from "@/components/stat-tile";
import { SectionHeading } from "@/components/section-heading";
import { DriverStandingsTable } from "@/components/standings";

export const revalidate = 86400;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ constructorId: string }>;
}) {
  const { constructorId } = await params;
  const c = await getConstructor(constructorId);
  return {
    title: c ? `${c.name} — The Pit Wall` : "Constructor — The Pit Wall",
  };
}

export default async function ConstructorPage({
  params,
}: {
  params: Promise<{ constructorId: string }>;
}) {
  const { constructorId } = await params;
  const [team, cStandings, dStandings] = await Promise.all([
    getConstructor(constructorId),
    getConstructorStandings("current").catch(() => []),
    getDriverStandings("current").catch(() => []),
  ]);

  if (!team) notFound();

  const standing = cStandings.find(
    (s) => s.Constructor.constructorId === constructorId
  );
  const lineup = dStandings.filter((d) =>
    d.Constructors.some((c) => c.constructorId === constructorId)
  );
  const accent = teamColor(constructorId);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <Link href="/standings" className="kicker hover:text-accent">
        ← Standings
      </Link>

      <div className="mt-3 flex items-start gap-4 border-b border-rule-strong pb-6">
        <span className="mt-1 h-16 w-2 shrink-0" style={{ background: accent }} />
        <div>
          <div className="kicker mb-1">
            {flag(team.nationality)} {team.nationality} · Constructor
          </div>
          <h1 className="font-display text-4xl font-semibold leading-[0.95] tracking-tight sm:text-6xl">
            {teamName(constructorId, team.name)}
          </h1>
        </div>
      </div>

      {standing && (
        <div className="mt-6 grid grid-cols-3 gap-2">
          <StatTile value={`P${standing.position}`} label="Championship" accent />
          <StatTile value={standing.points} label="Points" />
          <StatTile value={standing.wins} label="Wins" />
        </div>
      )}

      {lineup.length > 0 && (
        <div className="mt-10">
          <SectionHeading label="The Garage" title="Current Line-up" />
          <DriverStandingsTable standings={lineup} />
        </div>
      )}

      <a
        href={team.url}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-8 inline-block font-mono text-[11px] uppercase tracking-[0.14em] text-ink-soft hover:text-accent"
      >
        Wikipedia →
      </a>
    </div>
  );
}
