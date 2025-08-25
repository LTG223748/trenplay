// components/GameFilterBar.tsx
import React from "react";
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
  /** NEW props */
  selectedGameKey?: GameKey;
  onChange?: (key: GameKey) => void;

  /** BACK-COMPAT props */
  activeGame?: GameKey | "All" | "ALL";
  setActiveGame?: (key: GameKey | "All" | "ALL") => void;

  /** Optional: control which tabs appear and order */
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
  all: <MdSportsEsports className="text-purple-400 text-2xl" />,
  nba2k: <FaBasketballBall className="text-orange-400 text-lg" />,
  fifa: <FaFutbol className="text-green-400 text-lg" />,
  ufc: <GiBoxingGlove className="text-red-500 text-lg" />,
  madden: <FaFootballBall className="text-yellow-500 text-lg" />,
  cfb: <FaGraduationCap className="text-blue-300 text-lg" />,
  mlb: <FaBaseballBall className="text-pink-300 text-lg" />,
  nhl: <GiHockey className="text-cyan-300 text-lg" />,
  fortnite_build: <MdBuild className="text-emerald-300 text-xl" />,
  rocket_league: <FaCar className="text-sky-300 text-xl" />,
};

// normalize any variant of "All" to "all"
const toKey = (k: any): GameKey =>
  typeof k === "string" && k.toLowerCase() === "all" ? "all" : (k as GameKey);

export default function GameFilterBar({
  selectedGameKey,
  onChange,
  activeGame,
  setActiveGame,
  tabs = DEFAULT_TABS,
}: GameFilterBarProps) {
  // Support both prop styles + normalization
  const current: GameKey = toKey(selectedGameKey ?? activeGame ?? "all");
  const handleChange = (key: GameKey) => {
    const norm = toKey(key);
    if (onChange) onChange(norm);
    else if (setActiveGame) setActiveGame(norm);
  };

  return (
    <div
      className="flex justify-between bg-[#1a0033]/80 backdrop-blur-md border border-white/10 p-4 rounded-2xl shadow-inner mb-6"
      style={{ minHeight: 153 }}
    >
      {tabs.map((key) => {
        const active = current === key;
        return (
          <button
            key={key}
            onClick={() => handleChange(key)}
            className={`
              flex flex-col items-center justify-center flex-1 mx-2
              min-w-0 rounded-[36px] border-2
              font-orbitron font-black uppercase tracking-widest
              text-base sm:text-lg transition-all duration-300
              ${active
                ? "bg-white/70 text-black border-yellow-200 scale-105 z-10 shadow-[0_0_20px_rgba(250,204,21,.55)]"
                : "bg-white/20 border-[#6648b0] text-white hover:bg-white/30 hover:shadow-[0_0_14px_rgba(168,85,247,.35)]"}
              hover:scale-105
            `}
            style={{
              minHeight: 108,
              maxWidth: "225px",
              backdropFilter: "blur(8px)",
              letterSpacing: "0.08em",
            }}
          >
            <div className="mb-1">{ICONS[key]}</div>
            <span className="leading-tight text-shadow-lg break-words whitespace-pre-line text-sm sm:text-base text-center">
              {LABELS[key]}
            </span>
          </button>
        );
      })}
    </div>
  );
}



