"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Opt = { id: string; name: string };

export function CompareForm({
  drivers,
  initialA,
  initialB,
}: {
  drivers: Opt[];
  initialA?: string;
  initialB?: string;
}) {
  const router = useRouter();
  const [a, setA] = useState(initialA ?? "");
  const [b, setB] = useState(initialB ?? "");

  function go(na: string, nb: string) {
    if (na && nb) router.push(`/compare?a=${na}&b=${nb}`);
  }

  const select = (
    value: string,
    onChange: (v: string) => void,
    side: string
  ) => (
    <select
      value={value}
      onChange={(e) => {
        onChange(e.target.value);
        if (side === "a") go(e.target.value, b);
        else go(a, e.target.value);
      }}
      className="w-full border border-rule-strong bg-paper px-3 py-2.5 font-display text-base text-ink focus:border-accent focus:outline-none"
    >
      <option value="">Select driver…</option>
      {drivers.map((d) => (
        <option key={d.id} value={d.id}>
          {d.name}
        </option>
      ))}
    </select>
  );

  return (
    <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
      {select(a, setA, "a")}
      <span className="font-display text-xl italic text-accent">vs</span>
      {select(b, setB, "b")}
    </div>
  );
}
