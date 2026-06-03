"use client";

import { useEffect, useState } from "react";

export function Greeting() {
  const [text, setText] = useState("Welcome to your Pit Wall");

  useEffect(() => {
    const h = new Date().getHours();
    const part =
      h < 5
        ? "Burning the midnight oil"
        : h < 12
          ? "Good morning"
          : h < 17
            ? "Good afternoon"
            : h < 21
              ? "Good evening"
              : "Lights out and away we go";
    let fav: { name: string } | null = null;
    try {
      const r = localStorage.getItem("pitwall-fav");
      fav = r ? JSON.parse(r) : null;
    } catch {}
    setText(
      `${part} — your Pit Wall${fav ? ` · following ${fav.name}` : ""}`
    );
  }, []);

  return <>{text}</>;
}
