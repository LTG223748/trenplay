import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { auth, db } from '../../lib/firebase';
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  getDoc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';

export default function LobbyPage() {
  const router = useRouter();
  const { amount } = router.query;
  const [division, setDivision] = useState('');
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    const fetchDivisionAndMatches = async () => {
      const user = auth.currentUser;
      if (!user || !amount) return;

      setUserEmail(user.email);

      const userRef = doc(db, 'users', user.email);
      const userSnap = await getDoc(userRef);
      if (!userSnap.exists()) return;

      const userDivision = userSnap.data().division || 'Rookie';
      setDivision(userDivision);

      const q = query(
        collection(db, 'matches'),
        where('wager', '==', Number(amount)),
        where('creatorDivision', '==', userDivision),
        where('status', '==', 'pending')
      );

      const unsub = onSnapshot(q, (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setMatches(data);
        setLoading(false);
      });

      return () => unsub();
    };

    fetchDivisionAndMatches();
  }, [amount]);

  const handleAcceptMatch = async (matchId, matchCreator) => {
    const user = auth.currentUser;
    if (!user) return;

    if (user.email === matchCreator) {
      alert("You can't accept your own match.");
      return;
    }

    const matchRef = doc(db, 'matches', matchId);
    await updateDoc(matchRef, {
      opponent: user.email,
      status: 'accepted',
      acceptedAt: serverTimestamp(),
    });

    router.push(`/match/${matchId}/chat`);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white px-6 py-10">
      <h1 className="text-3xl font-bold mb-6">
        🧠 {amount} TC Lobby — {division || '...'} Division
      </h1>

      {loading ? (
        <p>Loading matches...</p>
      ) : matches.length === 0 ? (
        <p>No matches yet in this lobby.</p>
      ) : (
        <div className="grid gap-6">
          {matches.map((match) => (
            <div
              key={match.id}
              className="bg-gray-800 p-6 rounded shadow-md space-y-2"
            >
              <h2 className="text-xl font-bold">{match.game}</h2>
              <p><strong>Platform:</strong> {match.platform}</p>
              <p><strong>Wager:</strong> {match.wager} TC</p>
              <p><strong>Opponent:</strong> {match.opponent || 'Anyone'}</p>
              <p className="text-sm text-gray-400">
                Created by {match.creator} — {match.creatorDivision}
              </p>

              {match.creator === userEmail ? (
                <p className="text-yellow-400">This is your match</p>
              ) : (
                <button
                  onClick={() => handleAcceptMatch(match.id, match.creator)}
                  className="mt-2 bg-yellow-400 text-black font-bold px-4 py-2 rounded hover:bg-yellow-300 transition"
                >
                  Accept Match
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}