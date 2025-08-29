// components/GameFilterBar.tsx
import React, { useMemo } from "react";
import {
  FaBasketballBall,
  FaFutbol,
  FaFootballBall,
  FaGraduationCap,
  FaBaseballBall,
  FaCar,
} from "react-icons/fa";
import { GiBoxingGlove, GiHockey } from "react-icons/gi";
import { MdSportsEsports, MdBuild } from "react-icons/md";
import { TrenGameId } from "../lib/games";

type GameKey = TrenGameId | "all";

interface GameFilterBarProps {
  selectedGameKey?: GameKey;
  onChange?: (key: GameKey) => void;

  // Back-compat props
  activeGame?: GameKey | "All" | "ALL";
  setActiveGame?: (key: GameKey | "All" | "ALL") => void;

  tabs?: GameKey[];
}

const DEFAULT_TABS: GameKey[] = [
  "all",
  "nba2k",
  "fifa",
  "ufc",
  "madden",
  "cfb",
  "mlb",
  "nhl",
  "fortnite_build",
  "rocket_league",
];

const LABELS: Record<GameKey, string> = {
  all: "ALL",
  nba2k: "NBA 2K",
  fifa: "FIFA",
  ufc: "UFC",
  madden: "MADDEN",
  cfb: "COLLEGE FOOTBALL",
  mlb: "MLB THE SHOW",
  nhl: "NHL",
  fortnite_build: "FORTNITE (BUILD)",
  rocket_league: "ROCKET LEAGUE",
};

const ICONS: Record<GameKey, React.ReactNode> = {
  all: <MdSportsEsports className="text-purple-300 text-[18px] sm:text-[20px]" />,
  nba2k: <FaBasketballBall className="text-orange-400 text-[16px] sm:text-[18px]" />,
  fifa: <FaFutbol className="text-green-400 text-[16px] sm:text-[18px]" />,
  ufc: <GiBoxingGlove className="text-red-400 text-[16px] sm:text-[18px]" />,
  madden: <FaFootballBall className="text-yellow-400 text-[16px] sm:text-[18px]" />,
  cfb: <FaGraduationCap className="text-blue-300 text-[16px] sm:text-[18px]" />,
  mlb: <FaBaseballBall className="text-pink-300 text-[16px] sm:text-[18px]" />,
  nhl: <GiHockey className="text-cyan-300 text-[16px] sm:text-[18px]" />,
  fortnite_build: <MdBuild className="text-emerald-300 text-[18px] sm:text-[20px]" />,
  rocket_league: <FaCar className="text-sky-300 text-[18px] sm:text-[20px]" />,
};

const toKey = (k: any): GameKey =>
  typeof k === "string" && k.toLowerCase() === "all" ? "all" : (k as GameKey);

export default function GameFilterBar({
  selectedGameKey,
  onChange,
  activeGame,
  setActiveGame,
  tabs = DEFAULT_TABS,
}: GameFilterBarProps) {
  const current: GameKey = toKey(selectedGameKey ?? activeGame ?? "all");
  const handleChange = (key: GameKey) => {
    const norm = toKey(key);
    if (onChange) onChange(norm);
    else if (setActiveGame) setActiveGame(norm);
  };

  const items = useMemo(() => tabs, [tabs]);

  return (
    <div className="rounded-2xl border border-white/10 bg-[#1a0f2a]/70 backdrop-blur-md p-3 sm:p-4 mb-4">
      {/* 
        Grid that wraps without scrolling.
        - On narrow screens it becomes 2 rows
        - Each item has a flexible min width so everything stays visible
      */}
      <div
        className="
          grid gap-3 sm:gap-4 
          grid-cols-2 
          [@media(min-width:640px)]:grid-cols-3
          [@media(min-width:900px)]:grid-cols-5
          [@media(min-width:1180px)]:grid-cols-7
        "
      >
        {items.map((key) => {
          const active = current === key;
          return (
            <button
              key={key}
              onClick={() => handleChange(key)}
              className={[
                "relative flex items-center justify-center gap-2",
                "rounded-[28px] border transition-all duration-200",
                "px-3 py-3 sm:px-4 sm:py-4",
                "font-orbitron font-black uppercase tracking-[0.10em]",
                "text-[12px] sm:text-[13px] leading-none",
                active
                  ? // Active: bright surface + neon ring
                    "bg-white/80 text-black border-yellow-200 shadow-[0_0_20px_rgba(250,204,21,.45)]"
                  : // Inactive: muted pill with subtle outline
                    "bg-white/12 text-white border-[#6a53b3]/70 hover:bg-white/18 hover:shadow-[0_0_14px_rgba(168,85,247,.35)]",
              ].join(" ")}
              style={{ minHeight: 64 }}
            >
              <span className={active ? "drop-shadow-[0_0_8px_rgba(255,255,255,.35)]" : ""}>
                {ICONS[key]}
              </span>
              <span className="text-center">{LABELS[key]}</span>

              {/* active glow ring */}
              {active && (
                <span className="pointer-events-none absolute inset-0 rounded-[28px] ring-2 ring-yellow-300/70" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
