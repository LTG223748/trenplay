// pages/api/tournaments/claim-no-show.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "../../../lib/firebase";
import {
  doc,
  getDoc,
  runTransaction,
  serverTimestamp,
} from "firebase/firestore";

// 10 minutes grace period
const GRACE_MS = 10 * 60 * 1000;

function toMs(v: any): number {
  if (!v) return NaN;
  if (v instanceof Date) return v.getTime();
  if (typeof v === "number") return v;
  if (typeof v === "string") return new Date(v).getTime();
  if (typeof v.toMillis === "function") return v.toMillis();
  return NaN;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ ok: false, error: "Method not allowed" });

  try {
    const { tournamentId, roundIdx, matchIdx, claimantUid } = req.body as {
      tournamentId?: string;
      roundIdx?: number;
      matchIdx?: number;
      claimantUid?: string;
    };

    if (!tournamentId || roundIdx === undefined || matchIdx === undefined || !claimantUid) {
      return res.status(400).json({ ok: false, error: "tournamentId, roundIdx, matchIdx, claimantUid are required" });
    }

    const tRef = doc(db, "tournaments", tournamentId);

    await runTransaction(db, async (tx) => {
      const tSnap = await tx.get(tRef);
      if (!tSnap.exists()) throw new Error("Tournament not found");

      const tData = tSnap.data() as any;
      const schedule = Array.isArray(tData?.matchSchedule) ? tData.matchSchedule : [];
      const round = schedule[roundIdx];
      if (!round) throw new Error("Round not found");

      const matchup = Array.isArray(round.matchups) ? round.matchups[matchIdx] : undefined;
      if (!matchup) throw new Error("Matchup not found");

      // Already completed?
      if (matchup.completed || matchup.winnerUid || matchup.winner) {
        throw new Error("Matchup already completed");
      }

      // Determine participants (support multiple field shapes)
      const p1 = matchup.player1Uid ?? matchup.player1 ?? matchup.p1Uid ?? matchup.p1 ?? null;
      const p2 = matchup.player2Uid ?? matchup.player2 ?? matchup.p2Uid ?? matchup.p2 ?? null;

      if (claimantUid !== p1 && claimantUid !== p2) {
        throw new Error("Not a participant");
      }

      // Opponent already reported? (optional schema)
      const opponent = claimantUid === p1 ? p2 : p1;
      const reports = matchup.reports || {};
      if (opponent && reports[opponent]) {
        throw new Error("Opponent has already reported");
      }

      // Time check — allow claim only after scheduled time + 10min
      const perMatch = matchup.scheduledAt;
      const perRound = round.date;
      const schedMs = Number.isFinite(toMs(perMatch)) ? toMs(perMatch) : toMs(perRound);
      if (!Number.isFinite(schedMs)) throw new Error("Matchup missing scheduled time");
      if (Date.now() - (schedMs as number) < GRACE_MS) throw new Error("Too early to claim");

      // Mark completed & set winner (normalize to winnerUid and winner)
      const base = `matchSchedule.${roundIdx}.matchups.${matchIdx}`;
      tx.update(tRef, {
        [`${base}.completed`]: true,
        [`${base}.winnerUid`]: claimantUid,
        [`${base}.winner`]: claimantUid, // keep both if your UI uses winner
        [`${base}.status`]: "completed_no_show",
        [`${base}.noShowClaimedBy`]: claimantUid,
        [`${base}.noShowClaimedAt`]: serverTimestamp(),
      });
    });

    return res.status(200).json({ ok: true });
  } catch (e: any) {
    return res.status(400).json({ ok: false, error: e?.message || "error" });
  }
}
