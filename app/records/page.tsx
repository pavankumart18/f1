import Link from "next/link";
import { computeRecords, topDrivers, topTeams } from "@/lib/f1/archive";
import { Leaderboard, driverRows, teamRows } from "@/components/leaderboard";
import { StatTile } from "@/components/stat-tile";

export const revalidate = 3600;
export const metadata = { title: "Record Books — The Pit Wall" };

export default async function RecordsPage() {
  const records = await computeRecords();

  if (!records) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <div className="kicker mb-1">The Record Books</div>
        <h1 className="mb-4 font-display text-4xl font-semibold tracking-tight">
          Archive not built yet
        </h1>
        <p className="text-sm text-ink-soft">
          Run the history dump to populate all-time records:
        </p>
        <pre className="mt-4 border border-rule-strong bg-paper-raised p-4 font-mono text-xs">
          node scripts/fetch-archive.mjs
        </pre>
        <Link href="/" className="mt-6 inline-block text-accent">
          ← Back to the dashboard
        </Link>
      </div>
    );
  }

  const dWins = topDrivers(records, "wins");
  const dTitles = topDrivers(records, "titles");
  const dPodiums = topDrivers(records, "podiums");
  const dPoles = topDrivers(records, "poles");
  const dPoints = topDrivers(records, "points");
  const dStarts = topDrivers(records, "races");
  const tWins = topTeams(records, "wins");
  const tTitles = topTeams(records, "titles");

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="kicker mb-1">
        {records.totals.seasons} Seasons · 1950–{records.seasons.at(-1)}
      </div>
      <h1 className="mb-2 font-display text-5xl font-semibold tracking-tight sm:text-6xl">
        The <span className="italic text-accent">Record Books</span>
      </h1>
      <p className="mb-6 max-w-2xl text-sm text-ink-soft">
        Every result in World Championship history, aggregated. The bigger
        picture — who won most, who started most, who stood on the most podiums.
      </p>

      <div className="mb-10 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <StatTile value={records.totals.seasons} label="Seasons" accent />
        <StatTile value={records.totals.races.toLocaleString()} label="Races" />
        <StatTile value={records.drivers.length.toLocaleString()} label="Drivers" />
        <StatTile value={records.teams.length.toLocaleString()} label="Teams" />
      </div>

      <div className="grid gap-x-10 gap-y-12 md:grid-cols-2">
        <Leaderboard
          label="Drivers · All-Time"
          title="Most Race Wins"
          unit="Grand Prix victories"
          rows={driverRows(dWins, dWins.map((d) => d.wins))}
        />
        <Leaderboard
          label="Drivers · All-Time"
          title="World Titles"
          unit="Drivers' championships"
          rows={driverRows(dTitles, dTitles.map((d) => d.titles))}
        />
        <Leaderboard
          label="Drivers · All-Time"
          title="Most Podiums"
          unit="Top-3 finishes"
          rows={driverRows(dPodiums, dPodiums.map((d) => d.podiums))}
        />
        <Leaderboard
          label="Drivers · All-Time"
          title="Most Pole Positions"
          unit="P1 on the grid (approx.)"
          rows={driverRows(dPoles, dPoles.map((d) => d.poles))}
        />
        <Leaderboard
          label="Drivers · All-Time"
          title="Most Career Points"
          unit="Points (across scoring eras)"
          rows={driverRows(dPoints, dPoints.map((d) => Math.round(d.points)))}
        />
        <Leaderboard
          label="Drivers · All-Time"
          title="Most Race Starts"
          unit="Grand Prix entries"
          rows={driverRows(dStarts, dStarts.map((d) => d.races))}
        />
        <Leaderboard
          label="Constructors · All-Time"
          title="Most Race Wins"
          unit="Grand Prix victories"
          rows={teamRows(tWins, tWins.map((t) => t.wins))}
        />
        <Leaderboard
          label="Constructors · All-Time"
          title="Constructors' Titles"
          unit="Constructors' championships"
          rows={teamRows(tTitles, tTitles.map((t) => t.titles))}
        />
      </div>

      <p className="mt-12 border-t border-rule pt-4 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">
        Aggregated from {records.totals.results.toLocaleString()} race results ·
        Source: Jolpica-F1 (Ergast)
      </p>
    </div>
  );
}
