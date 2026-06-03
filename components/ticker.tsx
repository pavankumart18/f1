"use client";

export function Ticker({ items }: { items: string[] }) {
  if (!items.length) return null;
  // Duplicate the list so the marquee can loop seamlessly (-50% keyframe).
  const loop = [...items, ...items];

  return (
    <div className="relative flex overflow-hidden border-y border-rule-strong bg-ink text-paper">
      <div className="flex shrink-0 items-center gap-2 bg-accent px-3 py-2 text-accent-ink">
        <span className="size-1.5 rounded-full bg-accent-ink live-dot" />
        <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em]">
          Live
        </span>
      </div>
      <div className="flex animate-ticker whitespace-nowrap py-2">
        {loop.map((item, i) => (
          <span
            key={i}
            className="mx-6 font-mono text-xs uppercase tracking-[0.1em] text-paper/90"
          >
            <span className="mr-6 text-accent">◆</span>
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
