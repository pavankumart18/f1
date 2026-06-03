"use client";

import { useEffect, useRef, useState } from "react";
import { Gamepad2, Wrench } from "lucide-react";

/* ---------------------------------------------------------------- BLUEPRINT */

type Part = { id: string; label: string; top: string; left: string; node: React.ReactNode };

const stroke = { fill: "none", stroke: "currentColor", strokeWidth: 2 } as const;

const PARTS: Part[] = [
  {
    id: "01", label: "Front Wing", top: "12%", left: "10%",
    node: (
      <svg viewBox="0 0 90 40" className="w-20">
        <path d="M5 20 H85" {...stroke} />
        <path d="M10 12 H80 M14 28 H76" {...stroke} />
        <path d="M5 10 V30 M85 10 V30" {...stroke} />
      </svg>
    ),
  },
  {
    id: "02", label: "Halo", top: "8%", left: "46%",
    node: (
      <svg viewBox="0 0 70 40" className="w-16">
        <path d="M8 34 C 10 8, 60 8, 62 34" {...stroke} />
        <path d="M35 12 V34" {...stroke} />
      </svg>
    ),
  },
  {
    id: "03", label: "Steering", top: "10%", left: "76%",
    node: (
      <svg viewBox="0 0 56 44" className="w-14">
        <rect x="6" y="8" width="44" height="28" rx="8" {...stroke} />
        <path d="M16 36 V42 M40 36 V42" {...stroke} />
      </svg>
    ),
  },
  {
    id: "04", label: "Chassis / Nose", top: "40%", left: "40%",
    node: (
      <svg viewBox="0 0 140 44" className="w-32">
        <path d="M4 22 L40 8 H110 L136 16 V28 L110 36 H40 Z" {...stroke} />
      </svg>
    ),
  },
  {
    id: "05", label: "Tyre · FL", top: "34%", left: "8%",
    node: <Tyre />,
  },
  {
    id: "06", label: "Tyre · FR", top: "60%", left: "12%",
    node: <Tyre />,
  },
  {
    id: "07", label: "Tyre · RL", top: "34%", left: "82%",
    node: <Tyre />,
  },
  {
    id: "08", label: "Tyre · RR", top: "62%", left: "80%",
    node: <Tyre />,
  },
  {
    id: "09", label: "Sidepod", top: "66%", left: "44%",
    node: (
      <svg viewBox="0 0 100 36" className="w-24">
        <path d="M4 30 C 30 4, 70 4, 96 18 L96 30 Z" {...stroke} />
      </svg>
    ),
  },
  {
    id: "10", label: "Rear Wing", top: "84%", left: "60%",
    node: (
      <svg viewBox="0 0 80 36" className="w-20">
        <rect x="8" y="6" width="64" height="9" {...stroke} />
        <path d="M12 15 V32 M68 15 V32 M30 20 H50" {...stroke} />
      </svg>
    ),
  },
];

function Tyre() {
  return (
    <svg viewBox="0 0 48 48" className="w-12">
      <circle cx="24" cy="24" r="20" {...stroke} />
      <circle cx="24" cy="24" r="9" {...stroke} />
    </svg>
  );
}

function Blueprint() {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  return (
    <div
      className="relative h-full w-full overflow-hidden"
      style={{
        perspective: "1400px",
        background: "#0a1a33",
        backgroundImage:
          "linear-gradient(rgba(120,170,255,0.14) 1px, transparent 1px), linear-gradient(90deg, rgba(120,170,255,0.14) 1px, transparent 1px)",
        backgroundSize: "28px 28px",
      }}
      onMouseMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        setTilt({
          x: ((e.clientY - r.top) / r.height - 0.5) * -12,
          y: ((e.clientX - r.left) / r.width - 0.5) * 14,
        });
      }}
      onMouseLeave={() => setTilt({ x: 0, y: 0 })}
    >
      <div
        className="absolute inset-6 text-sky-200/80"
        style={{
          transform: `rotateX(${55 + tilt.x}deg) rotateZ(2deg) rotateY(${tilt.y}deg)`,
          transformStyle: "preserve-3d",
          transition: "transform 0.2s ease-out",
        }}
      >
        {PARTS.map((p, i) => (
          <div
            key={p.id}
            className="car-float absolute flex flex-col items-center gap-1"
            style={{ top: p.top, left: p.left, animationDelay: `${i * 160}ms` }}
          >
            {p.node}
            <span className="font-mono text-[8px] uppercase tracking-[0.14em] text-sky-200/60">
              [{p.id}] {p.label}
            </span>
          </div>
        ))}
      </div>
      <div className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 text-center">
        <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-sky-200/50">
          [04] Formula — Exploded Kit
        </div>
        <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-sky-200/30">
          move your cursor to inspect
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------- DRIVE */

