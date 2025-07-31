// pages/admin-review.js
import { useEffect, useState } from 'react';
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  getDoc,
  setDoc,
  increment,
} from 'firebase/firestore';
import { db } from '../lib/firebase';

export default function AdminReview() {
  const [matches, setMatches] = useState([]);

  useEffect(() => {
    const loadPendingMatches = async () => {
      const snap = await getDocs(collection(db, 'matches'));
      const pending = snap.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter((match) => match.status === 'pending');
      setMatches(pending);
    };

    loadPendingMatches();
  }, []);

  const handleDecision = async (match, decision, winnerId = null) => {
    const matchRef = doc(db, 'matches', match.id);

    const updateData = {
      status: decision,
    };

    if (decision === 'approved' && winnerId) {
      updateData.winnerId = winnerId;

      // Add TC to winner
      const winnerRef = doc(db, 'users', winnerId);
      await updateDoc(winnerRef, {
        tc: increment(match.stake * 2),
      });

      // Log transaction to winner
      await setDoc(doc(collection(winnerRef, 'transactions')), {
        type: 'win',
        amount: match.stake * 2,
        matchId: match.id,
        timestamp: Date.now(),
      });
    }

    if (decision === 'rejected') {
      // Refund both players
      const creatorRef = doc(db, 'users', match.creatorId);
      const opponentRef = doc(db, 'users', match.opponentId);

      await Promise.all([
        updateDoc(creatorRef, { tc: increment(match.stake) }),
        updateDoc(opponentRef, { tc: increment(match.stake) }),

        setDoc(doc(collection(creatorRef, 'transactions')), {
          type: 'refund',
          amount: match.stake,
          matchId: match.id,
          timestamp: Date.now(),
        }),

        setDoc(doc(collection(opponentRef, 'transactions')), {
          type: 'refund',
          amount: match.stake,
          matchId: match.id,
          timestamp: Date.now(),
        }),
      ]);
    }

    await updateDoc(matchRef, updateData);

    // Remove from review list
    setMatches((prev) => prev.filter((m) => m.id !== match.id));
  };

  return (
    <div className="p-6 text-white bg-[#1a0030] min-h-screen">
      <h1 className="text-2xl font-bold mb-6">🧑‍⚖️ Admin Review Panel</h1>

      {matches.map((match) => (
        <div key={match.id} className="bg-[#2d0140] p-4 rounded-lg mb-4 shadow-md">
          <p><b>Match ID:</b> {match.id}</p>
          <p><b>Creator:</b> {match.creatorId}</p>
          <p><b>Opponent:</b> {match.opponentId}</p>
          <p><b>Stake:</b> {match.stake} TC</p>

          <div className="flex gap-4 mt-2">
            {match.proofA?.url && (
              <a href={match.proofA.url} target="_blank" rel="noopener noreferrer">
                <img src={match.proofA.url} alt="Proof A" className="w-32 rounded border" />
              </a>
            )}
            {match.proofB?.url && (
              <a href={match.proofB.url} target="_blank" rel="noopener noreferrer">
                <img src={match.proofB.url} alt="Proof B" className="w-32 rounded border" />
              </a>
            )}
          </div>

          <div className="mt-4 flex flex-wrap gap-4">
            <button
              onClick={() => handleDecision(match, 'approved', match.creatorId)}
              className="bg-green-500 px-4 py-2 rounded hover:bg-green-600"
            >
              ✅ Approve (Creator Wins)
            </button>
            <button
              onClick={() => handleDecision(match, 'approved', match.opponentId)}
              className="bg-blue-500 px-4 py-2 rounded hover:bg-blue-600"
            >
              ✅ Approve (Opponent Wins)
            </button>
            <button
              onClick={() => handleDecision(match, 'rejected')}
              className="bg-red-500 px-4 py-2 rounded hover:bg-red-600"
            >
              ❌ Reject & Refund Both
            </button>
          </div>
        </div>
      ))}

      {matches.length === 0 && (
        <p className="text-gray-400 mt-10">No pending matches to review.</p>
      )}
    </div>
  );
}
