// components/ReportMatchResult.js
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useState } from 'react';

export default function ReportMatchResult({ tournamentId, roundIndex, matchIndex, match }) {
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (winnerId) => {
    if (submitting) return;
    setSubmitting(true);

    const ref = doc(db, 'tournaments', tournamentId);
    const snap = await getDoc(ref);
    const data = snap.data();
    const rounds = [...data.rounds];

    // Update winner
    rounds[roundIndex][matchIndex].winner = winnerId;

    // Move winner to next round
    if (!rounds[roundIndex + 1]) rounds[roundIndex + 1] = [];
    const lastMatch = rounds[roundIndex + 1].at(-1);
    if (lastMatch && !lastMatch.player2) {
      lastMatch.player2 = winnerId;
    } else {
      rounds[roundIndex + 1].push({ player1: winnerId, player2: null, winner: null });
    }

    await updateDoc(ref, { rounds });
    setSubmitting(false);
  };

  return (
    <div className="flex gap-2 mt-2">
      {[match.player1, match.player2].map((p, idx) =>
        p ? (
          <button
            key={p}
            className="px-2 py-1 bg-yellow-400 text-black rounded text-xs hover:bg-yellow-300"
            onClick={() => handleSubmit(p)}
            disabled={submitting || match.winner}
          >
            {`Set Winner: Player ${idx + 1}`}
          </button>
        ) : null
      )}
    </div>
  );
}