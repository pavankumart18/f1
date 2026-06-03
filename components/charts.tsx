import Link from "next/link";

/* A simple responsive line chart (pure SVG, server-rendered). */
export function LineChart({
  data,
  height = 160,
}: {
  data: { label: string; value: number }[];
  height?: number;
}) {
  if (data.length < 2) return null;
  const W = 1000;
  const H = height;
  const pad = 8;
  const max = Math.max(...data.map((d) => d.value));
  const min = Math.min(...data.map((d) => d.value), 0);
  const x = (i: number) => (i / (data.length - 1)) * (W - pad * 2) + pad;
  const y = (v: number) =>
    H - pad - ((v - min) / (max - min || 1)) * (H - pad * 2);

  const line = data.map((d, i) => `${x(i)},${y(d.value)}`).join(" ");
  const area = `${x(0)},${H - pad} ${line} ${x(data.length - 1)},${H - pad}`;

  const ticks = data.filter(
    (_, i) => i % Math.ceil(data.length / 8) === 0 || i === data.length - 1
  );

  return (
    <div>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        preserveAspectRatio="none"
        role="img"
      >
        <polygon points={area} fill="var(--accent)" opacity={0.08} />
        <polyline
          points={line}
          fill="none"
          stroke="var(--accent)"
          strokeWidth={3}
          vectorEffect="non-scaling-stroke"
        />
        {data.map((d, i) => (
          <circle
            key={i}
            cx={x(i)}
            cy={y(d.value)}
            r={2.5}
            fill="var(--paper)"
            stroke="var(--accent)"
            strokeWidth={2}
            vectorEffect="non-scaling-stroke"
          />
        ))}
      </svg>
      <div className="mt-1 flex justify-between font-mono text-[10px] tabular-nums text-ink-faint">
        {ticks.map((t) => (
          <span key={t.label}>{t.label}</span>
        ))}
      </div>
    </div>
  );
}

/* Multiple lines on a shared x-axis (e.g. two drivers' points by season). */
export function MultiLineChart({
  labels,
  series,
  height = 200,
  yMin,
  yMax,
}: {
  labels: string[];
  series: { name: string; color: string; values: (number | null)[] }[];
  height?: number;
  yMin?: number;
  yMax?: number;
}) {
  if (labels.length < 2) return null;
  const W = 1000;
  const H = height;
  const pad = 8;
  const all = series.flatMap((s) => s.values.filter((v): v is number => v != null));
  const lo = yMin ?? Math.min(...all, 0);
  const hi = yMax ?? Math.max(...all, 1);
  const x = (i: number) => (i / (labels.length - 1)) * (W - pad * 2) + pad;
  const y = (v: number) =>
    H - pad - ((v - lo) / (hi - lo || 1)) * (H - pad * 2);
  const ticks = labels.filter(
    (_, i) => i % Math.ceil(labels.length / 8) === 0 || i === labels.length - 1
  );

  // build a path that lifts the pen over null gaps
  const toPath = (vals: (number | null)[]) => {
    let d = "";
    let pen = false;
    vals.forEach((v, i) => {
      if (v == null) { pen = false; return; }
      const cmd = pen ? "L" : "M";
      d += `${cmd}${x(i).toFixed(1)} ${y(v).toFixed(1)} `;
      pen = true;
    });
    return d.trim();
  };

  return (
    <div>
      <div className="mb-2 flex flex-wrap gap-4">
        {series.map((s) => (
          <span key={s.name} className="flex items-center gap-1.5">
            <span className="h-2 w-4" style={{ background: s.color }} />
            <span className="font-mono text-[11px] uppercase tracking-[0.1em]">
              {s.name}
            </span>
          </span>
        ))}
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" preserveAspectRatio="none" role="img">
        {series.map((s) => (
          <path
            key={s.name}
            d={toPath(s.values)}
            fill="none"
            stroke={s.color}
            strokeWidth={2.5}
            strokeLinejoin="round"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
        ))}
      </svg>
      <div className="mt-1 flex justify-between font-mono text-[10px] tabular-nums text-ink-faint">
        {ticks.map((t) => (
          <span key={t}>{t}</span>
        ))}
      </div>
    </div>
  );
}

/* Vertical bars (e.g. by decade). */
export function VBars({
  data,
}: {
  data: { label: string; value: number }[];
}) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="flex items-end justify-between gap-2" style={{ height: 180 }}>
      {data.map((d) => (
        <div
          key={d.label}
          className="flex flex-1 flex-col items-center justify-end gap-2"
        >
          <span className="font-mono text-[11px] tabular-nums text-ink-soft">
            {d.value}
          </span>
          <div
            className="w-full bg-accent/85"
            style={{ height: `${(d.value / max) * 130}px` }}
          />
          <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-ink-faint">
            {d.label}
          </span>
        </div>
      ))}
    </div>
  );
}

/* Horizontal ranked bars with optional links. */
export function HBars({
  rows,
  suffix = "",
}: {
  rows: {
    label: string;
    sub?: string;
    value: number;
    color?: string;
    href?: string;
  }[];
  suffix?: string;
}) {
  const max = Math.max(...rows.map((r) => r.value), 1);
  return (
    <ol>
      {rows.map((r, i) => {
        const Label = r.href ? Link : "span";
        return (
          <li
            key={`${r.label}-${i}`}
            className="flex items-center gap-3 border-b border-rule py-2"
          >
            <span className="w-5 shrink-0 font-mono text-xs tabular-nums text-ink-faint">
              {i + 1}
            </span>
            <Label
              href={r.href ?? "#"}
              className="w-24 shrink-0 truncate font-display text-sm font-medium hover:text-accent sm:w-44"
            >
              {r.label}
              {r.sub ? (
                <span className="ml-1 font-sans text-[11px] text-ink-faint">
                  {r.sub}
                </span>
              ) : null}
            </Label>
            <span className="relative h-2.5 flex-1 bg-rule">
              <span
                className="absolute inset-y-0 left-0"
                style={{
                  width: `${(r.value / max) * 100}%`,
                  background: r.color ?? "var(--accent)",
                }}
              />
            </span>
            <span className="w-12 shrink-0 text-right font-mono text-sm font-semibold tabular-nums">
              {r.value}
              {suffix}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
