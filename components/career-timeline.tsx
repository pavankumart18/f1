import type { DossierSeason } from "@/lib/f1/archive";
import { teamColor, teamName } from "@/lib/f1/teams";

export function CareerTimeline({ seasons }: { seasons: DossierSeason[] }) {
  return (
    <div className="thin-scroll flex gap-2 overflow-x-auto pb-3">
      {seasons.map((s, i) => {
        const champ = s.position === 1;
        const color = teamColor(s.team);
        return (
          <div
            key={s.year}
            className="animate-rise relative flex min-w-[7rem] shrink-0 flex-col border p-3"
            style={{
              animationDelay: `${Math.min(i * 45, 700)}ms`,
              borderColor: champ ? "var(--accent)" : "var(--rule)",
            }}
          >
            <span
              className="absolute left-0 top-0 h-full w-1"
              style={{ background: color }}
            />
            <div className="flex items-center justify-between pl-1.5">
              <span className="font-mono text-sm font-semibold tabular-nums">
                {s.year}
              </span>
              {champ && (
                <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-accent">
                  ★ WDC
                </span>
              )}
            </div>
            <div className="mt-2 pl-1.5">
              <div className="font-display text-base font-semibold leading-none">
                {s.position ? `P${s.position}` : "—"}
              </div>
              <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.08em] text-ink-soft">
                {s.team ? teamName(s.team, s.teamLabel ?? s.team) : ""}
              </div>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-1 pl-1.5">
              {s.wins > 0 && (
                <span
                  className="px-1 py-0.5 font-mono text-[9px] font-semibold text-accent-ink"
                  style={{ background: "var(--accent)" }}
                >
                  {s.wins}W
                </span>
              )}
              {s.podiums > 0 && (
                <span className="border border-rule px-1 py-0.5 font-mono text-[9px] text-ink-soft">
                  {s.podiums}P
                </span>
              )}
              {s.dnf > 0 && (
                <span className="font-mono text-[9px] text-ink-faint">
                  {s.dnf} DNF
                </span>
              )}
            </div>
            <div className="mt-2 pl-1.5 font-mono text-[10px] tabular-nums text-ink-faint">
              {s.points} pts
            </div>
          </div>
        );
      })}
    </div>
  );
}
