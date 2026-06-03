"use client";

import { useEffect, useState } from "react";
import { Play, FastForward } from "lucide-react";
import { F1Car } from "./f1-car";
import type { GridDriver } from "@/lib/f1/openf1";

type Phase = "idle" | "gate" | "lights" | "race" | "parade" | "title" | "done";

const SEEN = "pitwall-intro-seen";

export function CinematicIntro({
  drivers,
  songId,
}: {
  drivers: GridDriver[];
  songId: string;
}) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [lit, setLit] = useState(0);
  const [pi, setPi] = useState(0);

  // Decide whether to show on first load; allow replay via event.
  useEffect(() => {
    if (!localStorage.getItem(SEEN)) setPhase("gate");
    else setPhase("done");
    const replay = () => {
      setLit(0);
      setPi(0);
      setPhase("gate");
    };
    window.addEventListener("pitwall-play-intro", replay);
    return () => window.removeEventListener("pitwall-play-intro", replay);
  }, []);

  // Timeline state machine.
  useEffect(() => {
    if (phase === "lights") {
      const t: ReturnType<typeof setTimeout>[] = [];
      for (let i = 1; i <= 5; i++) t.push(setTimeout(() => setLit(i), i * 240));
      t.push(setTimeout(() => { setLit(0); setPhase("race"); }, 1550));
      return () => t.forEach(clearTimeout);
    }
    if (phase === "race") {
      const id = setTimeout(
        () => { setPi(0); setPhase(drivers.length ? "parade" : "title"); },
        2500
      );
      return () => clearTimeout(id);
    }
    if (phase === "parade") {
      const id = setInterval(() => {
        setPi((p) => {
          if (p + 1 >= drivers.length) {
            clearInterval(id);
            setTimeout(() => setPhase("title"), 360);
            return p;
          }
          return p + 1;
        });
      }, 340);
      return () => clearInterval(id);
    }
    if (phase === "title") {
      const id = setTimeout(finish, 2400);
      return () => clearTimeout(id);
    }
  }, [phase, drivers.length]);

  function finish() {
    try { localStorage.setItem(SEEN, "1"); } catch {}
    setPhase("done");
  }

  if (phase === "idle" || phase === "done") return null;

  const active = phase !== "gate";
  const driver = drivers[pi];
  const raceColors = drivers.slice(0, 6).map((d) => d.colour);
  while (raceColors.length < 6) raceColors.push("#e10600");

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center overflow-hidden bg-[#050506] text-white">
      {/* music (gesture-started, so autoplay with sound is allowed) */}
      {active && songId && (
        <iframe
          aria-hidden
          title="intro-music"
          className="pointer-events-none absolute -left-[9999px] h-px w-px"
          allow="autoplay; encrypted-media"
          src={`https://www.youtube.com/embed/${songId}?autoplay=1&controls=0`}
        />
      )}

      {active && (
        <button
          onClick={finish}
          className="absolute right-5 top-5 z-20 inline-flex items-center gap-1.5 border border-white/30 px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.16em] text-white/70 hover:border-white hover:text-white"
        >
          Skip <FastForward className="size-3.5" />
        </button>
      )}

      {/* GATE */}
      {phase === "gate" && (
        <div className="flex flex-col items-center px-6 text-center">
          <div className="mb-3 font-mono text-[11px] uppercase tracking-[0.4em] text-white/50">
            Formula 1 · 2026
          </div>
          <h1 className="font-display text-6xl font-semibold leading-[0.9] tracking-tight sm:text-8xl">
            The <span className="italic" style={{ color: "#e10600" }}>Pit Wall</span>.
          </h1>
          <p className="mt-4 max-w-md text-sm text-white/60">
            Lights out. Engines screaming. Meet the grid. Turn your sound on.
          </p>
          <button
            onClick={() => setPhase("lights")}
            className="group mt-8 inline-flex items-center gap-3 bg-[#e10600] px-7 py-3.5 font-mono text-sm font-semibold uppercase tracking-[0.16em] text-white transition-transform hover:scale-105"
          >
            <Play className="size-4" fill="currentColor" /> Start the show
          </button>
          <div className="mt-4 font-mono text-[10px] uppercase tracking-[0.2em] text-white/35">
            ♪ Lose My Mind — Don Toliver, Doja Cat
          </div>
          <button
            onClick={finish}
            className="mt-6 font-mono text-[10px] uppercase tracking-[0.16em] text-white/40 underline-offset-4 hover:text-white/70 hover:underline"
          >
            Skip to dashboard
          </button>
        </div>
      )}

      {/* LIGHTS */}
      {phase === "lights" && (
        <div className="flex flex-col items-center gap-6">
          <div className="flex gap-3 sm:gap-5">
            {[1, 2, 3, 4, 5].map((i) => (
              <span
                key={i}
                className="size-10 rounded-full sm:size-14"
                style={{
                  background: i <= lit ? "#e10600" : "#1a1a1f",
                  boxShadow: i <= lit ? "0 0 26px rgba(225,6,0,0.85)" : "none",
                  transition: "background 0.12s, box-shadow 0.12s",
                }}
              />
            ))}
          </div>
          <span className="font-mono text-xs uppercase tracking-[0.4em] text-white/50">
            Lights out…
          </span>
        </div>
      )}

      {/* RACE — cars toward camera */}
      {phase === "race" && (
        <div className="absolute inset-0">
          {/* speed streaks */}
          {[18, 32, 46, 60, 74, 88].map((top, k) => (
            <span
              key={k}
              className="intro-streak absolute h-px bg-white/40"
              style={{ top: `${top}%`, width: "30vw", animationDelay: `${k * 90}ms` }}
            />
          ))}
          {raceColors.map((c, k) => (
            <div
              key={k}
              className="intro-approach absolute"
              style={{
                top: `${18 + k * 12}%`,
                left: 0,
                width: 320,
                animationDelay: `${k * 180}ms`,
              }}
            >
              <F1Car color={c} spinning className="w-full" />
            </div>
          ))}
          <div className="absolute inset-0 flex items-end justify-center pb-16">
            <span className="font-mono text-xs uppercase tracking-[0.4em] text-white/50">
              And away we go
            </span>
          </div>
        </div>
      )}

      {/* PARADE — driver introductions one by one */}
      {phase === "parade" && driver && (
        <div className="relative flex w-full max-w-4xl items-center justify-between gap-6 px-8">
          <div key={`name-${pi}`} className="intro-name min-w-0">
            <div
              className="intro-panel mb-3 inline-block px-3 py-1 font-mono text-sm font-bold uppercase tracking-[0.2em] text-black"
              style={{ background: driver.colour }}
            >
              {String(pi + 1).padStart(2, "0")} / {drivers.length}
            </div>
            <div className="font-mono text-lg uppercase tracking-[0.3em] text-white/50">
              {driver.team}
            </div>
            <div
              className="font-display text-6xl font-semibold leading-[0.9] sm:text-8xl"
              style={{ color: driver.colour }}
            >
              {driver.last.toUpperCase()}
            </div>
            <div className="mt-1 font-display text-2xl text-white/70">
              {driver.name} · #{driver.number}
            </div>
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            key={`face-${pi}`}
            src={driver.headshot}
            alt={driver.name}
            className="intro-headshot h-64 w-52 shrink-0 object-cover object-top sm:h-80 sm:w-64"
            style={{ borderBottom: `6px solid ${driver.colour}` }}
          />
        </div>
      )}

      {/* TITLE */}
      {phase === "title" && (
        <div className="intro-title flex flex-col items-center text-center">
          <div className="mb-2 flex items-center gap-2">
            <span className="inline-block h-3 w-6" style={{ background: "#e10600" }} />
            <span className="font-mono text-[11px] uppercase tracking-[0.4em] text-white/50">
              The Grid Is Set
            </span>
          </div>
          <h1 className="font-display text-7xl font-semibold leading-[0.9] tracking-tight sm:text-9xl">
            The <span className="italic" style={{ color: "#e10600" }}>Pit Wall</span>.
          </h1>
          <button
            onClick={finish}
            className="mt-8 inline-flex items-center gap-2 border border-white/40 px-6 py-3 font-mono text-sm uppercase tracking-[0.16em] hover:border-white"
          >
            Enter →
          </button>
        </div>
      )}
    </div>
  );
}
