import type { NextApiRequest, NextApiResponse } from "next";
import {
  doc,
  getDoc,
  runTransaction,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../../../lib/firebase";

// 10 minutes grace window (ms)
const GRACE_MS = 10 * 60 * 1000;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ ok: false, error: "Method not allowed" });

  try {
    const { matchId, claimantUid } = req.body as { matchId?: string; claimantUid?: string };
    if (!matchId || !claimantUid) {
      return res.status(400).json({ ok: false, error: "matchId and claimantUid are required" });
    }

    await runTransaction(db, async (tx) => {
      const mRef = doc(db, "matches", matchId);
      const mSnap = await tx.get(mRef);
      if (!mSnap.exists()) throw new Error("Match not found");

      const match = mSnap.data() as any;

      // Basic guards
      const { creatorUid, opponentUid, completed, winnerUid, scheduledAt, creatorReported, opponentReported } = match;

      // Must be a participant
      if (claimantUid !== creatorUid && claimantUid !== opponentUid) {
        throw new Error("Not a participant");
      }

      // Already finished?
      if (completed || winnerUid) {
        throw new Error("Match already completed");
      }

      // Opponent already reported a result?
      const opponentUidOfClaimer = claimantUid === creatorUid ? opponentUid : creatorUid;
      if (opponentReported?.[opponentUidOfClaimer]) {
        throw new Error("Opponent has already reported");
      }

      // Time check (server-side)
      const schedMs =
        scheduledAt instanceof Date
          ? scheduledAt.getTime()
          : typeof scheduledAt === "number"
          ? scheduledAt
          : scheduledAt?.toMillis
          ? scheduledAt.toMillis()
          : scheduledAt
          ? new Date(scheduledAt).getTime()
          : NaN;

      if (!Number.isFinite(schedMs)) throw new Error("Match missing scheduledAt");
      const now = Date.now();
      if (now - schedMs < GRACE_MS) {
        throw new Error("Too early to claim");
      }

      // Award win to claimant
      tx.update(mRef, {
        completed: true,
        winnerUid: claimantUid,
        noShowClaimedBy: claimantUid,
        noShowClaimedAt: serverTimestamp(),
        status: "completed_no_show",
      });
    });

    return res.status(200).json({ ok: true });
  } catch (e: any) {
    return res.status(400).json({ ok: false, error: e?.message || "error" });
  }
}
