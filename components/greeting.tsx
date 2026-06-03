"use client";

import { useEffect, useState } from "react";

export function Greeting() {
  const [text, setText] = useState("Welcome to the");

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
    setText(`${part} — your`);
  }, []);

  return <>{text}</>;
}
