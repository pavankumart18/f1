"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

// Highlights the favourite driver's row in any table that tags rows with
// data-driver. Re-applies on navigation and when the favourite changes.
export function FavouriteHighlighter() {
  const pathname = usePathname();
  useEffect(() => {
    const apply = () => {
      let fav: { id: string } | null = null;
      try {
        fav = JSON.parse(localStorage.getItem("pitwall-fav") || "null");
      } catch {}
      document.querySelectorAll("[data-driver]").forEach((el) => {
        el.classList.toggle(
          "fav-row",
          !!fav && el.getAttribute("data-driver") === fav.id
        );
      });
    };
    const id = setTimeout(apply, 60);
    window.addEventListener("pitwall-fav-change", apply);
    return () => {
      clearTimeout(id);
      window.removeEventListener("pitwall-fav-change", apply);
    };
  }, [pathname]);
  return null;
}
