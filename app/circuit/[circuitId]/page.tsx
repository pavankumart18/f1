import Link from "next/link";
import { notFound } from "next/navigation";
import { getCircuitStat } from "@/lib/f1/archive";
import { getCircuitTrack } from "@/lib/f1/circuits";
import { flag } from "@/lib/f1/flags";
import { teamColor, teamName } from "@/lib/f1/teams";
import { TrackMap } from "@/components/track-map";
import { StatTile } from "@/components/stat-tile";
import { SectionHeading } from "@/components/section-heading";
import { HBars } from "@/components/charts";

export const revalidate = 86400;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ circuitId: string }>;
}) {
  const { circuitId } = await params;
  const c = await getCircuitStat(circuitId);
  return { title: c ? `${c.name} — The Pit Wall` : "Circuit — The Pit Wall" };
}

export default async function CircuitPage({
  params,
}: {
  params: Promise<{ circuitId: string }>;
}) {
  const { circuitId } = await params;
  const c = await getCircuitStat(circuitId);
  if (!c) notFound();

  const track = await getCircuitTrack(c.lat, c.long);
  const king = c.topDrivers[0];
  const kingTeam = c.topConstructors[0];
  const livery = teamColor(kingTeam?.id);

  return (
    <div
      className="mx-auto max-w-5xl px-4 py-8 sm:px-6"
      style={{ "--accent": livery } as React.CSSProperties}
    >
      <Link href="/circuits" className="kicker hover:text-accent">
        ← Circuits
      </Link>

      <div className="mt-3 grid gap-6 border-b border-rule-strong pb-6 sm:grid-cols-[1fr_auto] sm:items-center">
        <div>
          <div className="kicker mb-1">
            {flag(c.country)} {c.locality}, {c.country}
          </div>
          <h1 className="font-display text-4xl font-semibold leading-[0.95] tracking-tight sm:text-6xl">
            {c.name}
          </h1>
        </div>
        {track && (
          <TrackMap coords={track} className="h-32 w-32 justify-self-start sm:h-40 sm:w-40" />
        )}
      </div>

      <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <StatTile value={c.grands_prix} label="Grands Prix" accent />
        <StatTile value={`${c.firstYear}`} label="First GP" />
        <StatTile value={`${c.lastYear}`} label="Latest GP" />
        <StatTile
          value={Number(c.lastYear) - Number(c.firstYear) + 1}
          label="Years Span"
        />
      </div>

      {/* Who dominated */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {king && (
          <div className="flex items-center gap-4 border border-rule p-4">
            <span
              className="h-12 w-1.5"
              style={{ background: teamColor(king.team) }}
            />
            <div>
              <div className="kicker">King of the Circuit</div>
              <Link
                href={`/driver/${king.id}`}
                className="font-display text-2xl font-semibold hover:text-accent"
              >
                {flag(king.nationality)} {king.name}
              </Link>
              <div className="font-mono text-xs text-ink-soft">
                {king.wins} wins here
              </div>
            </div>
          </div>
        )}
        {kingTeam && (
          <div className="flex items-center gap-4 border border-rule p-4">
            <span
              className="h-12 w-1.5"
              style={{ background: teamColor(kingTeam.id) }}
            />
            <div>
              <div className="kicker">Top Constructor</div>
              <Link
                href={`/constructor/${kingTeam.id}`}
                className="font-display text-2xl font-semibold hover:text-accent"
              >
                {teamName(kingTeam.id, kingTeam.name)}
              </Link>
              <div className="font-mono text-xs text-ink-soft">
                {kingTeam.wins} wins here
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Leaderboards */}
      <div className="mt-10 grid gap-x-10 gap-y-8 sm:grid-cols-2">
        <div>
          <SectionHeading label="Most Wins Here" title="Drivers" />
          <HBars
            rows={c.topDrivers.map((d) => ({
              label: d.name,
              value: d.wins,
              color: teamColor(d.team),
              href: `/driver/${d.id}`,
            }))}
          />
        </div>
        <div>
          <SectionHeading label="Most Wins Here" title="Constructors" />
          <HBars
            rows={c.topConstructors.map((t) => ({
              label: teamName(t.id, t.name),
              value: t.wins,
              color: teamColor(t.id),
              href: `/constructor/${t.id}`,
            }))}
          />
        </div>
      </div>

      {/* Roll of honour */}
      <div className="mt-10">
        <SectionHeading label="Every Winner" title="Roll of Honour" />
        <div className="grid gap-1.5 sm:grid-cols-2">
          {c.rollOfHonour.map((w) => (
            <Link
              key={`${w.year}-${w.round}`}
              href={`/race/${w.year}/${w.round}`}
              className="flex items-center justify-between border-b border-rule py-1.5 hover:text-accent"
            >
              <span className="flex items-center gap-2">
                <span className="font-mono text-xs tabular-nums text-ink-faint">
                  {w.year}
                </span>
                <span
                  className="h-3.5 w-1"
                  style={{ background: teamColor(w.team) }}
                />
                <span className="font-display text-sm font-medium">
                  {w.driver}
                </span>
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
