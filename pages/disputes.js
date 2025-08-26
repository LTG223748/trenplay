import { useEffect, useState } from 'react';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function AdminDisputes() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDisputedMatches = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'matches'));
        const disputed = snapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter(match => match.status === 'disputed');
        setMatches(disputed);
      } catch (err) {
        console.error('Failed to fetch disputed matches:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDisputedMatches();
  }, []);

  const resolveDispute = async (matchId, winner) => {
    const matchRef = doc(db, 'matches', matchId);
    const match = matches.find(m => m.id === matchId);

    if (!match) return;

    const winnerId =
      winner === 'creator' ? match.creatorUserId : match.joinerUserId;
    const amount = match.entryFee * 2;

    try {
      // Update match status and winner
      await updateDoc(matchRef, {
        status: 'resolved',
        adminResolvedWinner: winnerId,
      });

      // Update user balance manually in Firestore (match payout already triggered by function)
      const userRef = doc(db, 'users', winnerId);
      await updateDoc(userRef, {
        trenCoins: amount + (match.trenCoinsBefore || 0), // Optional: store balance snapshots
      });

      alert(`Match ${matchId} resolved. ${winner} wins.`);
      setMatches(matches.filter((m) => m.id !== matchId));
    } catch (err) {
      console.error('Error resolving match:', err);
      alert('Failed to resolve match');
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <h1 className="text-3xl font-bold mb-6 text-yellow-400">
        ⚖️ Admin Dispute Panel
      </h1>

      {loading ? (
        <p>Loading disputed matches...</p>
      ) : matches.length === 0 ? (
        <p>No disputed matches found.</p>
      ) : (
        matches.map((match) => (
          <div
            key={match.id}
            className="bg-gray-800 p-6 rounded-lg shadow mb-6 border border-gray-600"
          >
            <h2 className="text-xl font-semibold text-white mb-2">
              Game: {match.game} — Wager: ${match.entryFee}
            </h2>
            <p><strong>Match ID:</strong> {match.id}</p>
            <p><strong>Creator:</strong> {match.creatorUserId}</p>
            <p><strong>Joiner:</strong> {match.joinerUserId}</p>
            <p><strong>Creator Result:</strong> {match.winnerSubmitted?.creator}</p>
            <p><strong>Joiner Result:</strong> {match.winnerSubmitted?.joiner}</p>

            <div className="mt-4 space-x-4">
              <button
                onClick={() => resolveDispute(match.id, 'creator')}
                className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded"
              >
                Award Creator 🏆
              </button>
              <button
                onClick={() => resolveDispute(match.id, 'joiner')}
                className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded"
              >
                Award Joiner 🏆
              </button>
              <button
                onClick={() => resolveDispute(match.id, 'none')}
                className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded"
              >
                Void Match ❌
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}