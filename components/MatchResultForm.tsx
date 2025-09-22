'use client';

import React, { useState } from 'react';
import { doc, runTransaction, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { evaluateMatchOutcome } from '../utils/evaluateMatchOutcome';
import notify from '../lib/notify';

type Role = 'creator' | 'joiner';
type Outcome = 'win' | 'loss' | 'draw' | 'backed_out';

interface Props {
  matchId: string;
  userRole: Role;
}

export default function MatchResultForm({ matchId, userRole }: Props) {
  const [submitted, setSubmitted] = useState(false);
  const [outcome, setOutcome] = useState<Outcome | ''>('');
  const [sending, setSending] = useState(false);

  const handleSubmit = async () => {
    if (!outcome) {
      notify('Please select your result.', 'error');
      return;
    }

    try {
      setSending(true);

      const mref = doc(db, 'matches', matchId);

      // Write this player's report atomically (avoids race if both submit together)
      await runTransaction(db, async (tx) => {
        const snap = await tx.get(mref);
        if (!snap.exists()) throw new Error('Match not found');

        const pathBase = `reports.${userRole}`;
        tx.update(mref, {
          [`${pathBase}.outcome`]: outcome,
          [`${pathBase}.submittedAt`]: serverTimestamp(),
          // While waiting on the other player, keep it active but mark awaiting
          status: 'awaiting-results',
        } as any);
      });

      // Try to finalize if both sides have reported
      await evaluateMatchOutcome(matchId);

      setSubmitted(true);
      notify('✅ Result submitted! Waiting for the other player / system to finalize.', 'success');
    } catch (err: any) {
      notify('❌ Failed to submit result: ' + (err?.message || 'Unknown error'), 'error');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="bg-[#1c1c2e] p-4 rounded-lg text-white">
      {submitted ? (
        <p className="text-green-400 font-bold">✅ Result submitted! You can close this.</p>
      ) : (
        <>
          <label className="block mb-2 font-semibold">My result</label>
          <select
            value={outcome}
            onChange={(e) => setOutcome(e.target.value as Outcome)}
            className="w-full p-2 rounded bg-[#2c2c4f] text-white mb-4"
          >
            <option value="">-- Select --</option>
            <option value="win">I won</option>
            <option value="loss">I lost</option>
            <option value="draw">Tie</option>
            <option value="backed_out">I backed out</option>
          </select>

          <button
            onClick={handleSubmit}
            disabled={!outcome || sending}
            className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 px-4 py-2 rounded font-bold"
          >
            {sending ? 'Submitting...' : 'Submit Result'}
          </button>
        </>
      )}
    </div>
  );
}
