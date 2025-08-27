// _archived/_api_disabled/autoAdvanceNoShows.ts
// Scheduled-style utility (can be called from a cron/CF). Not an API route.

import {
  collection,
  getDocs,
  writeBatch,
  doc as fsDoc,
} from "firebase/firestore";
import { db } from "../../lib/firebase"; // <-- fixed relative path

type Match = {
  player1?: string;
  player2?: string;
  completed?: boolean;
  winner?: string | null;
  scheduledAt?: string | number | Date; // optional per-match time
  // Optional reporting fields if you add them later:
  // reports?: { [uid: string]: "win" | "loss" };
};

type Round = {
  date?: string | number | Date; // fallback time for matches in this round
  matchups: Match[];
};

type Tournament = {
  matchSchedule?: Round[];
};

const GRACE_MS = 10 * 60 * 1000; // 10 minutes

export async function autoAdvanceNoShows(): Promise<void> {
  const now = Date.now();

  const snap = await getDocs(collection(db, "tournaments"));
  const batch = writeBatch(db);

  snap.forEach((tDoc) => {
    const tData = tDoc.data() as Tournament;
    const schedule = tData.matchSchedule ?? [];
    if (!Array.isArray(schedule) || schedule.length === 0) return;

    schedule.forEach((round, roundIdx) => {
      if (!round || !Array.isArray(round.matchups)) return;

      round.matchups.forEach((match, matchIdx) => {
        if (!match || match.completed) return;

        // Determine the scheduled time for this matchup
        const scheduled =
          match.scheduledAt ?? round.date ?? new Date().toISOString();
        const scheduledMs =
          scheduled instanceof Date
            ? scheduled.getTime()
            : typeof scheduled === "number"
            ? scheduled
            : new Date(scheduled).getTime();

        // If the match is past the grace window, auto-advance
        if (Number.isFinite(scheduledMs) && now - scheduledMs > GRACE_MS) {
          // Basic rule: if no winner reported, advance player1 (fallback to player2)
          const winner = match.player1 ?? match.player2 ?? null;

          // Prepare field paths for a partial nested update
          const base = `matchSchedule.${roundIdx}.matchups.${matchIdx}`;
          batch.update(fsDoc(db, "tournaments", tDoc.id), {
            [`${base}.completed`]: true,
            [`${base}.winner`]: winner,
          });
        }
      });
    });
  });

  await batch.commit();
}

