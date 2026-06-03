import type { PosByLap } from "@/lib/f1/openf1";

// The iconic "spaghetti" race chart: position (P1 at top) vs lap.
export function PositionChart({ data }: { data: PosByLap }) {
  const { maxLap, maxPos, drivers } = data;
  const W = 1000;
  const H = 460;
  const padT = 16;
  const padB = 24;
  const padL = 30;
  const padR = 54; // room for end labels
  const x = (lap: number) =>
    padL + ((lap - 1) / Math.max(1, maxLap - 1)) * (W - padL - padR);
  const y = (pos: number) =>
    padT + ((pos - 1) / Math.max(1, maxPos - 1)) * (H - padT - padB);

  const gridPos = [1, 5, 10, 15, 20].filter((p) => p <= maxPos);

  const path = (positions: (number | null)[]) => {
    let d = "";
    let pen = false;
    positions.forEach((p, i) => {
      if (p == null) { pen = false; return; }
      d += `${pen ? "L" : "M"}${x(i + 1).toFixed(1)} ${y(p).toFixed(1)} `;
      pen = true;
    });
    return d.trim();
  };

  const endPoint = (positions: (number | null)[]) => {
    for (let i = positions.length - 1; i >= 0; i--) {
      if (positions[i] != null) return { lap: i + 1, pos: positions[i] as number };
    }
    return null;
  };

  return (
    <div className="overflow-x-auto">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full min-w-[640px]" role="img" aria-label="Position by lap">
        {/* position gridlines */}
        {gridPos.map((p) => (
          <g key={p}>
            <line
              x1={padL}
              x2={W - padR}
              y1={y(p)}
              y2={y(p)}
              stroke="var(--rule)"
              strokeWidth={1}
              vectorEffect="non-scaling-stroke"
            />
            <text x={padL - 6} y={y(p) + 3} textAnchor="end" className="fill-ink-faint" style={{ fontSize: 11, fontFamily: "var(--font-mono)" }}>
              P{p}
            </text>
          </g>
        ))}
        {/* driver lines */}
        {drivers.map((d) => (
          <path
            key={d.number}
            d={path(d.positions)}
            fill="none"
            stroke={d.colour}
            strokeWidth={2}
            strokeLinejoin="round"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
            opacity={0.92}
          />
        ))}
        {/* end labels */}
        {drivers.map((d) => {
          const e = endPoint(d.positions);
          if (!e) return null;
          return (
            <text
              key={`l-${d.number}`}
              x={x(e.lap) + 5}
              y={y(e.pos) + 3}
              style={{ fontSize: 11, fontWeight: 700, fontFamily: "var(--font-mono)" }}
              fill={d.colour}
            >
              {d.acronym}
            </text>
          );
        })}
      </svg>
    </div>
  );
}
