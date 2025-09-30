'use client';

import React, { useEffect, useState } from 'react';
import {
  doc,
  runTransaction,
  serverTimestamp,
  updateDoc,
  onSnapshot,
  addDoc,
  collection,
  getDoc,
} from 'firebase/firestore';
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

  // ✅ Rematch state
  const [rematchRequests, setRematchRequests] = useState<{
    creator: boolean;
    joiner: boolean;
    creatorRequestedAt?: number;
    joinerRequestedAt?: number;
  }>({
    creator: false,
    joiner: false,
  });
  const [creatingRematch, setCreatingRematch] = useState(false);

  // 🔔 Listen for rematchRequests in real time
  useEffect(() => {
    const mref = doc(db, 'matches', matchId);
    const unsub = onSnapshot(mref, (snap) => {
      if (snap.exists()) {
        const data = snap.data() as any;
        setRematchRequests(data.rematchRequests || { creator: false, joiner: false });
      }
    });
    return () => unsub();
  }, [matchId]);

  const handleSubmit = async () => {
    if (!outcome) {
      notify('Please select your result.', 'error');
      return;
    }

    try {
      setSending(true);

      const mref = doc(db, 'matches', matchId);

      // Write this player's report atomically
      await runTransaction(db, async (tx) => {
        const snap = await tx.get(mref);
        if (!snap.exists()) throw new Error('Match not found');

        const pathBase = `reports.${userRole}`;
        tx.update(mref, {
          [`${pathBase}.outcome`]: outcome,
          [`${pathBase}.submittedAt`]: serverTimestamp(),
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

  // ✅ Handle pressing Rematch
  const handleRematch = async () => {
    try {
      const mref = doc(db, 'matches', matchId);
      await updateDoc(mref, {
        [`rematchRequests.${userRole}`]: true,
        [`rematchRequests.${userRole}RequestedAt`]: Date.now(),
      });
    } catch (err) {
      console.error('Rematch error:', err);
      notify('❌ Failed to request rematch', 'error');
    }
  };

  // ✅ Timeout reset logic (2 minutes = 120000ms)
  useEffect(() => {
    const now = Date.now();
    const opponentRole: Role = userRole === 'creator' ? 'joiner' : 'creator';
    const opponentRequestedAt = rematchRequests[`${opponentRole}RequestedAt` as keyof typeof rematchRequests] as number | undefined;

    if (
      rematchRequests[opponentRole] &&
      opponentRequestedAt &&
      now - opponentRequestedAt > 120000 // 2 minutes
    ) {
      // Reset opponent’s stale request
      const mref = doc(db, 'matches', matchId);
      updateDoc(mref, {
        [`rematchRequests.${opponentRole}`]: false,
        [`rematchRequests.${opponentRole}RequestedAt`]: null,
      }).catch((err) => console.error('Failed to reset rematch request:', err));
    }
  }, [rematchRequests, matchId, userRole]);

  // ✅ Auto-create new match if both players pressed
  useEffect(() => {
    const bothAgreed = rematchRequests.creator && rematchRequests.joiner;
    if (!bothAgreed || creatingRematch) return;

    const createRematch = async () => {
      try {
        setCreatingRematch(true);

        const oldRef = doc(db, 'matches', matchId);
        const oldSnap = await getDoc(oldRef);
        if (!oldSnap.exists()) return;

        const oldData = oldSnap.data() as any;

        // Clone important fields into new match
        const newMatchRef = await addDoc(collection(db, 'matches'), {
          creatorUserId: oldData.creatorUserId,
          creatorGamertag: oldData.creatorGamertag,
          creatorWallet: oldData.creatorWallet,
          joinerUserId: oldData.joinerUserId,
          joinerGamertag: oldData.joinerGamertag,
          joinerWallet: oldData.joinerWallet,
          game: oldData.game,
          platform: oldData.platform,
          entryFee: oldData.entryFee,
          division: oldData.division,
          status: 'open',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });

        notify('🔄 Rematch created!', 'success');
        window.location.href = `/matches/${newMatchRef.id}`;
      } catch (err) {
        console.error('Rematch creation error:', err);
        notify('❌ Failed to create rematch', 'error');
      } finally {
        setCreatingRematch(false);
      }
    };

    createRematch();
  }, [rematchRequests, creatingRematch, matchId]);

  // ✅ Render Rematch button with states
  const renderRematchButton = () => {
    const youPressed = rematchRequests[userRole];
    const opponentRole: Role = userRole === 'creator' ? 'joiner' : 'creator';
    const opponentPressed = rematchRequests[opponentRole];

    if (youPressed && opponentPressed) {
      return (
        <button
          disabled
          className="bg-green-600 text-white px-4 py-2 rounded font-bold opacity-75"
        >
          Creating rematch...
        </button>
      );
    }

    if (youPressed && !opponentPressed) {
      return (
        <button
          disabled
          className="bg-yellow-400 text-black px-4 py-2 rounded font-bold opacity-75"
        >
          Waiting for opponent...
        </button>
      );
    }

    if (!youPressed && opponentPressed) {
      return (
        <button
          onClick={handleRematch}
          className="bg-purple-600 hover:bg-purple-500 px-4 py-2 rounded font-bold"
        >
          Opponent wants a rematch! Accept?
        </button>
      );
    }

    return (
      <button
        onClick={handleRematch}
        className="bg-yellow-400 hover:bg-yellow-300 text-black px-4 py-2 rounded font-bold"
      >
        Rematch 🔄
      </button>
    );
  };

  return (
    <div className="bg-[#1c1c2e] p-4 rounded-lg text-white">
      {submitted ? (
        <div>
          <p className="text-green-400 font-bold mb-4">
            ✅ Result submitted! You can close this.
          </p>
          {/* Rematch section */}
          <div className="mt-4">{renderRematchButton()}</div>
        </div>
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


