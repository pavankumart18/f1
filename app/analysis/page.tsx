import Link from "next/link";
import { computeAnalysis } from "@/lib/f1/analysis";
import { LineChart, VBars, HBars } from "@/components/charts";
import { SectionHeading } from "@/components/section-heading";
import { teamColor } from "@/lib/f1/teams";

export const revalidate = 3600;
export const metadata = { title: "Analysis — The Pit Wall" };

export default async function AnalysisPage() {
  const a = await computeAnalysis();

  if (!a) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <div className="kicker mb-1">The Numbers</div>
        <h1 className="mb-4 font-display text-4xl font-semibold tracking-tight">
          Archive not built yet
        </h1>
        <p className="text-sm text-ink-soft">
          Run the history dump first, then this page fills with charts:
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

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="kicker mb-1">The Bigger Picture</div>
      <h1 className="mb-2 font-display text-5xl font-semibold tracking-tight sm:text-6xl">
        The <span className="italic text-accent">Numbers</span>
      </h1>
      <p className="mb-10 max-w-2xl text-sm text-ink-soft">
        Trends across {a.racesPerSeason.length} seasons of World Championship
        racing — how the calendar grew, who dominated, and who finished.
      </p>

      <div className="grid gap-x-10 gap-y-12 lg:grid-cols-2">
        <section className="lg:col-span-2">
          <SectionHeading
            label="Calendar Growth"
            title="Grands Prix per Season"
          />
          <LineChart data={a.racesPerSeason.map((r) => ({ label: r.year, value: r.count }))} />
        </section>

        <section>
          <SectionHeading label="Era by Era" title="Races per Decade" />
          <VBars data={a.winsByDecade.map((d) => ({ label: d.decade, value: d.count }))} />
        </section>

        <section>
          <SectionHeading
            label="Total Dominance"
            title="Most Dominant Seasons"
          />
          <HBars
            suffix="%"
            rows={a.dominantSeasons.map((d) => ({
              label: d.driver,
              sub: `${d.year} · ${d.wins}/${d.races}`,
              value: d.pct,
              color: teamColor(d.team),
              href: `/driver/${d.driverId}`,
            }))}
          />
          <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.12em] text-ink-faint">
            Share of races won in a single season
          </p>
        </section>

        <section className="lg:col-span-2">
          <SectionHeading
            label="Reliability"
            title="Highest Finish Rate (80+ starts)"
          />
          <HBars
            suffix="%"
            rows={a.reliability.map((d) => ({
              label: d.driver,
              sub: `${d.races} starts`,
              value: d.finishRate,
              color: teamColor(d.team),
              href: `/driver/${d.driverId}`,
            }))}
          />
          <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.12em] text-ink-faint">
            Share of race starts classified as a finish
          </p>
        </section>
      </div>

      <p className="mt-12 border-t border-rule pt-4 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">
        Computed live from the local archive · Source: Jolpica-F1 (Ergast)
      </p>
    </div>
  );
}
