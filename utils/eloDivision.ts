// /utils/eloDivision.ts
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../lib/firebase";

// --- Division rules (edit these if you change your system) ---
export type Division = "Rookie" | "Pro" | "Elite" | "Legend";

// Get division based on ELO
export function getDivision(elo: number): Division {
  if (elo >= 1200) return "Legend";
  if (elo >= 900)  return "Elite";
  if (elo >= 700)  return "Pro";
  return "Rookie";
}

// Get baseline ELO for a division (for manual admin changes)
export function getEloForDivision(division: Division): number {
  switch (division) {
    case "Legend": return 1200;
    case "Elite": return 900;
    case "Pro": return 700;
    default: return 500; // Rookie
  }
}

// Calculate ELO after win/loss
export function calculateNewElo(currentElo: number, didWin: boolean): number {
  const newElo = currentElo + (didWin ? 25 : -20);
  return newElo < 0 ? 0 : newElo;
}

/**
 * Updates a user's ELO and division in Firestore based on match result.
 * This should be called after each match.
 */
export async function updateUserDivisionAndElo(userId: string, didWin: boolean) {
  const userRef = doc(db, "users", userId);
  const userSnap = await getDoc(userRef);
  const user = userSnap.data();
  if (!user) return;

  // Default ELO is 500 if missing
  const currentElo = typeof user.elo === "number" ? user.elo : 500;
  const newElo = calculateNewElo(currentElo, didWin);
  const newDivision = getDivision(newElo);

  await updateDoc(userRef, {
    elo: newElo,
    division: newDivision,
  });
}

/**
 * Admin/manual division change — syncs ELO with chosen division.
 * Call this if an admin updates a user's division.
 */
export async function updateDivisionAndEloByAdmin(userId: string, division: Division) {
  const userRef = doc(db, "users", userId);
  const newElo = getEloForDivision(division);

  await updateDoc(userRef, {
    division,
    elo: newElo,
  });
}

