import {
  getLatestSession,
  getLiveTiming,
  COMPOUND_COLOR,
} from "@/lib/f1/openf1";
import { AutoRefresh } from "@/components/auto-refresh";
import { SectionHeading } from "@/components/section-heading";

export const dynamic = "force-dynamic";
export const metadata = { title: "Live Timing — The Pit Wall" };

function isLive(s: { date_start: string; date_end: string }) {
  const now = Date.now();
  const start = new Date(s.date_start).getTime();
  const end = new Date(s.date_end).getTime();
  if (!Number.isFinite(start) || !Number.isFinite(end)) return false;
  return now >= start && now <= end;
}

export default async function LivePage() {
  const session = await getLatestSession();
  const rows = session ? await getLiveTiming(session) : [];
  const live = session ? isLive(session) : false;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <div className="mb-1 flex items-center justify-between">
        <div className="kicker">
          {live ? (
            <span className="text-accent">● Session Live</span>
          ) : (
            "Latest Session"
          )}
        </div>
        <AutoRefresh seconds={8} />
      </div>
      <h1 className="font-display text-4xl font-semibold tracking-tight sm:text-5xl">
        Live <span className="italic text-accent">Timing</span>
      </h1>
      {session && (
        <p className="mt-2 text-sm text-ink-soft">
          {session.session_name} · {session.circuit_short_name},{" "}
          {session.country_name} · {session.year}
          {!live && " — showing this session's classification"}
        </p>
      )}

      <div className="mt-6">
        <SectionHeading
          label="Powered by OpenF1"
          title={live ? "On Track Now" : "Final Order"}
        />
        {rows.length === 0 ? (
          <p className="py-10 text-center text-sm text-ink-soft">
            No timing data available right now. Live timing populates during a
            Grand Prix weekend session.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-rule-strong text-left">
                  <th className="kicker pb-2 pl-1 font-normal">Pos</th>
                  <th className="kicker pb-2 font-normal">Driver</th>
                  <th className="kicker pb-2 font-normal">Team</th>
                  <th className="kicker pb-2 text-center font-normal">Tyre</th>
                  <th className="kicker pb-2 text-right font-normal">Interval</th>
                  <th className="kicker pb-2 pr-1 text-right font-normal">Leader</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr
                    key={r.number}
                    className="border-b border-rule hover:bg-paper-raised"
                  >
                    <td className="py-2.5 pl-1">
                      <div className="flex items-center gap-2.5">
                        <span
                          className="h-5 w-1 shrink-0"
                          style={{ background: r.colour }}
                        />
                        <span className="font-mono text-sm font-semibold tabular-nums">
                          {r.position}
                        </span>
                      </div>
                    </td>
                    <td className="py-2.5 pr-3">
                      <span className="font-mono text-xs text-ink-faint">
                        {r.number}
                      </span>{" "}
                      <span className="font-display text-[15px] font-semibold">
                        {r.acronym}
                      </span>
                    </td>
                    <td className="py-2.5 pr-3 text-xs text-ink-soft">
                      {r.team}
                    </td>
                    <td className="py-2.5 text-center">
                      {r.compound ? (
                        <span
                          className="inline-flex size-5 items-center justify-center rounded-full text-[9px] font-bold text-ink"
                          style={{
                            border: `2px solid ${COMPOUND_COLOR[r.compound] ?? "#888"}`,
                          }}
                          title={r.compound}
                        >
                          {r.compound[0]}
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="py-2.5 text-right font-mono text-xs tabular-nums">
                      {r.interval}
                    </td>
                    <td className="py-2.5 pr-1 text-right font-mono text-xs tabular-nums text-ink-soft">
                      {r.gapToLeader}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
