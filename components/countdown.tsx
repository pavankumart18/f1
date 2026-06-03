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

const pad = (n: number) => String(n).padStart(2, "0");

export function Countdown({ target }: { target: string }) {
  const targetMs = new Date(target).getTime();
  const [t, setT] = useState(() => diff(targetMs));
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const id = setInterval(() => setT(diff(targetMs)), 1000);
    return () => clearInterval(id);
  }, [targetMs]);

  const cells = [
    { v: t.days, l: "Days" },
    { v: t.hours, l: "Hrs" },
    { v: t.mins, l: "Min" },
    { v: t.secs, l: "Sec" },
  ];

  if (t.done) {
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
            <span className="font-mono text-2xl font-semibold tabular-nums leading-none sm:text-3xl">
              {mounted ? pad(c.v) : "--"}
            </span>
            <span className="mt-1 font-mono text-[9px] uppercase tracking-[0.18em] text-paper/60">
              {c.l}
            </span>
          </div>
          {i < cells.length - 1 && (
            <span className="self-center font-mono text-xl text-ink-faint">
              :
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
