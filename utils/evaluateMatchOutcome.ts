import { db } from '../lib/firebase';
import { doc, getDoc, updateDoc, increment } from 'firebase/firestore';
import { updateUserDivisionAndElo } from '../utils/eloDivision'; // <-- new import

export async function evaluateMatchOutcome(matchId: string) {
  const matchRef = doc(db, 'matches', matchId);
  const snap = await getDoc(matchRef);
  const data = snap.data();

  if (!data || !data.winnerSubmitted) return;

  const { creator, joiner } = data.winnerSubmitted;

  if (!creator || !joiner || creator === 'null' || joiner === 'null') return;

  // If both agree on "tie", send to admin for review (or handle as you wish)
  if (creator === joiner && creator === 'tie') {
    await updateDoc(matchRef, {
      status: 'disputed',
      winner: 'tie',
      completedAt: new Date(),
    });
    console.log(`⚠️ Both called tie, admin review needed.`);
    return;
  }

  // If both agree on winner
  if (creator === joiner) {
    const winnerKey = creator; // "creator" or "joiner"
    const loserKey = winnerKey === 'creator' ? 'joiner' : 'creator';

    const winnerUserId = data[`${winnerKey}UserId`];
    const loserUserId = data[`${loserKey}UserId`];
    const payout = data.entryFee * 2;

    // Update winner's balance
    if (winnerUserId) {
      const userRef = doc(db, 'users', winnerUserId);
      await updateDoc(userRef, {
        balance: increment(payout),
      });
    }

    // 🔥 ELO & Division update for both players!
    if (winnerUserId) {
      await updateUserDivisionAndElo(winnerUserId, true); // winner gets +25
    }
    if (loserUserId) {
      await updateUserDivisionAndElo(loserUserId, false); // loser gets -20
    }

    // Mark match as completed
    await updateDoc(matchRef, {
      status: 'completed',
      winner: winnerKey,
      winnerUserId: winnerUserId,
      completedAt: new Date(),
    });
    console.log(`✅ Winner agreed: ${winnerKey} (${winnerUserId}) gets ${payout} TC`);
  } else {
    // Disagreement = dispute
    await updateDoc(matchRef, {
      status: 'disputed',
    });
    console.log(`⚠️ Match disputed between users.`);
  }
}




