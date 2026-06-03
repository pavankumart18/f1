import Link from "next/link";
import {
  getDriverStandings,
  getDriver,
  getDriverCareer,
} from "@/lib/f1/api";
import { flag } from "@/lib/f1/flags";
import { CompareForm } from "@/components/compare-form";

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

  const [da, db, ca, cb] = await Promise.all([
    a ? getDriver(a) : null,
    b ? getDriver(b) : null,
    a ? getDriverCareer(a) : null,
    b ? getDriverCareer(b) : null,
  ]);

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
        </div>
      )}
    </div>
  );
}
