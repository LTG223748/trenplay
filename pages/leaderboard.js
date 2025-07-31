// pages/leaderboard.js
import { useEffect, useState } from 'react';
import { collection, getDocs, query, orderBy, limit, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';

const TROPHIES = [
  "🥇", // 1st
  "🥈", // 2nd
  "🥉", // 3rd
];

export default function Leaderboard() {
  const [users, setUsers] = useState([]);
  const currentUser = auth.currentUser;

  useEffect(() => {
    const fetchUsers = async () => {
      const usersRef = collection(db, 'users');
      // Order by wins descending
      const q = query(usersRef, orderBy('wins', 'desc'), limit(20));
      const snap = await getDocs(q);

      const list = snap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setUsers(list);
    };

    fetchUsers();
  }, []);

  const handleChallenge = async (opponentEmail) => {
    const user = auth.currentUser;
    if (!user) return alert("You must be logged in.");
    if (user.email === opponentEmail) return alert("You can't challenge yourself.");
    const wagerAmount = 5;

    try {
      await addDoc(collection(db, 'matches'), {
        creator: user.email,
        opponent: opponentEmail,
        status: 'pending',
        wager: wagerAmount,
        game: 'TBD',
        platform: 'TBD',
        createdAt: serverTimestamp(),
      });
      alert(`Challenge sent to ${opponentEmail}!`);
    } catch (err) {
      console.error(err);
      alert("Failed to send challenge.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#12001a] via-[#2d0140] to-[#0a0815] text-white px-4 py-10 flex flex-col items-center relative overflow-hidden">
      {/* Sparkle Overlay copied from Header */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <span
            key={i}
            className="absolute bg-white rounded-full opacity-70 animate-sparkle"
            style={{
              width: '3px',
              height: '3px',
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${2 + Math.random() * 3}s`,
            }}
          />
        ))}
      </div>

      <h1 className="text-4xl md:text-5xl font-extrabold text-yellow-400 mb-4 text-center drop-shadow-lg tracking-tight z-10">
        🏆 Leaderboard
      </h1>
      <p className="text-lg text-gray-300 mb-10 text-center max-w-xl z-10">
        The top players with the most wins. Want your name up here? Go rack up those W’s!
      </p>

      <div className="w-full max-w-3xl overflow-x-auto bg-[#1a0030] rounded-2xl shadow-2xl border border-purple-800 z-10">
        <table className="min-w-full divide-y divide-[#2a1750]">
          <thead>
            <tr>
              <th className="px-4 py-4 text-yellow-400 text-left text-lg font-bold">#</th>
              <th className="px-4 py-4 text-yellow-400 text-left text-lg font-bold">Player</th>
              <th className="px-4 py-4 text-yellow-400 text-left text-lg font-bold">Division</th>
              <th className="px-4 py-4 text-yellow-400 text-left text-lg font-bold">Wins</th>
              <th className="px-4 py-4 text-yellow-400 text-center text-lg font-bold"></th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center text-gray-400 py-12 text-xl">
                  No users found.
                </td>
              </tr>
            ) : (
              users.map((user, index) => {
                const isMe = currentUser && (user.id === currentUser.uid || user.email === currentUser.email);
                const division = user.division || "Rookie";
                const avatarUrl =
                  user.avatarUrl ||
                  `https://api.dicebear.com/7.x/pixel-art/svg?seed=${encodeURIComponent(user.username || user.email || user.id)}`;

                return (
                  <tr
                    key={user.id}
                    className={`transition ${isMe ? "border-4 border-yellow-300 bg-[#292147]" : "hover:bg-[#23103d]"}`}
                  >
                    {/* Rank & Trophy */}
                    <td className="px-4 py-4 text-2xl font-bold">
                      {TROPHIES[index] || <span className="text-yellow-200">{index + 1}</span>}
                    </td>
                    {/* Player */}
                    <td className="px-4 py-4 flex items-center gap-3 font-semibold">
                      <img
                        src={avatarUrl}
                        alt={user.username || user.email}
                        className="w-10 h-10 rounded-full border-2 border-yellow-400 shadow"
                      />
                      <span>
                        <span className="text-white text-lg font-bold">{user.username || "Unknown"}</span>
                        {user.online && (
                          <span className="ml-2 text-green-400 text-sm font-bold">🟢 Live</span>
                        )}
                        {isMe && (
                          <span className="ml-2 px-2 py-1 rounded bg-yellow-400 text-purple-900 text-xs font-bold">You</span>
                        )}
                      </span>
                    </td>
                    {/* Division */}
                    <td className="px-4 py-4">
                      <span
                        className={`px-3 py-1 rounded-lg font-bold shadow text-base
                          ${
                            division === "Rookie" ? "bg-[#303369] text-blue-300 border border-blue-500"
                            : division === "Pro" ? "bg-[#45308a] text-purple-300 border border-purple-500"
                            : division === "Elite" ? "bg-[#3d423a] text-green-300 border border-green-500"
                            : division === "Legend" ? "bg-[#c8a200] text-black border border-yellow-400"
                            : "bg-[#35313c] text-gray-200"
                          }
                        `}
                      >
                        {division}
                      </span>
                    </td>
                    {/* Wins */}
                    <td className="px-4 py-4 text-yellow-300 font-bold text-lg">
                      {user.wins || 0}
                    </td>
                    {/* Challenge */}
                    <td className="px-4 py-4 text-center">
                      {isMe ? null : (
                        user.online && (
                          <button
                            onClick={() => handleChallenge(user.email)}
                            className="bg-gradient-to-tr from-purple-500 via-yellow-400 to-pink-500 text-black px-4 py-2 rounded-lg font-bold shadow-lg hover:scale-105 transition transform hover:brightness-110"
                          >
                            Challenge
                          </button>
                        )
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      <div className="text-sm text-center text-gray-400 mt-10 max-w-lg z-10">
        Leaderboard based on <b>most wins</b>. Only the best can make the top!
      </div>
      {/* Sparkle Animation Styles */}
      <style jsx>{`
        @keyframes sparkle {
          0%, 100% {
            opacity: 0.7;
            transform: scale(1);
          }
          50% {
            opacity: 0;
            transform: scale(0.5);
          }
        }
        .animate-sparkle {
          animation-name: sparkle;
          animation-iteration-count: infinite;
          animation-timing-function: ease-in-out;
        }
      `}</style>
    </div>
  );
}

