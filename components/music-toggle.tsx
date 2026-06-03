"use client";

import { Volume2, VolumeX } from "lucide-react";
import { useMusic } from "./music-provider";

export function MusicToggle() {
  const { enabled, toggle } = useMusic();
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={enabled ? "Turn music off" : "Turn music on"}
      aria-pressed={enabled}
      className={`inline-flex items-center gap-2 border px-2.5 py-1 text-[11px] uppercase tracking-[0.16em] transition-colors ${
        enabled
          ? "border-accent text-accent"
          : "border-rule text-ink-soft hover:border-rule-strong hover:text-ink"
      }`}
    >
      {enabled ? (
        <Volume2 className="size-3.5" />
      ) : (
        <VolumeX className="size-3.5" />
      )}
      <span className="hidden font-mono sm:inline">
        {enabled ? "Music" : "Muted"}
      </span>
    </button>
  );
}
