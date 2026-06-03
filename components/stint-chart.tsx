import { COMPOUND_COLOR, type StintSeg } from "@/lib/f1/openf1";

export function StintChart({
  order,
  stints,
  maxLap,
}: {
  order: { number: number; acronym: string; colour: string }[];
  stints: Map<number, StintSeg[]>;
  maxLap: number;
}) {
  const axis = [1, ...[0.25, 0.5, 0.75].map((f) => Math.round(maxLap * f)), maxLap];
  return (
    <div>
      <div className="space-y-1">
        {order.map((d) => {
          const segs = stints.get(d.number) ?? [];
          return (
            <div key={d.number} className="flex items-center gap-2">
              <span className="w-9 shrink-0 font-mono text-[11px] font-semibold">
                {d.acronym}
              </span>
              <div className="relative h-5 flex-1 bg-rule/30">
                {segs.map((s, i) => {
                  const left = ((s.start - 1) / maxLap) * 100;
                  const width = ((s.end - s.start + 1) / maxLap) * 100;
                  const col = COMPOUND_COLOR[s.compound] ?? "#888";
                  return (
                    <span
                      key={i}
                      className="absolute top-0 flex h-full items-center justify-center overflow-hidden text-[8px] font-bold text-black"
                      style={{ left: `${left}%`, width: `${width}%`, background: col }}
                      title={`${s.compound} · laps ${s.start}-${s.end}`}
                    >
                      {width > 4 ? s.compound[0] : ""}
                    </span>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
      {/* lap axis */}
      <div className="mt-1 flex justify-between pl-11 font-mono text-[10px] tabular-nums text-ink-faint">
        {axis.map((l, i) => (
          <span key={i}>L{l}</span>
        ))}
      </div>
      {/* compound legend */}
      <div className="mt-3 flex flex-wrap gap-3">
        {Object.entries(COMPOUND_COLOR).map(([name, col]) => (
          <span key={name} className="flex items-center gap-1.5">
            <span className="size-3 rounded-sm" style={{ background: col }} />
            <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-ink-soft">
              {name}
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}
