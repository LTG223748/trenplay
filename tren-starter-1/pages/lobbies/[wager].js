import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import {
  collection,
  getDocs,
  query,
  where,
  doc,
  updateDoc,
  getDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db, auth } from '../../lib/firebase';

export default function Lobby() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();
  const { wager } = router.query;

  useEffect(() => {
    if (!auth.currentUser || !wager) return;

    const loadMatches = async () => {
      setLoading(true);
      const user = auth.currentUser;
      const userSnap = await getDoc(doc(db, 'users', user.email));
      const userData = userSnap.data();

      if (!userData) {
        setError('User not found.');
        setLoading(false);
        return;
      }

      const division = userData.division;
      const q = query(
        collection(db, 'matches'),
        where('wager', '==', Number(wager)),
        where('status', '==', 'pending'),
        where('creatorDivision', '==', division)
      );

      const snapshot = await getDocs(q);
      const filtered = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(match => match.creator !== user.email); // Don’t show your own

      setMatches(filtered);
      setLoading(false);
    };

    loadMatches();
  }, [auth.currentUser, wager]);

  const handleAccept = async (match) => {
    const user = auth.currentUser;
    if (!user) return;

    const matchRef = doc(db, 'matches', match.id);
    const creatorRef = doc(db, 'users', match.creator);
    const opponentRef = doc(db, 'users', user.email);

    const [creatorSnap, opponentSnap] = await Promise.all([
      getDoc(creatorRef),
      getDoc(opponentRef),
    ]);

    const creator = creatorSnap.data();
    const opponent = opponentSnap.data();

    if (!creator || !opponent) {
      alert('User not found');
      return;
    }

    if (creator.balance < match.wager || opponent.balance < match.wager) {
      alert('One or both users don’t have enough TC');
      return;
    }

    try {
      // Deduct coins from both
      await updateDoc(creatorRef, {
        balance: creator.balance - match.wager,
      });

      await updateDoc(opponentRef, {
        balance: opponent.balance - match.wager,
      });

      // Update match
      await updateDoc(matchRef, {
        status: 'accepted',
        opponent: user.email,
        acceptedAt: serverTimestamp(),
      });

      router.push(`/match/${match.id}/chat`);
    } catch (err) {
      console.error(err);
      alert('Failed to accept match.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white px-6 py-10">
      <h1 className="text-3xl font-bold mb-6">
        {wager} TC Lobby
      </h1>
      {loading ? (
        <p>Loading matches...</p>
      ) : matches.length === 0 ? (
        <p>No available matches in your division.</p>
      ) : (
        <div className="grid gap-6">
          {matches.map((match) => (
            <div key={match.id} className="bg-gray-800 p-6 rounded shadow">
              <h2 className="text-xl font-bold mb-2">{match.game}</h2>
              <p><strong>Platform:</strong> {match.platform}</p>
              <p><strong>Creator:</strong> {match.creator}</p>
              <p><strong>Status:</strong> {match.status}</p>
              <button
                onClick={() => handleAccept(match)}
                className="mt-4 bg-green-600 hover:bg-green-500 px-4 py-2 rounded text-white font-semibold"
              >
                Accept Match
              </button>
            </div>
          ))}
        </div>
      )}
      {error && <p className="text-red-500 mt-4">{error}</p>}
    </div>
  );
}
