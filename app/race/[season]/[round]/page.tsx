import Link from "next/link";
import { getRaceResults, getSeasonSchedule } from "@/lib/f1/api";
import { getCircuitTrack } from "@/lib/f1/circuits";
import { getRaceSession, getLiveTiming } from "@/lib/f1/openf1";
import { teamColor, teamName } from "@/lib/f1/teams";
import { flag } from "@/lib/f1/flags";
import { SectionHeading } from "@/components/section-heading";
import { Countdown } from "@/components/countdown";
import { TrackMap } from "@/components/track-map";
import { SessionCharts } from "@/components/session-charts";

export const revalidate = 3600;

function fmtSession(label: string, s?: { date: string; time?: string }) {
  if (!s) return null;
  const d = new Date(`${s.date}T${s.time ?? "00:00:00Z"}`);
  return {
    label,
    when: d.toLocaleString("en-GB", {
      weekday: "short",
      day: "2-digit",
      month: "short",
      hour: s.time ? "2-digit" : undefined,
      minute: s.time ? "2-digit" : undefined,
      timeZone: "UTC",
    }),
  };
}

export default async function RacePage({
  params,
}: {
  params: Promise<{ season: string; round: string }>;
}) {
  const { season, round } = await params;
  const [race, schedule] = await Promise.all([
    getRaceResults(season, round),
    getSeasonSchedule(season).catch(() => []),
  ]);
  const meta = race ?? schedule.find((r) => r.round === round) ?? null;

  if (!meta) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6">
        <h1 className="font-display text-3xl font-semibold">Race not found</h1>
        <Link href="/schedule" className="mt-4 inline-block text-accent">
          ← Back to schedule
        </Link>
      </div>
    );
  }

  const results = race?.Results ?? [];
  const track = await getCircuitTrack(
    meta.Circuit.Location.lat,
    meta.Circuit.Location.long
  );

  // OpenF1 telemetry (pace / position / stints) for races from 2023 on.
  const ofs =
    results.length > 0
      ? await getRaceSession(
          meta.season,
          meta.Circuit.Location.locality,
          meta.Circuit.Location.country
        )
      : null;
  const ofsOrder = ofs ? await getLiveTiming(ofs) : [];
  const sessions = [
    fmtSession("Practice 1", meta.FirstPractice),
    fmtSession("Practice 2", meta.SecondPractice),
    fmtSession("Practice 3", meta.ThirdPractice),
    fmtSession("Sprint", meta.Sprint),
    fmtSession("Qualifying", meta.Qualifying),
    fmtSession("Race", { date: meta.date, time: meta.time }),
  ].filter(Boolean) as { label: string; when: string }[];

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <Link
        href="/schedule"
        className="kicker hover:text-accent"
      >
        ← Schedule
      </Link>
      <div className="mt-3 flex flex-wrap items-end justify-between gap-4 border-b border-rule-strong pb-5">
        <div>
          <div className="kicker mb-1">
            {meta.season} · Round {meta.round} ·{" "}
            {flag(meta.Circuit.Location.country)} {meta.Circuit.Location.country}
          </div>
          <h1 className="font-display text-4xl font-semibold tracking-tight sm:text-5xl">
            {meta.raceName}
          </h1>
          <p className="mt-2 text-sm text-ink-soft">
            <Link
              href={`/circuit/${meta.Circuit.circuitId}`}
              className="underline decoration-rule underline-offset-2 hover:text-accent hover:decoration-accent"
            >
              {meta.Circuit.circuitName}
            </Link>{" "}
            · {meta.Circuit.Location.locality}
          </p>
        </div>
        <div className="flex items-center gap-5">
          {track && (
            <div className="shrink-0">
              <span className="kicker mb-1 block">Circuit</span>
              <TrackMap coords={track} className="h-28 w-28 sm:h-32 sm:w-32" />
            </div>
          )}
          {results.length === 0 && meta.time && (
            <div className="flex flex-col items-start gap-1.5">
              <span className="kicker">Countdown to lights out</span>
              <Countdown target={`${meta.date}T${meta.time}`} />
            </div>
          )}
        </div>
      </div>

      {results.length > 0 ? (
        <div className="mt-6">
          <SectionHeading label="Classification" title="Race Result" />
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-rule-strong text-left">
                  <th className="kicker pb-2 pl-1 font-normal">Pos</th>
                  <th className="kicker pb-2 font-normal">Driver</th>
                  <th className="kicker pb-2 font-normal">Team</th>
                  <th className="kicker pb-2 text-center font-normal">Grid</th>
                  <th className="kicker pb-2 text-right font-normal">
                    Time / Status
                  </th>
                  <th className="kicker pb-2 pr-1 text-right font-normal">Pts</th>
                </tr>
              </thead>
              <tbody>
                {results.map((r) => {
                  const purple = r.FastestLap?.rank === "1";
                  return (
                    <tr
                      key={r.Driver.driverId}
                      className="border-b border-rule hover:bg-paper-raised"
                    >
                      <td className="py-2.5 pl-1">
                        <div className="flex items-center gap-2.5">
                          <span
                            className="h-5 w-1 shrink-0"
                            style={{
                              background: teamColor(r.Constructor.constructorId),
                            }}
                          />
                          <span className="font-mono text-sm font-semibold tabular-nums">
                            {r.positionText}
                          </span>
                        </div>
                      </td>
                      <td className="py-2.5 pr-3">
                        <Link
                          href={`/driver/${r.Driver.driverId}`}
                          className="flex items-center gap-2 hover:text-accent"
                        >
                          <span>{flag(r.Driver.nationality)}</span>
                          <span className="font-display text-[15px] font-medium">
                            {r.Driver.givenName}{" "}
                            <span className="font-semibold">
                              {r.Driver.familyName}
                            </span>
                          </span>
                          {purple && (
                            <span
                              className="ml-1 size-1.5 rounded-full"
                              style={{ background: "#a855f7" }}
                              title="Fastest lap"
                            />
                          )}
                        </Link>
                      </td>
                      <td className="py-2.5 pr-3 text-xs text-ink-soft">
                        {teamName(
                          r.Constructor.constructorId,
                          r.Constructor.name
                        )}
                      </td>
                      <td className="py-2.5 text-center font-mono text-sm tabular-nums text-ink-soft">
                        {r.grid}
                      </td>
                      <td className="py-2.5 text-right font-mono text-xs tabular-nums">
                        {r.Time?.time ?? r.status}
                      </td>
                      <td className="py-2.5 pr-1 text-right font-mono text-sm font-semibold tabular-nums">
                        {r.points !== "0" ? r.points : "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="mt-6">
          <SectionHeading label="Timetable" title="Race Weekend" />
          <div className="border-t border-rule-strong">
            {sessions.map((s) => (
              <div
                key={s.label}
                className="flex items-center justify-between border-b border-rule py-3"
              >
                <span className="font-display text-base font-medium">
                  {s.label}
                </span>
                <span className="font-mono text-sm tabular-nums text-ink-soft">
                  {s.when} UTC
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {ofs && ofsOrder.length > 0 && (
        <SessionCharts session={ofs} order={ofsOrder} />
      )}
    </div>
  );
}
