import Link from "next/link";
import {
  getDriverStandings,
  getDriver,
  getDriverCareer,
} from "@/lib/f1/api";
import { getDriverProgression } from "@/lib/f1/archive";
import { flag } from "@/lib/f1/flags";
import { CompareForm } from "@/components/compare-form";
import { MultiLineChart } from "@/components/charts";
import { SectionHeading } from "@/components/section-heading";

export const revalidate = 86400;
export const metadata = { title: "Head-to-Head — The Pit Wall" };

const METRICS: { key: "championships" | "wins" | "podiums" | "poles" | "starts"; label: string }[] = [
  { key: "championships", label: "Titles" },
  { key: "wins", label: "Wins" },
  { key: "podiums", label: "Podiums" },
  { key: "poles", label: "Poles" },
  { key: "starts", label: "Starts" },
];

export default async function ComparePage({
  searchParams,
}: {
  searchParams: Promise<{ a?: string; b?: string }>;
}) {
  const { a, b } = await searchParams;
  const grid = await getDriverStandings("current").catch(() => []);
  const options = grid.map((s) => ({
    id: s.Driver.driverId,
    name: `${s.Driver.givenName} ${s.Driver.familyName}`,
  }));

  const [da, db, ca, cb, pa, pb] = await Promise.all([
    a ? getDriver(a) : null,
    b ? getDriver(b) : null,
    a ? getDriverCareer(a) : null,
    b ? getDriverCareer(b) : null,
    a ? getDriverProgression(a) : [],
    b ? getDriverProgression(b) : [],
  ]);

  // Season-by-season rivalry: union of years, points per driver, H2H tally.
  const yearSet = new Set<string>([
    ...pa.map((p) => p.year),
    ...pb.map((p) => p.year),
  ]);
  const years = [...yearSet].sort();
  const mapA = new Map(pa.map((p) => [p.year, p]));
  const mapB = new Map(pb.map((p) => [p.year, p]));
  let aAhead = 0;
  let bAhead = 0;
  for (const y of years) {
    const ra = mapA.get(y);
    const rb = mapB.get(y);
    if (ra?.position && rb?.position) {
      if (ra.position < rb.position) aAhead++;
      else if (rb.position < ra.position) bAhead++;
    }
  }
  const sharedSeasons = aAhead + bAhead;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <div className="kicker mb-1">The Duel</div>
      <h1 className="mb-2 font-display text-4xl font-semibold tracking-tight sm:text-5xl">
        Head-to-<span className="italic text-accent">Head</span>
      </h1>
      <p className="mb-8 max-w-2xl text-sm text-ink-soft">
        Pick two drivers from the current grid and compare their careers. (More
        of the 1950+ field is in the <Link href="/archive" className="text-accent">Archive</Link>.)
      </p>

      <CompareForm drivers={options} initialA={a} initialB={b} />

      {da && db && ca && cb && (
        <div className="mt-10">
          <div className="grid grid-cols-2 gap-4 border-b border-rule-strong pb-4">
            {[da, db].map((d) => (
              <div key={d.driverId} className="text-center">
                <div className="text-2xl">{flag(d.nationality)}</div>
                <Link
                  href={`/driver/${d.driverId}`}
                  className="font-display text-2xl font-semibold hover:text-accent"
                >
                  {d.givenName} {d.familyName}
                </Link>
              </div>
            ))}
          </div>

          <div className="mt-2">
            {METRICS.map((m) => {
              const va = ca[m.key];
              const vb = cb[m.key];
              const max = Math.max(va, vb, 1);
              const aWins = va > vb;
              const bWins = vb > va;
              return (
                <div
                  key={m.key}
                  className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 border-b border-rule py-3"
                >
                  <div className="flex items-center justify-end gap-2">
                    <span
                      className={`font-mono text-lg font-semibold tabular-nums ${aWins ? "text-accent" : "text-ink-soft"}`}
                    >
                      {va}
                    </span>
                    <span className="h-2 bg-ink/15" style={{ width: `${(va / max) * 80}px` }} />
                  </div>
                  <span className="kicker w-16 text-center">{m.label}</span>
                  <div className="flex items-center gap-2">
                    <span className="h-2 bg-ink/15" style={{ width: `${(vb / max) * 80}px` }} />
                    <span
                      className={`font-mono text-lg font-semibold tabular-nums ${bWins ? "text-accent" : "text-ink-soft"}`}
                    >
                      {vb}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Rivalry — season by season */}
          {years.length > 1 && (
            <div className="mt-10">
              <SectionHeading
                label="Rivalry · Season by Season"
                title="Points by Season"
              />
              <MultiLineChart
                labels={years}
                series={[
                  {
                    name: da.familyName,
                    color: "#e10600",
                    values: years.map((y) => mapA.get(y)?.points ?? 0),
                  },
                  {
                    name: db.familyName,
                    color: "#1868DB",
                    values: years.map((y) => mapB.get(y)?.points ?? 0),
                  },
                ]}
              />

              {sharedSeasons > 0 && (
                <div className="mt-6 flex items-center justify-center gap-4 border border-rule-strong py-4">
                  <span className="font-display text-2xl font-semibold">
                    {da.familyName}
                  </span>
                  <span className="font-mono text-3xl font-bold tabular-nums">
                    <span className={aAhead >= bAhead ? "text-accent" : ""}>
                      {aAhead}
                    </span>
                    <span className="mx-2 text-ink-faint">–</span>
                    <span style={{ color: bAhead > aAhead ? "#1868DB" : undefined }}>
                      {bAhead}
                    </span>
                  </span>
                  <span className="font-display text-2xl font-semibold">
                    {db.familyName}
                  </span>
                </div>
              )}
              <p className="mt-2 text-center font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">
                Seasons finished ahead in the championship · {sharedSeasons}{" "}
                shared {sharedSeasons === 1 ? "season" : "seasons"}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
