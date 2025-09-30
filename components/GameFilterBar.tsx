"use client";

import React, { useMemo, useState } from "react";
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
import QuickJoinButton from "./QuickJoinButton";

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

  // Local state for stake + platform (used by Quick Join)
  const [stake, setStake] = useState(5);
  const [platform, setPlatform] = useState("PS5");

  const handleChange = (key: GameKey) => {
    const norm = toKey(key);
    if (onChange) onChange(norm);
    else if (setActiveGame) setActiveGame(norm);
  };

  const items = useMemo(() => tabs, [tabs]);

  return (
    <div className="rounded-2xl border border-white/10 bg-[#1a0f2a]/70 backdrop-blur-md p-3 sm:p-4 mb-4 space-y-4">
      {/* Game Tabs */}
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
                  ? "bg-white/80 text-black border-yellow-200 shadow-[0_0_20px_rgba(250,204,21,.45)]"
                  : "bg-white/12 text-white border-[#6a53b3]/70 hover:bg-white/18 hover:shadow-[0_0_14px_rgba(168,85,247,.35)]",
              ].join(" ")}
              style={{ minHeight: 64 }}
            >
              <span
                className={
                  active
                    ? "drop-shadow-[0_0_8px_rgba(255,255,255,.35)]"
                    : ""
                }
              >
                {ICONS[key]}
              </span>
              <span className="text-center">{LABELS[key]}</span>

              {active && (
                <span className="pointer-events-none absolute inset-0 rounded-[28px] ring-2 ring-yellow-300/70" />
              )}
            </button>
          );
        })}
      </div>

      {/* Stake + Platform selectors */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        {/* Stake Dropdown */}
        <div className="flex flex-col items-start">
          <label className="text-xs text-white/60 font-orbitron mb-1">
            Stake $ (converted to TC)
          </label>
          <select
            value={stake}
            onChange={(e) => setStake(Number(e.target.value))}
            className="
              w-32 rounded-xl px-3 py-2
              bg-white/10 text-white
              font-orbitron font-bold text-sm
              border border-purple-400/40
              focus:outline-none focus:ring-2 focus:ring-yellow-300/60
              transition-all
              appearance-none
            "
          >
            <option value={5}>$5 (converted to TC)</option>
            <option value={10}>$10 (converted to TC)</option>
            <option value={25}>$25 (converted to TC)</option>
            <option value={50}>$50 (converted to TC)</option>
            <option value={100}>$100 (converted to TC)</option>
          </select>
        </div>

        {/* Platform Select */}
        <div className="flex flex-col items-start">
          <label className="text-xs text-white/60 font-orbitron mb-1">
            Platform
          </label>
          <select
            value={platform}
            onChange={(e) => setPlatform(e.target.value)}
            className="
              w-32 rounded-xl px-3 py-2
              bg-white/10 text-white
              font-orbitron font-bold text-sm
              border border-purple-400/40
              focus:outline-none focus:ring-2 focus:ring-yellow-300/60
              transition-all
              appearance-none
            "
          >
            <option value="PS5">PS5</option>
            <option value="Xbox">Xbox</option>
          </select>
        </div>
      </div>

      {/* Quick Join button */}
      {current !== "all" && (
        <div className="pt-2">
          <QuickJoinButton
            gameId={current as TrenGameId}
            platform={platform}
            stake={stake}
          />
        </div>
      )}
    </div>
  );
}



