// pages/wallet.js
import { useEffect, useState } from 'react';
import { auth, db } from '../lib/firebase';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';

export default function WalletPage() {
  const [user, setUser] = useState(null);
  const [tc, setTc] = useState(0);
  const [division, setDivision] = useState('');
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (u) => {
      setUser(u);
      if (u) {
        const userRef = doc(db, 'users', u.uid);
        const snap = await getDoc(userRef);
        const data = snap.data();
        setTc(data?.tc || 0);
        setDivision(data?.division || 'Unranked');

        const matchQuery = query(collection(db, 'matches'), where('creatorId', '==', u.uid));
        const matchSnap = await getDocs(matchQuery);
        const historyData = matchSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setHistory(historyData);
      }
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0e0020] via-[#1a0030] to-[#0a001a] text-white px-6 py-10 font-futuristic">
      <h1 className="text-4xl font-bold text-yellow-400 mb-6">💼 Your Wallet</h1>

      {/* Balance Card */}
      <div className="bg-[#1a0033] p-6 rounded-xl shadow-xl flex flex-col sm:flex-row justify-between items-center mb-10">
        <div>
          <p className="text-sm text-gray-400">Current Balance</p>
          <h2 className="text-3xl font-bold text-green-400">🪙 {tc} TC</h2>
        </div>
        <div>
          <p className="text-sm text-gray-400">Division</p>
          <h2 className="text-xl text-yellow-300 font-semibold">📉 {division}</h2>
        </div>
      </div>

      {/* Match History */}
      <div>
        <h2 className="text-2xl font-bold mb-4">📜 Match History</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse">
            <thead>
              <tr className="bg-[#2d0040] text-purple-200">
                <th className="px-4 py-3">Game</th>
                <th className="px-4 py-3">Opponent</th>
                <th className="px-4 py-3">Wager</th>
                <th className="px-4 py-3">Result</th>
                <th className="px-4 py-3">Date</th>
              </tr>
            </thead>
            <tbody>
              {history.map((match) => (
                <tr key={match.id} className="border-b border-[#3a2a5d] hover:bg-[#22002f] transition">
                  <td className="px-4 py-2">{match.game}</td>
                  <td className="px-4 py-2">{match.opponentUsername || 'N/A'}</td>
                  <td className="px-4 py-2">{match.wager} TC</td>
                  <td className="px-4 py-2 text-green-400 font-semibold">{match.result || 'Pending'}</td>
                  <td className="px-4 py-2">{new Date(match.createdAt?.seconds * 1000).toLocaleDateString()}</td>
                </tr>
              ))}
              {history.length === 0 && (
                <tr>
                  <td colSpan="5" className="text-center py-6 text-gray-400">No matches found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
