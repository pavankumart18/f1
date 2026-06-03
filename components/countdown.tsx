"use client";

import { useEffect, useState } from "react";

function diff(target: number) {
  const now = Date.now();
  const ms = Math.max(0, target - now);
  return {
    done: ms <= 0,
    days: Math.floor(ms / 86_400_000),
    hours: Math.floor((ms / 3_600_000) % 24),
    mins: Math.floor((ms / 60_000) % 60),
    secs: Math.floor((ms / 1000) % 60),
  };
}

// A single rolling reel showing digits 0–9, translated to the active digit.
function Reel({ digit }: { digit: number }) {
  return (
    <span
      className="relative inline-block overflow-hidden align-top"
      style={{ height: "1em", width: "0.62em" }}
    >
      <span
        className="absolute left-0 top-0 flex flex-col"
        style={{
          transform: `translateY(-${digit * 10}%)`,
          transition: "transform 0.6s cubic-bezier(0.22, 1, 0.36, 1)",
        }}
      >
        {Array.from({ length: 10 }, (_, n) => (
          <span key={n} className="block text-center" style={{ height: "1em" }}>
            {n}
          </span>
        ))}
      </span>
    </span>
  );
}

function Odometer({ value }: { value: number }) {
  const tens = Math.floor(value / 10) % 10;
  const units = value % 10;
  return (
    <span className="font-mono text-2xl font-semibold leading-none tabular-nums sm:text-3xl">
      <Reel digit={tens} />
      <Reel digit={units} />
    </span>
  );
}

export function Countdown({ target }: { target: string }) {
  const targetMs = new Date(target).getTime();
  // Start at 0 on both server and first client render to avoid a hydration
  // mismatch (Date.now() differs between the two). Fill in after mount.
  const [t, setT] = useState({ done: false, days: 0, hours: 0, mins: 0, secs: 0 });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setT(diff(targetMs));
    const id = setInterval(() => setT(diff(targetMs)), 1000);
    return () => clearInterval(id);
  }, [targetMs]);

  const cells = [
    { v: t.days, l: "Days" },
    { v: t.hours, l: "Hrs" },
    { v: t.mins, l: "Min" },
    { v: t.secs, l: "Sec" },
  ];

  if (mounted && t.done) {
    return (
      <span className="font-mono text-sm uppercase tracking-[0.2em] text-accent live-dot">
        ● Lights Out
      </span>
    );
  }

  return (
    <div className="flex items-stretch gap-1.5" suppressHydrationWarning>
      {cells.map((c, i) => (
        <div key={c.l} className="flex items-stretch gap-1.5">
          <div className="flex min-w-[3.25rem] flex-col items-center justify-center bg-ink px-2 py-1.5 text-paper">
            <Odometer value={c.v} />
            <span className="mt-1 font-mono text-[9px] uppercase tracking-[0.18em] text-paper/60">
              {c.l}
            </span>
          </div>
          {i < cells.length - 1 && (
            <span className="self-center font-mono text-xl text-ink-faint">:</span>
          )}
        </div>
      ))}
    </div>
  );
}
