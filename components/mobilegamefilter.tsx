// components/mobilegamefilter.tsx
"use client";

import React, { useMemo, useRef } from "react";

export type GameKey =
  | "ALL"
  | "NBA2K"
  | "FIFA"
  | "UFC"
  | "MADDEN"
  | "COLLEGE_FB"
  | "MLB"
  | "NHL"
  | "FORTNITE_BUILD"
  | "ROCKET_LEAGUE";

interface MobileGameFilterProps {
  selectedGame: GameKey;
  onSelectGame: (g: GameKey) => void;
}

const GAME_OPTIONS: { key: GameKey; label: string; emoji?: string }[] = [
  { key: "ALL", label: "All", emoji: "🎮" },
  { key: "NBA2K", label: "NBA 2K", emoji: "🏀" },
  { key: "FIFA", label: "FIFA", emoji: "⚽" },
  { key: "UFC", label: "UFC", emoji: "🥊" },
  { key: "MADDEN", label: "Madden", emoji: "🏈" },
  { key: "COLLEGE_FB", label: "College Football", emoji: "🎓" },
  { key: "MLB", label: "MLB The Show", emoji: "⚾" },
  { key: "NHL", label: "NHL", emoji: "🏒" },
  { key: "FORTNITE_BUILD", label: "Fortnite (Build)", emoji: "🔧" },
  { key: "ROCKET_LEAGUE", label: "Rocket League", emoji: "🚗" },
];

export default function MobileGameFilter({
  selectedGame,
  onSelectGame,
}: MobileGameFilterProps) {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const chips = useMemo(() => GAME_OPTIONS, []);

  const scrollBy = (dir: "left" | "right") => {
    const el = trackRef.current;
    if (!el) return;
    const delta = Math.min(320, el.clientWidth * 0.8) * (dir === "left" ? -1 : 1);
    el.scrollBy({ left: delta, behavior: "smooth" });
  };

  return (
    <section className="md:hidden w-full px-3 pt-2 pb-2 select-none">
      {/* Slider row only */}
      <div className="relative">
        <button
          aria-label="Scroll left"
          onClick={() => scrollBy("left")}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 grid h-8 w-8 place-items-center rounded-full bg-black/40 backdrop-blur border border-white/10 shadow active:scale-95"
        >
          <span className="text-white">‹</span>
        </button>
        <button
          aria-label="Scroll right"
          onClick={() => scrollBy("right")}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 grid h-8 w-8 place-items-center rounded-full bg-black/40 backdrop-blur border border-white/10 shadow active:scale-95"
        >
          <span className="text-white">›</span>
        </button>

        <div ref={trackRef} className="no-scrollbar overflow-x-auto px-8" style={{ scrollSnapType: "x mandatory" }}>
          <div className="flex items-center gap-2 min-w-max py-2">
            {chips.map((chip) => {
              const active = chip.key === selectedGame;
              return (
                <button
                  key={chip.key}
                  type="button"
                  onClick={() => onSelectGame(chip.key)}
                  style={{ scrollSnapAlign: "start" }}
                  className={`group inline-flex items-center gap-2 rounded-2xl border px-3 py-2 text-sm font-semibold transition shadow ${
                    active
                      ? "border-yellow-400 bg-white/10 text-yellow-300 shadow-[0_0_18px_rgba(250,204,21,0.25)]"
                      : "border-white/15 bg-white/5 text-yellow-200/90 hover:bg-white/10"
                  }`}
                >
                  <span className="text-base leading-none">{chip.emoji}</span>
                  <span className="whitespace-nowrap">{chip.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <p className="mt-2 text-center text-xs text-white/60">Swipe to browse games • Tap to filter</p>

      <style jsx>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </section>
  );
}
