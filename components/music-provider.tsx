"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { Music, X, ExternalLink } from "lucide-react";
import {
  DEFAULT_TRACK,
  youtubeSearchUrl,
  type Song,
} from "@/lib/f1/songs";

type Ctx = {
  enabled: boolean;
  toggle: () => void;
  track: Song;
  setTrack: (s: Song | null) => void;
};

const MusicCtx = createContext<Ctx | null>(null);

export function useMusic() {
  const ctx = useContext(MusicCtx);
  if (!ctx) throw new Error("useMusic must be used within MusicProvider");
  return ctx;
}

const KEY = "pitwall-music";

export function MusicProvider({ children }: { children: React.ReactNode }) {
  const [enabled, setEnabled] = useState(false);
  const [track, setTrackState] = useState<Song>(DEFAULT_TRACK);

  useEffect(() => {
    setEnabled(localStorage.getItem(KEY) === "on");
  }, []);

  const toggle = useCallback(() => {
    setEnabled((prev) => {
      const next = !prev;
      localStorage.setItem(KEY, next ? "on" : "off");
      return next;
    });
  }, []);

  const setTrack = useCallback((s: Song | null) => {
    setTrackState(s ?? DEFAULT_TRACK);
  }, []);

  return (
    <MusicCtx.Provider value={{ enabled, toggle, track, setTrack }}>
      {children}
      {enabled && <NowPlaying track={track} onClose={toggle} />}
    </MusicCtx.Provider>
  );
}

function NowPlaying({ track, onClose }: { track: Song; onClose: () => void }) {
  return (
    <>
      {/* Hidden audio source — plays only when a real YouTube id is provided.
          key forces a fresh iframe on every track change so the new song
          actually loads + autoplays (patching src alone doesn't reliably switch). */}
      {track.youtubeId && (
        <iframe
          key={track.youtubeId}
          title="music"
          aria-hidden
          className="pointer-events-none fixed -left-[9999px] h-px w-px"
          allow="autoplay; encrypted-media"
          src={`https://www.youtube.com/embed/${track.youtubeId}?autoplay=1&loop=1&playlist=${track.youtubeId}&controls=0`}
        />
      )}

      <div className="fixed bottom-3 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 border border-rule-strong bg-ink px-3 py-2 text-paper shadow-lg animate-rise">
        <Music className="size-4 shrink-0 text-accent" />
        <div className="min-w-0">
          <div className="truncate font-display text-sm font-semibold leading-tight">
            {track.title}
          </div>
          <div className="truncate font-mono text-[10px] uppercase tracking-[0.12em] text-paper/60">
            {track.artist}
            {!track.youtubeId && " · preview unavailable"}
          </div>
        </div>
        <a
          href={youtubeSearchUrl(track)}
          target="_blank"
          rel="noopener noreferrer"
          className="ml-1 inline-flex items-center gap-1 border border-paper/30 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.12em] hover:border-accent hover:text-accent"
        >
          YouTube <ExternalLink className="size-3" />
        </a>
        <button
          type="button"
          onClick={onClose}
          aria-label="Stop music"
          className="text-paper/60 hover:text-accent"
        >
          <X className="size-4" />
        </button>
      </div>
    </>
  );
}
