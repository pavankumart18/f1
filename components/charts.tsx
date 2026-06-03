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
              className="w-40 shrink-0 truncate font-display text-sm font-medium hover:text-accent"
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
