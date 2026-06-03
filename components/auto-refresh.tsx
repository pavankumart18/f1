"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export function AutoRefresh({ seconds = 8 }: { seconds?: number }) {
  const router = useRouter();
  const [on, setOn] = useState(true);

  useEffect(() => {
    if (!on) return;
    const id = setInterval(() => router.refresh(), seconds * 1000);
    return () => clearInterval(id);
  }, [on, seconds, router]);

  return (
    <button
      type="button"
      onClick={() => setOn((v) => !v)}
      className="inline-flex items-center gap-2 border border-rule px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-ink-soft hover:border-rule-strong hover:text-ink"
    >
      <span
        className={`size-1.5 rounded-full ${on ? "bg-accent live-dot" : "bg-ink-faint"}`}
      />
      {on ? `Auto-refresh ${seconds}s` : "Paused"}
    </button>
  );
}
