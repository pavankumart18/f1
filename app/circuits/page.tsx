import Link from "next/link";
import { listCircuits } from "@/lib/f1/archive";
import { flag } from "@/lib/f1/flags";

export const revalidate = 86400;
export const metadata = { title: "Circuits — The Pit Wall" };

export default async function CircuitsPage() {
  const circuits = await listCircuits();

  if (!circuits.length) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <h1 className="font-display text-3xl font-semibold">
          Archive not built yet
        </h1>
        <pre className="mt-4 border border-rule-strong bg-paper-raised p-4 font-mono text-xs">
          node scripts/fetch-archive.mjs
        </pre>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="kicker mb-1">{circuits.length} Venues · 1950–2026</div>
      <h1 className="mb-2 font-display text-5xl font-semibold tracking-tight sm:text-6xl">
        The <span className="italic text-accent">Circuits</span>
      </h1>
      <p className="mb-8 max-w-2xl text-sm text-ink-soft">
        Every track to host a World Championship Grand Prix — ranked by races
        held, with each circuit&apos;s most successful driver.
      </p>

      <div className="grid gap-2 sm:grid-cols-2">
        {circuits.map((c) => {
          const king = c.topDrivers[0];
          return (
            <Link
              key={c.id}
              href={`/circuit/${c.id}`}
              className="group flex items-center justify-between gap-3 border border-rule px-4 py-3 transition-colors hover:border-rule-strong hover:bg-paper-raised"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span>{flag(c.country)}</span>
                  <span className="truncate font-display text-base font-semibold group-hover:text-accent">
                    {c.name}
                  </span>
                </div>
                <div className="mt-0.5 truncate font-mono text-[10px] uppercase tracking-[0.1em] text-ink-soft">
                  {c.locality}, {c.country} · {c.firstYear}–{c.lastYear}
                  {king ? ` · 👑 ${king.name.split(" ").at(-1)} (${king.wins})` : ""}
                </div>
              </div>
              <div className="shrink-0 text-right">
                <div className="font-mono text-lg font-semibold tabular-nums">
                  {c.grands_prix}
                </div>
                <div className="kicker">GPs</div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
