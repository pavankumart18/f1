"use client";

import { useEffect } from "react";
import { Disc3, Play } from "lucide-react";
import { useMusic } from "./music-provider";
import { youtubeSearchUrl, type Song } from "@/lib/f1/songs";

export function DriverTrack({
  song,
  driver,
  accent,
}: {
  song: Song;
  driver: string;
  accent: string;
}) {
  const { enabled, toggle, setTrack } = useMusic();

  // Make this driver's track the active one while their page is open — but only
  // if it's actually playable. Otherwise leave the F1 theme playing.
  useEffect(() => {
    if (!song.youtubeId) return;
    setTrack(song);
    return () => setTrack(null);
  }, [song, setTrack]);

  return (
    <div className="mt-3 inline-flex items-center gap-2 border border-rule px-2.5 py-1.5">
      <Disc3
        className="size-4 shrink-0"
        style={{ color: accent }}
        aria-hidden
      />
      <div className="leading-tight">
        <div className="font-mono text-[9px] uppercase tracking-[0.16em] text-ink-faint">
          {driver.split(" ")[0]}&apos;s walk-out
        </div>
        <div className="font-display text-sm font-medium">
          {song.title}{" "}
          <span className="text-ink-soft">· {song.artist}</span>
        </div>
      </div>
      <button
        type="button"
        onClick={() => {
          if (song.youtubeId) setTrack(song);
          if (!enabled) toggle();
        }}
        className="ml-1 inline-flex items-center gap-1 bg-ink px-2 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-paper hover:bg-accent"
      >
        <Play className="size-3" /> Play
      </button>
      {!song.youtubeId && (
        <a
          href={youtubeSearchUrl(song)}
          target="_blank"
          rel="noopener noreferrer"
          className="font-mono text-[10px] uppercase tracking-[0.12em] text-ink-soft hover:text-accent"
        >
          ↗
        </a>
      )}
    </div>
  );
}