function TopCar({ color = "#e10600" }: { color?: string }) {
  return (
    <svg viewBox="0 0 40 70" className="h-14 w-8 drop-shadow">
      {/* tyres */}
      <rect x="1" y="12" width="8" height="16" rx="2" fill="#15151a" />
      <rect x="31" y="12" width="8" height="16" rx="2" fill="#15151a" />
      <rect x="1" y="44" width="8" height="16" rx="2" fill="#15151a" />
      <rect x="31" y="44" width="8" height="16" rx="2" fill="#15151a" />
      {/* wings */}
      <rect x="6" y="2" width="28" height="6" rx="2" fill={color} />
      <rect x="8" y="62" width="24" height="6" rx="2" fill={color} />
      {/* body */}
      <path d="M20 6 C 26 18, 26 26, 24 40 L24 60 H16 L16 40 C 14 26, 14 18, 20 6 Z" fill={color} />
      <circle cx="20" cy="34" r="3.2" fill="#15151a" />
    </svg>
  );
}

function Drive() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const carRef = useRef<HTMLDivElement>(null);
  const hudRef = useRef<HTMLSpanElement>(null);
  const keys = useRef<Set<string>>(new Set());

  useEffect(() => {
    const wrap = wrapRef.current!;
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const resize = () => {
      const r = wrap.getBoundingClientRect();
      canvas.width = r.width;
      canvas.height = r.height;
    };
    resize();
    window.addEventListener("resize", resize);

    const s = { x: canvas.width / 2, y: canvas.height / 2, heading: -Math.PI / 2, speed: 0 };
    const set = (k: string, v: boolean) => (v ? keys.current.add(k) : keys.current.delete(k));
    const isDir = (k: string) =>
      ["arrowup", "arrowdown", "arrowleft", "arrowright"].includes(k);
    const down = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (isDir(k)) e.preventDefault();
      set(k, true);
    };
    const up = (e: KeyboardEvent) => set(e.key.toLowerCase(), false);
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);

    let raf = 0;
    let last = performance.now();
    const loop = (t: number) => {
      const dt = Math.min(2.5, (t - last) / 16.67);
      last = t;
      const k = keys.current;
      const thr = (k.has("arrowup") || k.has("w") ? 1 : 0) - (k.has("arrowdown") || k.has("s") ? 1 : 0);
      const steer = (k.has("arrowright") || k.has("d") ? 1 : 0) - (k.has("arrowleft") || k.has("a") ? 1 : 0);
      s.speed += thr * 0.32 * dt;
      s.speed *= Math.pow(0.975, dt);
      s.speed = Math.max(-3, Math.min(7.5, s.speed));
      if (Math.abs(s.speed) > 0.05) {
        s.heading += steer * 0.05 * dt * (0.4 + Math.abs(s.speed) / 7.5) * Math.sign(s.speed);
      }
      const nx = s.x + Math.cos(s.heading) * s.speed * 2.4 * dt;
      const ny = s.y + Math.sin(s.heading) * s.speed * 2.4 * dt;
      s.x = Math.max(18, Math.min(canvas.width - 18, nx));
      s.y = Math.max(24, Math.min(canvas.height - 24, ny));

      // tyre marks
      if (Math.abs(s.speed) > 0.5) {
        const turning = steer !== 0 && Math.abs(s.speed) > 3;
        ctx.fillStyle = turning ? "rgba(20,20,25,0.32)" : "rgba(20,20,25,0.14)";
        const rear = 14;
        const rx = s.x - Math.cos(s.heading) * rear;
        const ry = s.y - Math.sin(s.heading) * rear;
        const perp = s.heading + Math.PI / 2;
        for (const off of [-7, 7]) {
          ctx.beginPath();
          ctx.arc(rx + Math.cos(perp) * off, ry + Math.sin(perp) * off, 1.7, 0, 7);
          ctx.fill();
        }
      }
      if (carRef.current) {
        carRef.current.style.transform = `translate(${s.x}px, ${s.y}px) translate(-50%, -50%) rotate(${s.heading + Math.PI / 2}rad)`;
      }
      if (hudRef.current) hudRef.current.textContent = String(Math.round(Math.abs(s.speed) * 42));
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, []);

  const touch = (k: string, v: boolean) => () => {
    if (v) keys.current.add(k);
    else keys.current.delete(k);
  };

  return (
    <div ref={wrapRef} className="relative h-full w-full overflow-hidden bg-[#f0efe9]">
      <canvas ref={canvasRef} className="absolute inset-0" />
      <div ref={carRef} className="absolute left-0 top-0 will-change-transform">
        <TopCar />
      </div>

      {/* HUD */}
      <div className="pointer-events-none absolute left-4 top-4 font-mono text-[11px] uppercase tracking-[0.2em] text-[#15151a]/70">
        <div>[Kit] [Drive] [Studio]</div>
        <div className="mt-1 text-2xl font-bold tracking-normal text-[#15151a]">
          <span ref={hudRef}>0</span>{" "}
          <span className="text-sm font-normal">km/h</span>
        </div>
      </div>
      <div className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 font-mono text-[10px] uppercase tracking-[0.3em] text-[#15151a]/50">
        WASD / Arrows to drive
      </div>

      {/* touch controls */}
      <div className="absolute bottom-4 right-4 flex select-none flex-col items-center gap-2 sm:hidden">
        <button
          onTouchStart={touch("arrowup", true)}
          onTouchEnd={touch("arrowup", false)}
          className="size-12 rounded-full bg-[#15151a] text-paper"
          aria-label="Accelerate"
        >
          ▲
        </button>
        <div className="flex gap-2">
          <button
            onTouchStart={touch("arrowleft", true)}
            onTouchEnd={touch("arrowleft", false)}
            className="size-12 rounded-full bg-[#15151a] text-paper"
            aria-label="Left"
          >
            ◀
          </button>
          <button
            onTouchStart={touch("arrowdown", true)}
            onTouchEnd={touch("arrowdown", false)}
            className="size-12 rounded-full bg-[#15151a] text-paper"
            aria-label="Brake"
          >
            ▼
          </button>
          <button
            onTouchStart={touch("arrowright", true)}
            onTouchEnd={touch("arrowright", false)}
            className="size-12 rounded-full bg-[#15151a] text-paper"
            aria-label="Right"
          >
            ▶
          </button>
        </div>
      </div>
    </div>
  );
}

