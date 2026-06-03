"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export function LightsOut() {
  const pathname = usePathname();
  const [show, setShow] = useState(true);
  const [lit, setLit] = useState(0);
  const [fade, setFade] = useState(false);

  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
    ) {
      setShow(false);
      return;
    }
    setShow(true);
    setFade(false);
    setLit(0);
    const t: ReturnType<typeof setTimeout>[] = [];
    for (let i = 1; i <= 5; i++) t.push(setTimeout(() => setLit(i), i * 110));
    t.push(setTimeout(() => { setLit(0); setFade(true); }, 720)); // lights out
    t.push(setTimeout(() => setShow(false), 1050));
    return () => t.forEach(clearTimeout);
  }, [pathname]);

  if (!show) return null;

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[100] flex items-center justify-center bg-paper"
      style={{ opacity: fade ? 0 : 1, transition: "opacity 0.32s ease-out" }}
    >
      <div className="flex flex-col items-center gap-4">
        <div className="flex gap-3 sm:gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <span
              key={i}
              className="size-7 rounded-full sm:size-9"
              style={{
                background: i <= lit ? "#e10600" : "var(--rule)",
                boxShadow: i <= lit ? "0 0 18px rgba(225,6,0,0.7)" : "none",
                transition: "background 0.1s, box-shadow 0.1s",
              }}
            />
          ))}
        </div>
        <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-ink-faint">
          {fade ? "Go go go" : "Lights out"}
        </span>
      </div>
    </div>
  );
}
