// lib/games.ts
export type TrenGameId =
  | "nba2k"
  | "fifa"
  | "ufc"
  | "madden"
  | "cfb"
  | "mlb"
  | "nhl"
  | "fortnite_build"
  | "rocket_league";

export const GAMES: Record<
  TrenGameId,
  {
    label: string;
    icon: string;
    crossplay?: boolean;
    modes?: string[];
    defaultMode?: string;
  }
> = {
  nba2k: { label: "NBA 2K", icon: "🏀" },
  fifa: { label: "FIFA", icon: "⚽" },
  ufc: { label: "UFC", icon: "🥊" },
  madden: { label: "Madden", icon: "🏈" },
  cfb: { label: "College Football", icon: "🎓" },
  mlb: { label: "MLB The Show", icon: "⚾" },

  // NEW
  nhl: { label: "NHL", icon: "🏒" },

  fortnite_build: {
    label: "Fortnite (Build)",
    icon: "🛠️",
    crossplay: true,
    modes: ["1v1 Realistics", "1v1 Box Fights", "Zone Wars 1v1"],
    defaultMode: "1v1 Box Fights",
  },
  rocket_league: {
    label: "Rocket League",
    icon: "🚗",
    crossplay: true,
    modes: ["1v1", "2v2"],
    defaultMode: "1v1",
  },
};