/* --------------------------------------------------------------------- ROOT */

export function Garage() {
  const [mode, setMode] = useState<"kit" | "drive">("kit");
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="mb-4 flex items-end justify-between">
        <div>
          <div className="kicker mb-1">[04] Formula · Lab</div>
          <h1 className="font-display text-4xl font-semibold tracking-tight sm:text-5xl">
            The <span className="italic text-accent">Garage</span>
          </h1>
        </div>
        <div className="flex border border-rule-strong">
          {(["kit", "drive"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`inline-flex items-center gap-2 px-4 py-2 font-mono text-[11px] uppercase tracking-[0.16em] transition-colors ${
                mode === m ? "bg-ink text-paper" : "text-ink-soft hover:text-ink"
              }`}
            >
              {m === "kit" ? <Wrench className="size-3.5" /> : <Gamepad2 className="size-3.5" />}
              {m}
            </button>
          ))}
        </div>
      </div>

      <div className="h-[72vh] min-h-[480px] overflow-hidden border border-rule-strong">
        {mode === "kit" ? <Blueprint /> : <Drive />}
      </div>
      <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">
        A lite homage to lab.patrickheintzmann.com/demoFormula — switch to{" "}
        <button onClick={() => setMode("drive")} className="text-accent underline-offset-2 hover:underline">
          Drive
        </button>{" "}
        and leave some rubber down.
      </p>
    </div>
  );
}
