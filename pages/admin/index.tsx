import { useEffect, useState } from 'react';
import { db } from '../../lib/firebase';
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  increment,
} from 'firebase/firestore';
import useAdminCheck from '../../hooks/useAdminCheck';
import UserDivisionManager from '../../components/admin/UserDivisionManager';
import { updateUserDivisionAndElo } from '../../utils/eloDivision'; // <-- NEW IMPORT

interface Match {
  id: string;
  game: string;
  platform: string;
  entryFee: number;
  status: string;
  creatorUserId: string;
  joinerUserId?: string;
}

export default function AdminPanel() {
  const { isAdmin, loading: adminLoading } = useAdminCheck();
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [resolving, setResolving] = useState<string | null>(null);

  useEffect(() => {
    if (!isAdmin) return;
    const fetchMatches = async () => {
      const snapshot = await getDocs(collection(db, 'matches'));
      const all = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Match[];

      const unresolved = all.filter(
        match =>
          match.status !== 'completed' &&
          match.status !== 'canceled' &&
          match.creatorUserId &&
          match.joinerUserId
      );

      setMatches(unresolved);
      setLoading(false);
    };

    fetchMatches();
  }, [isAdmin]);

  // Winner payout & ELO/DIVISION UPDATE
  const resolveMatch = async (match: Match, winner: 'creator' | 'joiner') => {
    if (resolving) return;
    setResolving(match.id);

    try {
      const winnerId =
        winner === 'creator' ? match.creatorUserId : match.joinerUserId;
      const loserId =
        winner === 'creator' ? match.joinerUserId : match.creatorUserId;

      const userRef = doc(db, 'users', winnerId);
      const payout = match.entryFee * 2;

      // Pay winner
      await updateDoc(userRef, {
        balance: increment(payout),
      });

      // 🔥 ELO/DIVISION update:
      if (winnerId) await updateUserDivisionAndElo(winnerId, true); // Winner gets +25 ELO
      if (loserId) await updateUserDivisionAndElo(loserId, false);   // Loser gets -20 ELO

      // Mark match as completed
      const matchRef = doc(db, 'matches', match.id);
      await updateDoc(matchRef, {
        status: 'completed',
        winnerUserId: winnerId,
        winner: winner,
      });

      alert(`✅ Match ${match.id} resolved: ${winner} wins ${payout} TC`);

      setMatches(prev => prev.filter(m => m.id !== match.id));
    } catch (err) {
      console.error(err);
      alert('❌ Error resolving match');
    }

    setResolving(null);
  };

  // Tie refund payout
  const refundTie = async (match: Match) => {
    if (resolving) return;
    setResolving(match.id);

    try {
      // Refund both players their entryFee
      const creatorRef = doc(db, 'users', match.creatorUserId);
      const joinerRef = doc(db, 'users', match.joinerUserId!);

      await updateDoc(creatorRef, {
        balance: increment(match.entryFee),
      });
      await updateDoc(joinerRef, {
        balance: increment(match.entryFee),
      });

      // Mark match as completed (tie)
      const matchRef = doc(db, 'matches', match.id);
      await updateDoc(matchRef, {
        status: 'completed',
        winner: 'tie',
        winnerUserId: null,
      });

      alert(`🤝 Match ${match.id} resolved as a tie — both refunded ${match.entryFee} TC`);

      setMatches(prev => prev.filter(m => m.id !== match.id));
    } catch (err) {
      console.error(err);
      alert('❌ Error refunding for tie');
    }

    setResolving(null);
  };

  if (adminLoading || loading) return <div className="text-white p-6">Loading...</div>;
  if (!isAdmin) return <div className="text-red-400 p-6">Not authorized</div>;

  return (
    <div className="min-h-screen bg-[#0c0c1f] text-white p-8">
      {/* User Division Manager */}
      <UserDivisionManager />

      {/* Match Resolver */}
      <h1 className="text-3xl font-bold mb-6 text-yellow-400">🎮 Admin Match Resolver</h1>

      {matches.length === 0 ? (
        <p>No unresolved matches found.</p>
      ) : (
        <div className="grid gap-6">
          {matches.map(match => (
            <div
              key={match.id}
              className="bg-[#1c1c2e] p-6 rounded-lg shadow-lg border border-gray-700"
            >
              <h2 className="text-xl font-bold text-yellow-300">{match.game}</h2>
              <p><strong>Platform:</strong> {match.platform}</p>
              <p><strong>Entry Fee:</strong> {match.entryFee} TC</p>
              <p><strong>Status:</strong> {match.status}</p>
              <p><strong>Match ID:</strong> {match.id}</p>
              <p><strong>Player 1:</strong> {match.creatorUserId}</p>
              <p><strong>Player 2:</strong> {match.joinerUserId}</p>

              <div className="flex gap-4 mt-4">
                <button
                  onClick={() => resolveMatch(match, 'creator')}
                  disabled={resolving === match.id}
                  className="bg-green-600 hover:bg-green-500 px-4 py-2 rounded font-bold"
                >
                  ✅ Player 1 Wins
                </button>
                <button
                  onClick={() => resolveMatch(match, 'joiner')}
                  disabled={resolving === match.id}
                  className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded font-bold"
                >
                  ✅ Player 2 Wins
                </button>
                <button
                  onClick={() => refundTie(match)}
                  disabled={resolving === match.id}
                  className="bg-yellow-600 hover:bg-yellow-500 px-4 py-2 rounded font-bold"
                >
                  🤝 Tie / Refund Both
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}




