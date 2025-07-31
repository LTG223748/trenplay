import { useEffect, useState } from 'react';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';

export default function Results() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadResults = async () => {
      try {
        const q = query(
          collection(db, 'matches'),
          where('status', '==', 'accepted'),
          orderBy('acceptedAt', 'desc')
        );
        const snapshot = await getDocs(q);
        const matches = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setResults(matches);
      } catch (err) {
        console.error('Failed to fetch results:', err);
      } finally {
        setLoading(false);
      }
    };

    loadResults();
  }, []);

  return (
    <div className="p-8 text-white">
      <h1 className="text-3xl font-bold text-yellow-400 mb-4">📊 Match Results</h1>

      {loading ? (
        <p className="text-gray-400">Loading results...</p>
      ) : results.length === 0 ? (
        <p className="text-gray-500">No recent results yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {results.map((match) => (
            <div key={match.id} className="bg-gray-800 p-6 rounded shadow">
              <h3 className="text-xl font-semibold text-yellow-300">{match.game} — {match.platform}</h3>
              <p className="text-gray-400 text-sm mb-2">
                Creator: {match.creator}<br />
                Opponent: {match.opponent}
              </p>
              <p className="text-green-400 font-medium">Wager: {match.wager} TC</p>
              <p className="text-xs text-gray-500 mt-2">
                Accepted: {match.acceptedAt?.toDate?.().toLocaleString?.() ?? '—'}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
