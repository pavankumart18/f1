import Link from "next/link";
import type { DriverStanding, ConstructorStanding } from "@/lib/f1/types";
import { teamColor, teamName } from "@/lib/f1/teams";
import { flag } from "@/lib/f1/flags";

function PosBadge({ pos }: { pos: string }) {
  const n = Number(pos);
  const medal =
    n === 1 ? "text-accent" : n <= 3 ? "text-ink" : "text-ink-faint";
  return (
    <span className={`font-mono text-sm font-semibold tabular-nums ${medal}`}>
      {String(pos).padStart(2, "0")}
    </span>
  );
}

export function DriverStandingsTable({
  standings,
  limit,
  faces,
}: {
  standings: DriverStanding[];
  limit?: number;
  faces?: Record<string, string>;
}) {
  const rows = limit ? standings.slice(0, limit) : standings;
  return (
    <table className="w-full border-collapse">
      <thead>
        <tr className="border-b border-rule-strong text-left">
          <th className="kicker pb-2 pl-1 font-normal">Pos</th>
          <th className="kicker pb-2 font-normal">Driver</th>
          <th className="kicker pb-2 font-normal">Team</th>
          <th className="kicker pb-2 text-right font-normal">Pts</th>
          <th className="kicker hidden pb-2 pr-1 text-right font-normal sm:table-cell">
            Wins
          </th>
        </tr>
      </thead>
      <tbody>
        {rows.map((s) => {
          const c = s.Constructors[s.Constructors.length - 1];
          const face = s.Driver.code ? faces?.[s.Driver.code] : undefined;
          return (
            <tr
              key={s.Driver.driverId}
              data-driver={s.Driver.driverId}
              className="group border-b border-rule transition-colors hover:bg-paper-raised"
            >
              <td className="py-2.5 pl-1">
                <div className="flex items-center gap-2.5">
                  <span
                    className="h-5 w-1 shrink-0"
                    style={{ background: teamColor(c?.constructorId) }}
                  />
                  <PosBadge pos={s.position} />
                </div>
              </td>
              <td className="py-2.5 pr-3">
                <Link
                  href={`/driver/${s.Driver.driverId}`}
                  className="flex items-center gap-2 group-hover:text-accent"
                >
                  {face ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={face}
                      alt=""
                      className="size-7 shrink-0 rounded-full object-cover object-top"
                      style={{ background: `${teamColor(c?.constructorId)}22` }}
                    />
                  ) : (
                    <span className="text-sm">{flag(s.Driver.nationality)}</span>
                  )}
                  <span className="font-display text-[15px] font-medium leading-tight">
                    {s.Driver.givenName}{" "}
                    <span className="font-semibold">{s.Driver.familyName}</span>
                  </span>
                </Link>
              </td>
              <td className="py-2.5 pr-3 text-xs text-ink-soft">
                {c ? teamName(c.constructorId, c.name) : "—"}
              </td>
              <td className="py-2.5 text-right">
                <span className="font-mono text-sm font-semibold tabular-nums">
                  {s.points}
                </span>
              </td>
              <td className="hidden py-2.5 pr-1 text-right sm:table-cell">
                <span className="font-mono text-sm tabular-nums text-ink-soft">
                  {s.wins}
                </span>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

export function ConstructorStandingsTable({
  standings,
  limit,
}: {
  standings: ConstructorStanding[];
  limit?: number;
}) {
  const rows = limit ? standings.slice(0, limit) : standings;
  const leader = Number(rows[0]?.points) || 1;
  return (
    <table className="w-full border-collapse">
      <thead>
        <tr className="border-b border-rule-strong text-left">
          <th className="kicker pb-2 pl-1 font-normal">Pos</th>
          <th className="kicker pb-2 font-normal">Constructor</th>
          <th className="kicker pb-2 text-right font-normal">Pts</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((s) => {
          const color = teamColor(s.Constructor.constructorId);
          const pct = (Number(s.points) / leader) * 100;
          return (
            <tr
              key={s.Constructor.constructorId}
              className="group border-b border-rule transition-colors hover:bg-paper-raised"
            >
              <td className="py-2.5 pl-1">
                <div className="flex items-center gap-2.5">
                  <span
                    className="h-5 w-1 shrink-0"
                    style={{ background: color }}
                  />
                  <PosBadge pos={s.position} />
                </div>
              </td>
              <td className="py-2.5 pr-3">
                <Link
                  href={`/constructor/${s.Constructor.constructorId}`}
                  className="block group-hover:text-accent"
                >
                  <span className="font-display text-[15px] font-semibold leading-tight">
                    {teamName(
                      s.Constructor.constructorId,
                      s.Constructor.name
                    )}
                  </span>
                  <span className="mt-1 block h-[3px] w-full max-w-[180px] bg-rule">
                    <span
                      className="block h-full"
                      style={{ width: `${pct}%`, background: color }}
                    />
                  </span>
                </Link>
              </td>
              <td className="py-2.5 text-right align-top">
                <span className="font-mono text-sm font-semibold tabular-nums">
                  {s.points}
                </span>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
