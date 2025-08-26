// lib/useUserProfile.ts
import { doc, getDoc } from "firebase/firestore";
import { db } from "./firebase"; // correct path when this file lives in /lib

export type NormalizedProfile = {
  gamertag: string | null;
  team: string | null;
  platform: "xbox" | "ps" | "pc" | "switch" | null;

  // New, read-only display fields
  ratingElo: number | null;
  division: "Rookie" | "Pro" | "Elite" | "Legend" | null;

  // Optional: useful for provisional state in UI, if you track it
  placementGames?: number | null;
};

function pick<T = unknown>(obj: any, keys: string[]): T | undefined {
  for (const k of keys) {
    if (obj && obj[k] != null && obj[k] !== "") return obj[k];
  }
  return undefined;
}

function normalizeDivision(raw: any): NormalizedProfile["division"] {
  if (!raw) return null;
  const s = String(raw).toLowerCase();
  if (s.startsWith("rook")) return "Rookie";
  if (s.startsWith("pro")) return "Pro";
  if (s.startsWith("elit")) return "Elite";
  if (s.startsWith("leg")) return "Legend";
  return null;
}

function normalizePlatform(raw: any): NormalizedProfile["platform"] {
  if (!raw) return null;
  const s = String(raw).toLowerCase();
  if (["xbox", "xsx", "series x", "series s"].some(v => s.includes(v))) return "xbox";
  if (["ps", "ps5", "playstation"].some(v => s.includes(v))) return "ps";
  if (["pc", "computer"].some(v => s.includes(v))) return "pc";
  if (["switch", "nintendo"].some(v => s.includes(v))) return "switch";
  return null;
}

export async function fetchUserProfile(uid: string): Promise<NormalizedProfile> {
  try {
    const ref = doc(db, "users", uid);
    const snap = await getDoc(ref);

    if (!snap.exists()) {
      return {
        gamertag: null,
        team: null,
        platform: null,
        ratingElo: null,
        division: null,
        placementGames: null,
      };
    }

    const d = snap.data() || {};

    const gamertag =
      (pick<string>(d, ["gamertag", "gamerTag", "psn", "xbox", "handle"]) as string | undefined) ??
      null;

    const team =
      (pick<string>(d, ["team", "favoriteTeam", "teamName"]) as string | undefined) ?? null;

    // platform: prefer explicit `platform`, otherwise infer from legacy fields
    const platformExplicit = normalizePlatform(d.platform);
    const platformLegacy =
      d.psn ? "ps" :
      d.xbox ? "xbox" :
      null;
    const platform = platformExplicit ?? (platformLegacy as NormalizedProfile["platform"]);

    // read-only Elo/Division (don’t default to 1000 if missing; show null so UI can decide)
    const ratingEloRaw = pick<number>(d, ["ratingElo", "elo", "Elo"]);
    const ratingElo =
      typeof ratingEloRaw === "number" && Number.isFinite(ratingEloRaw)
        ? ratingEloRaw
        : null;

    const division = normalizeDivision(pick<string>(d, ["division", "tier", "rank"]));

    const placementGamesRaw = pick<number>(d, ["placementGames", "placements"]);
    const placementGames =
      typeof placementGamesRaw === "number" && Number.isFinite(placementGamesRaw)
        ? placementGamesRaw
        : null;

    return {
      gamertag,
      team,
      platform,
      ratingElo,
      division,
      placementGames,
    };
  } catch (err) {
    console.error("[fetchUserProfile] failed:", err);
    return {
      gamertag: null,
      team: null,
      platform: null,
      ratingElo: null,
      division: null,
      placementGames: null,
    };
    }
}


