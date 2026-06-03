"use client";

import { Play } from "lucide-react";

export function IntroReplay() {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event("pitwall-play-intro"))}
      className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-faint hover:text-accent"
    >
      <Play className="size-3" /> Replay intro
    </button>
  );
}
