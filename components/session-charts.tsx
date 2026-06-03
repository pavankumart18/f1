import {
  getSessionLaps,
  getSessionStints,
  getPositionByLap,
  type OpenF1Session,
  type TimingRow,
} from "@/lib/f1/openf1";
import { MultiLineChart } from "./charts";
import { PositionChart } from "./position-chart";
import { StintChart } from "./stint-chart";
import { SectionHeading } from "./section-heading";

function fmtLap(s: number) {
  const m = Math.floor(s / 60);
  return `${m}:${(s % 60).toFixed(3).padStart(6, "0")}`;
}

// Pace + position-by-lap + tyre strategy for one session. `order` provides
// finishing order, team colours and acronyms (from live timing).
export async function SessionCharts({
  session,
  order,
}: {
  session: OpenF1Session;
  order: TimingRow[];
}) {
  const isRace = session.session_name === "Race";
  const [laps, stints, posByLap] = await Promise.all([
    getSessionLaps(session.session_key),
    getSessionStints(session.session_key),
    isRace ? getPositionByLap(session.session_key) : Promise.resolve(null),
  ]);

  const maxLap = Math.max(
    1,
    ...[...laps.values()].flatMap((arr) => arr.map((l) => l.lap))
  );

  // Pace — top 5, pit/safety-car laps stripped, y zoomed to racing pace.
  const chosen = order.slice(0, 5);
  const allTimes = chosen.flatMap((r) =>
    (laps.get(r.number) ?? [])
      .filter((l) => l.time && !l.pitOut)
      .map((l) => l.time as number)
  );
  const fastest = allTimes.length ? Math.min(...allTimes) : 0;
  const cap = fastest * 1.18;
  const lapLabels = Array.from({ length: maxLap }, (_, i) => String(i + 1));
  const paceSeries = chosen.map((r) => {
    const byLap = new Map((laps.get(r.number) ?? []).map((l) => [l.lap, l]));
    return {
      name: r.acronym,
      color: r.colour,
      values: lapLabels.map((_, i) => {
        const l = byLap.get(i + 1);
        if (!l || !l.time || l.pitOut || l.time > cap) return null;
        return l.time;
      }),
    };
  });
  const hasPace = allTimes.length > 5;
  const hasStints = [...stints.values()].some((a) => a.length > 0);

  if (!hasPace && !hasStints && !posByLap) return null;

  return (
    <>
      {hasPace && (
        <div className="mt-10">
          <SectionHeading label="The Pace · Top 5" title="Lap Times" />
          <MultiLineChart
            labels={lapLabels}
            series={paceSeries}
            height={240}
            yMin={fastest * 0.995}
            yMax={cap}
          />
          <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.12em] text-ink-faint">
            Fastest lap shown: {fastest ? fmtLap(fastest) : "—"} · pit &
            safety-car laps hidden
          </p>
        </div>
      )}

      {posByLap && posByLap.drivers.length > 1 && (
        <div className="mt-10">
          <SectionHeading label="Race Progression" title="Position by Lap" />
          <PositionChart data={posByLap} />
          <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.12em] text-ink-faint">
            Every driver&apos;s track position, lap by lap · {posByLap.maxLap} laps
          </p>
        </div>
      )}

      {hasStints && (
        <div className="mt-10">
          <SectionHeading label="Tyre Strategy" title="Stints" />
          <StintChart order={order} stints={stints} maxLap={maxLap} />
        </div>
      )}
    </>
  );
}
