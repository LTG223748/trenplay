import { useEffect, useState } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../lib/firebase';

export default function Lobbies() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const q = query(
          collection(db, 'matches'),
          where('status', '==', 'pending')
        );
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setMatches(data);
      } catch (err) {
        console.error('Failed to fetch matches', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
  }, []);

  return (
    <div className="p-8 text-white">
      <h1 className="text-3xl font-bold text-yellow-400 mb-4">🕹️ Open Lobbies</h1>

      {loading ? (
        <p className="text-gray-400">Loading matches...</p>
      ) : matches.length === 0 ? (
        <p className="text-gray-500">No matches available right now.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {matches.map(match => (
            <div key={match.id} className="bg-gray-800 p-6 rounded shadow">
              <h3 className="text-xl font-semibold text-yellow-300">{match.game} — {match.platform}</h3>
              <p className="text-sm text-gray-400">Created by: {match.creator}</p>
              <p className="text-green-400 mt-2 font-medium">Wager: {match.wager} TC</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
