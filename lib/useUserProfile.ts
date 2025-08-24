// lib/useUserProfile.ts
import { doc, getDoc } from "firebase/firestore";
import { db } from "./firebase";  // ← was ../lib/firebase (wrong from inside /lib)

export type NormalizedProfile = {
  gamertag?: string | null;
  team?: string | null;
  platform?: "xbox" | "ps" | "pc" | "switch" | null;
};

function pick<T = unknown>(obj: any, keys: string[]): T | undefined {
  for (const k of keys) {
    if (obj && obj[k] != null && obj[k] !== "") return obj[k];
  }
  return undefined;
}

export async function fetchUserProfile(uid: string) {
  const snap = await getDoc(doc(db, "users", uid));
  if (!snap.exists()) return { gamertag: null, team: null, platform: null };

  const d = snap.data() || {};
  const gamertag =
    (pick<string>(d, ["gamertag", "gamerTag", "psn", "xbox", "handle"]) as string | undefined) ?? null;
  const team =
    (pick<string>(d, ["team", "favoriteTeam", "teamName"]) as string | undefined) ?? null;

  let platform: NormalizedProfile["platform"] = null;
  if (d.platform && ["xbox", "ps", "pc", "switch"].includes(String(d.platform).toLowerCase())) {
    platform = String(d.platform).toLowerCase() as any;
  } else if (d.psn) platform = "ps";
  else if (d.xbox) platform = "xbox";

  return { gamertag, team, platform };
}

