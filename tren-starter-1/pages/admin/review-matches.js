// pages/admin/review-matches.js or disputes.js
import { useEffect, useState } from 'react';
import { db } from '../../lib/firebase';
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc
} from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../../lib/firebase';
import { useRouter } from 'next/router';

const ADMIN_UIDS = ['your_admin_uid_here']; // update to your admin UID(s)!

// -- Payout Animation --
function PayoutAnimation({ show, winner, amount }) {
  if (!show) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80">
      <div className="bg-gradient-to-br from-yellow-400 to-purple-700 rounded-2xl p-12 shadow-xl flex flex-col items-center animate-bounce-in">
        <span className="text-6xl mb-4">💸</span>
        <h2 className="text-3xl font-bold mb-2 text-white">Payout Sent!</h2>
        <p className="text-yellow-200 mb-2 text-lg">Winner: <b>{winner}</b></p>
        <p className="text-purple-200 mb-4 text-xl font-bold">{amount} TC</p>
      </div>
    </div>
  );
}

export default function AdminDisputes() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user] = useAuthState(auth);
  const [payout, setPayout] = useState({ show: false, winner: '', amount: 0 });
  const router = useRouter();

  useEffect(() => {
    if (!user) return;
    if (!ADMIN_UIDS.includes(user.uid)) {
      router.push('/');
      return;
    }

    const fetchDisputedMatches = async () => {
      // Show any match where dispute: true OR status: "disputed"
      const q = query(
        collection(db, 'matches'),
        where('dispute', '==', true)
        // Optionally add another where for status: 'disputed' if needed
      );
      const snap = await getDocs(q);
      const list = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMatches(list);
      setLoading(false);
    };

    fetchDisputedMatches();
  }, [user, router]);

  const handleAward = async (match, winnerUid, winnerGamertag) => {
    setPayout({ show: true, winner: winnerGamertag, amount: match.entryFee });
    setTimeout(async () => {
      await updateDoc(doc(db, 'matches', match.id), {
        adminReviewed: true,
        winner: winnerUid,
        status: 'completed',
        dispute: false
      });
      setMatches(prev => prev.filter(m => m.id !== match.id));
      setPayout({ show: false, winner: '', amount: 0 });
      // Your payout cloud function will detect this and send coins
    }, 1800);
  };

  const handleRefund = async (matchId) => {
    setPayout({ show: true, winner: "Tie / Refund", amount: 0 });
    setTimeout(async () => {
      await updateDoc(doc(db, 'matches', matchId), {
        adminReviewed: true,
        winner: "refund",
        status: 'refunded',
        dispute: false
      });
      setMatches(prev => prev.filter(m => m.id !== matchId));
      setPayout({ show: false, winner: '', amount: 0 });
    }, 1800);
  };

  if (!user) return <p className="text-white p-6">Loading...</p>;
  if (loading) return <p className="text-white p-6">Fetching disputed matches...</p>;

  return (
    <div className="p-6 text-white min-h-screen bg-[#161324]">
      <h1 className="text-2xl font-bold text-yellow-400 mb-6">🧾 Disputed Matches</h1>
      <PayoutAnimation show={payout.show} winner={payout.winner} amount={payout.amount} />

      {matches.length === 0 ? (
        <p className="text-green-400">No disputed matches right now! 🎉</p>
      ) : (
        <div className="space-y-10">
          {matches.map(match => (
            <div key={match.id} className="bg-[#1a0030] p-5 rounded-lg shadow-lg">
              <div className="mb-3 flex flex-wrap justify-between gap-2">
                <span className="font-bold text-lg text-yellow-300">{match.game}</span>
                <span className="text-gray-400">Platform: {match.platform}</span>
                <span className="text-pink-300 font-bold">Entry: {match.entryFee} TC</span>
                <span className="text-purple-400">Match ID: {match.id}</span>
              </div>
              <div className="grid grid-cols-2 gap-8">
                {/* Creator */}
                <div className="p-3 border border-yellow-500 rounded-lg">
                  <div className="text-lg font-bold text-yellow-200 mb-1">Player 1 (Creator):</div>
                  <div>Gamertag: <span className="font-semibold">{match.creatorGamertag || '-'}</span></div>
                  <div>Team: <span className="italic">{match.creatorTeam || '-'}</span></div>
                  <div>Score: <span className="font-bold">{match.creatorScore ?? '-'}</span></div>
                  <div className="my-2">
                    <div className="text-xs text-yellow-400 mb-1">Proof:</div>
                    {match.creatorProofUrl ? (
                      <img src={match.creatorProofUrl} alt="Creator Proof" className="rounded w-full max-w-xs" />
                    ) : <span className="text-gray-500">No image</span>}
                  </div>
                  <button
                    className="bg-green-700 px-4 py-2 mt-2 rounded font-bold hover:bg-green-600"
                    onClick={() => handleAward(match, match.creatorUserId, match.creatorGamertag)}
                  >
                    ✅ Award Win to {match.creatorGamertag || 'Creator'}
                  </button>
                </div>
                {/* Joiner */}
                <div className="p-3 border border-pink-500 rounded-lg">
                  <div className="text-lg font-bold text-pink-200 mb-1">Player 2 (Joiner):</div>
                  <div>Gamertag: <span className="font-semibold">{match.joinerGamertag || '-'}</span></div>
                  <div>Team: <span className="italic">{match.joinerTeam || '-'}</span></div>
                  <div>Score: <span className="font-bold">{match.joinerScore ?? '-'}</span></div>
                  <div className="my-2">
                    <div className="text-xs text-pink-400 mb-1">Proof:</div>
                    {match.joinerProofUrl ? (
                      <img src={match.joinerProofUrl} alt="Joiner Proof" className="rounded w-full max-w-xs" />
                    ) : <span className="text-gray-500">No image</span>}
                  </div>
                  <button
                    className="bg-purple-700 px-4 py-2 mt-2 rounded font-bold hover:bg-purple-600"
                    onClick={() => handleAward(match, match.joinerUserId, match.joinerGamertag)}
                  >
                    ✅ Award Win to {match.joinerGamertag || 'Joiner'}
                  </button>
                </div>
              </div>
              <div className="flex gap-4 mt-5">
                <button
                  className="bg-yellow-500 text-black font-bold px-4 py-2 rounded hover:bg-yellow-400"
                  onClick={() => handleRefund(match.id)}
                >
                  🟡 Tie / Refund Both
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

