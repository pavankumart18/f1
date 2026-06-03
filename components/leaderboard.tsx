import Link from "next/link";
import { flag } from "@/lib/f1/flags";
import { teamColor, teamName } from "@/lib/f1/teams";

type Row = {
  id: string;
  name: string;
  nationality?: string;
  value: number;
  href: string;
  color?: string;
  sub?: string;
};

export function Leaderboard({
  label,
  title,
  unit,
  rows,
}: {
  label: string;
  title: string;
  unit: string;
  rows: Row[];
}) {
  const max = Math.max(...rows.map((r) => r.value), 1);
  return (
    <div>
      <div className="mb-3 border-b border-rule-strong pb-2">
        <div className="kicker mb-1">{label}</div>
        <h3 className="font-display text-xl font-semibold leading-none">
          {title}
        </h3>
      </div>
      <ol className="space-y-0">
        {rows.map((r, i) => (
          <li
            key={r.id}
            className="group flex items-center gap-3 border-b border-rule py-2"
          >
            <span className="w-5 shrink-0 font-mono text-xs tabular-nums text-ink-faint">
              {i + 1}
            </span>
            <span
              className="h-5 w-1 shrink-0"
              style={{ background: r.color ?? "var(--ink)" }}
            />
            <Link
              href={r.href}
              className="min-w-0 flex-1 truncate font-display text-[15px] font-medium group-hover:text-accent"
            >
              {r.nationality ? `${flag(r.nationality)} ` : ""}
              {r.name}
              {r.sub ? (
                <span className="ml-1 font-sans text-[11px] text-ink-faint">
                  {r.sub}
                </span>
              ) : null}
            </Link>
            <span className="relative hidden h-2 w-20 bg-rule sm:block">
              <span
                className="absolute inset-y-0 left-0"
                style={{
                  width: `${(r.value / max) * 100}%`,
                  background: r.color ?? "var(--ink)",
                }}
              />
            </span>
            <span className="w-14 shrink-0 text-right font-mono text-sm font-semibold tabular-nums">
              {r.value.toLocaleString()}
            </span>
          </li>
        ))}
      </ol>
      <div className="mt-1 text-right">
        <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">
          {unit}
        </span>
      </div>
    </div>
  );
}

export function driverRows(
  list: { id: string; name: string; nationality: string; lastTeam?: string }[],
  values: number[]
): Row[] {
  return list.map((d, i) => ({
    id: d.id,
    name: d.name,
    nationality: d.nationality,
    value: values[i],
    href: `/driver/${d.id}`,
    color: teamColor(d.lastTeam),
  }));
}

export function teamRows(
  list: { id: string; name: string }[],
  values: number[]
): Row[] {
  return list.map((t, i) => ({
    id: t.id,
    name: teamName(t.id, t.name),
    value: values[i],
    href: `/constructor/${t.id}`,
    color: teamColor(t.id),
  }));
}
