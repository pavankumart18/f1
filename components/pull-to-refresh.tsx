"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { RotateCw } from "lucide-react";

const THRESHOLD = 64;

export function PullToRefresh() {
  const router = useRouter();
  const [pull, setPull] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    let startY: number | null = null;
    let cur = 0;

    const onStart = (e: TouchEvent) => {
      startY = window.scrollY <= 0 ? e.touches[0].clientY : null;
    };
    const onMove = (e: TouchEvent) => {
      if (startY == null) return;
      const dy = e.touches[0].clientY - startY;
      cur = dy > 0 ? Math.min(96, dy * 0.5) : 0;
      setPull(cur);
    };
    const onEnd = () => {
      if (cur > THRESHOLD) {
        setRefreshing(true);
        router.refresh();
        setTimeout(() => setRefreshing(false), 900);
      }
      cur = 0;
      startY = null;
      setPull(0);
    };

    window.addEventListener("touchstart", onStart, { passive: true });
    window.addEventListener("touchmove", onMove, { passive: true });
    window.addEventListener("touchend", onEnd);
    return () => {
      window.removeEventListener("touchstart", onStart);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", onEnd);
    };
  }, [router]);

  const active = pull > 0 || refreshing;
  if (!active) return null;
  const ready = pull > THRESHOLD;

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-x-0 top-0 z-[60] flex justify-center md:hidden"
      style={{ transform: `translateY(${refreshing ? 12 : pull - 36}px)` }}
    >
      <span className="flex items-center gap-2 rounded-full border border-rule-strong bg-paper px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-soft shadow">
        <RotateCw
          className={`size-3.5 ${refreshing ? "animate-spin" : ""}`}
          style={{ transform: refreshing ? undefined : `rotate(${pull * 4}deg)` }}
        />
        {refreshing ? "Refreshing" : ready ? "Release to refresh" : "Pull to refresh"}
      </span>
    </div>
  );
}
