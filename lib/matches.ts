// lib/matches.ts
import { db } from "../lib/firebase";
import { doc, runTransaction, serverTimestamp } from "firebase/firestore";

type Outcome = "win" | "loss" | "draw" | "backed_out";

export async function maybeArchiveMatch(matchId: string) {
  const mref = doc(db, "matches", matchId);
  await runTransaction(db, async (tx) => {
    const snap = await tx.get(mref);
    if (!snap.exists()) return;
    const m = snap.data() as any;

    // expected: reports.creator.outcome, reports.joiner.outcome
    const c: Outcome | undefined = m?.reports?.creator?.outcome;
    const j: Outcome | undefined = m?.reports?.joiner?.outcome;

    if (!c || !j) return; // only act when BOTH reported

    // Both backed out => cancelled
    if (c === "backed_out" && j === "backed_out") {
      tx.update(mref, {
        status: "cancelled",
        active: false,
        archivedAt: serverTimestamp(),
      });
      return;
    }

    // Consistent results => completed
    const consistentWinLoss =
      (c === "win" && j === "loss") || (c === "loss" && j === "win");
    const bothDraw = c === "draw" && j === "draw";

    if (consistentWinLoss || bothDraw) {
      tx.update(mref, {
        status: "completed",
        active: false,
        archivedAt: serverTimestamp(),
      });
      return;
    }

    // One says backed_out, the other claims win => treat as completed
    const oneBackedOtherWin =
      (c === "backed_out" && j === "win") || (j === "backed_out" && c === "win");
    if (oneBackedOtherWin) {
      tx.update(mref, {
        status: "completed",
        active: false,
        archivedAt: serverTimestamp(),
      });
      return;
    }

    // Anything else is a conflict -> disputed (keep active false if you don’t want it shown to users)
    tx.update(mref, {
      status: "disputed",
      active: false, // set true if you want it to stay in users’ list until admin resolves
      disputedAt: serverTimestamp(),
    });
  });
}
