import { db } from '../lib/firebase';
import {
  doc,
  runTransaction,
  serverTimestamp,
  increment,
} from 'firebase/firestore';
import { updateUserDivisionAndElo } from '../utils/eloDivision';

type WinnerVote = 'creator' | 'joiner' | 'tie' | 'backed_out' | 'null' | undefined;

export async function evaluateMatchOutcome(matchId: string) {
  const matchRef = doc(db, 'matches', matchId);

  // Do it atomically so simultaneous submissions don't fight
  const meta = await runTransaction(db, async (tx) => {
    const snap = await tx.get(matchRef);
    if (!snap.exists()) return null;

    const data = snap.data() as any;
    const ws = (data?.winnerSubmitted ?? {}) as { creator?: WinnerVote; joiner?: WinnerVote };
    const creator = ws.creator;
    const joiner = ws.joiner;

    // If either side hasn't submitted yet, keep waiting
    if (!creator || !joiner || creator === 'null' || joiner === 'null') {
      if ((data.status ?? '') !== 'awaiting-results') {
        tx.update(matchRef, { status: 'awaiting-results' });
      }
      return null;
    }

    // Already in a terminal state / archived
    const statusLower = String(data.status || '').toLowerCase();
    if (data.active === false || ['completed', 'cancelled', 'expired', 'disputed'].includes(statusLower)) {
      return null;
    }

    // Decide outcome
    let newStatus: 'completed' | 'cancelled' | 'disputed' = 'disputed';
    let winnerKey: 'creator' | 'joiner' | null = null;
    let result: 'draw' | null = null;

    const bothBacked = creator === 'backed_out' && joiner === 'backed_out';
    const bothTie = creator === 'tie' && joiner === 'tie';
    const bothSayCreator = creator === 'creator' && joiner === 'creator';
    const bothSayJoiner  = creator === 'joiner'  && joiner === 'joiner';

    if (bothBacked) {
      newStatus = 'cancelled';
    } else if (bothTie) {
      // Your preference earlier was admin review for ties; still archive so cards disappear
      newStatus = 'disputed';
      result = 'draw';
    } else if (bothSayCreator || bothSayJoiner) {
      newStatus = 'completed';
      winnerKey = bothSayCreator ? 'creator' : 'joiner';
    } else {
      // Any disagreement (e.g., creator vs joiner, tie vs winner) → disputed
      newStatus = 'disputed';
    }

    // Prepare match updates (always archive from user grid)
    const updates: any = {
      status: newStatus,
      active: false,                        // <-- hides from MatchGrid immediately
      archivedAt: serverTimestamp(),
    };
    if (result) updates.result = result;

    let winnerUserId: string | null = null;
    let loserUserId: string | null = null;

    if (winnerKey) {
      const loserKey = winnerKey === 'creator' ? 'joiner' : 'creator';
      winnerUserId = data[`${winnerKey}UserId`] || null;
      loserUserId  = data[`${loserKey}UserId`]  || null;

      updates.winner = winnerKey;
      updates.winnerUserId = winnerUserId;
      updates.completedAt = serverTimestamp();

      // Payout winner from escrow pool (entryFee * 2)
      const payout = Number(data.entryFee) * 2 || 0;
      if (winnerUserId && payout > 0) {
        const userRef = doc(db, 'users', winnerUserId);
        tx.update(userRef, { balance: increment(payout) });
      }
    }

    tx.update(matchRef, updates);

    // Return info for post-transaction ELO updates
    return { newStatus, winnerUserId, loserUserId };
  });

  // Update ELO/division after the transaction to avoid nested writes in tx
  if (meta && meta.newStatus === 'completed') {
    if (meta.winnerUserId) await updateUserDivisionAndElo(meta.winnerUserId, true);
    if (meta.loserUserId)  await updateUserDivisionAndElo(meta.loserUserId, false);
  }
}
