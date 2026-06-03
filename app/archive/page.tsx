import Link from "next/link";
import { getSeasons } from "@/lib/f1/api";

export const revalidate = 86400;
export const metadata = { title: "Archive — The Pit Wall" };

export default async function ArchivePage() {
  const seasons = await getSeasons().catch(() => []);

  // group by decade, newest first
  const byDecade = new Map<number, string[]>();
  for (const s of seasons) {
    const dec = Math.floor(Number(s) / 10) * 10;
    if (!byDecade.has(dec)) byDecade.set(dec, []);
    byDecade.get(dec)!.push(s);
  }
  const decades = [...byDecade.entries()].sort((a, b) => b[0] - a[0]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <div className="kicker mb-1">
        {seasons.length} Seasons · 1950–{seasons[0]}
      </div>
      <h1 className="mb-8 font-display text-4xl font-semibold tracking-tight sm:text-5xl">
        The <span className="italic text-accent">Archive</span>
      </h1>
      <p className="-mt-4 mb-10 max-w-2xl text-sm text-ink-soft">
        Every Formula 1 World Championship season since 1950. Pick a year to see
        the final standings, the champions, and every race result.
      </p>

      <div className="space-y-8">
        {decades.map(([dec, years]) => (
          <div key={dec}>
            <h2 className="kicker mb-3 border-b border-rule pb-1">
              {dec}s
            </h2>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-5 md:grid-cols-8">
              {years.map((y) => (
                <Link
                  key={y}
                  href={`/archive/${y}`}
                  className="border border-rule px-2 py-3 text-center font-mono text-sm tabular-nums transition-colors hover:border-accent hover:bg-paper-raised hover:text-accent"
                >
                  {y}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
