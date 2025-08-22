import React, { useState } from 'react';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { evaluateMatchOutcome } from '../utils/evaluateMatchOutcome';
import notify from '../lib/notify'; // Make sure this path is correct!

interface Props {
  matchId: string;
  userRole: 'creator' | 'joiner';
}

export default function MatchResultForm({ matchId, userRole }: Props) {
  const [submitted, setSubmitted] = useState(false);
  const [selectedWinner, setSelectedWinner] = useState<'creator' | 'joiner' | 'tie' | ''>('');

  const handleSubmit = async () => {
    if (!selectedWinner) {
      notify('Please select who won the match.', 'error');
      return;
    }

    try {
      const matchRef = doc(db, 'matches', matchId);
      const snap = await getDoc(matchRef);
      const existing = snap.data();

      // Update the winnerSubmitted field
      const updatedWinnerSubmitted = {
        ...existing?.winnerSubmitted,
        [userRole]: selectedWinner,
      };

      await updateDoc(matchRef, {
        winnerSubmitted: updatedWinnerSubmitted,
        status: 'awaiting-results',
      });

      // Evaluate outcome automatically
      await evaluateMatchOutcome(matchId);

      setSubmitted(true);
      notify('✅ Match result submitted! Waiting for admin or system to confirm winner.', 'success');
    } catch (err: any) {
      notify('❌ Failed to submit result: ' + (err?.message || 'Unknown error'), 'error');
    }
  };

  return (
    <div className="bg-[#1c1c2e] p-4 rounded-lg text-white">
      {submitted ? (
        <p className="text-green-400 font-bold">✅ Match result submitted!</p>
      ) : (
        <>
          <label className="block mb-2 font-semibold">Who won the match?</label>
          <select
            value={selectedWinner}
            onChange={(e) => setSelectedWinner(e.target.value as any)}
            className="w-full p-2 rounded bg-[#2c2c4f] text-white mb-4"
          >
            <option value="">-- Select Winner --</option>
            <option value="creator">Creator</option>
            <option value="joiner">Joiner</option>
            <option value="tie">Tie</option>
          </select>

          <button
            onClick={handleSubmit}
            className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded font-bold"
          >
            Submit Result
          </button>
        </>
      )}
    </div>
  );
}




