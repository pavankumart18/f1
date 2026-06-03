"use client";

import { useEffect, useState } from "react";
import { Star } from "lucide-react";

const KEY = "pitwall-fav";

export function FavouriteButton({
  id,
  name,
  code,
}: {
  id: string;
  name: string;
  code?: string;
}) {
  const [fav, setFav] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const r = localStorage.getItem(KEY);
      setFav(!!r && JSON.parse(r).id === id);
    } catch {}
  }, [id]);

  function toggle() {
    if (fav) {
      localStorage.removeItem(KEY);
      setFav(false);
    } else {
      localStorage.setItem(KEY, JSON.stringify({ id, name, code }));
      setFav(true);
    }
    window.dispatchEvent(new Event("pitwall-fav-change"));
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={fav}
      className={`mt-3 inline-flex items-center gap-2 border px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.14em] transition-colors ${
        mounted && fav
          ? "border-accent bg-accent text-accent-ink"
          : "border-rule-strong hover:border-accent hover:text-accent"
      }`}
    >
      <Star className="size-3.5" fill={mounted && fav ? "currentColor" : "none"} />
      {mounted && fav ? "Your Driver" : "Set as my driver"}
    </button>
  );
}
