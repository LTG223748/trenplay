// components/Bracket.js
import { useEffect, useState } from 'react';
import { db } from '../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

export default function Bracket({ tournamentId }) {
  const [tournament, setTournament] = useState(null);
  const [usernames, setUsernames] = useState({});

  useEffect(() => {
    const fetchTournament = async () => {
      const snap = await getDoc(doc(db, 'tournaments', tournamentId));
      if (snap.exists()) {
        const data = snap.data();
        setTournament(data);

        const allUids = new Set();

        // Get uids from players and all rounds
        (data.players || []).forEach(uid => uid && allUids.add(uid));
        (data.rounds || []).flat().forEach(match => {
          if (match?.player1) allUids.add(match.player1);
          if (match?.player2) allUids.add(match.player2);
          if (match?.winner) allUids.add(match.winner);
        });

        const nameMap = {};
        await Promise.all(
          [...allUids].map(async (uid) => {
            const userSnap = await getDoc(doc(db, 'users', uid));
            if (userSnap.exists()) {
              nameMap[uid] = userSnap.data().username || 'Unknown';
            }
          })
        );

        setUsernames(nameMap);
      }
    };

    fetchTournament();
  }, [tournamentId]);

  if (!tournament) return <p className="text-white">Loading bracket...</p>;

  return (
    <div className="bg-[#2b003f] p-4 rounded-lg shadow-inner text-white">
      <h3 className="text-lg font-bold mb-4">Bracket</h3>

      {(tournament.rounds || []).map((round, i) => (
        <div key={`round-${i}`} className="mb-6">
          <h4 className="text-yellow-300 font-semibold mb-2">Round {i + 1}</h4>
          <div className="space-y-2">
            {round.map((match, j) => {
              const p1 = match?.player1 ? usernames[match.player1] || 'Player 1' : 'TBD';
              const p2 = match?.player2 ? usernames[match.player2] || 'Player 2' : 'TBD';
              const winner =
                match?.winner === match?.player1
                  ? p1
                  : match?.winner === match?.player2
                  ? p2
                  : null;

              return (
                <div
                  key={`match-${i}-${j}`}
                  className="bg-[#3d005f] px-4 py-2 rounded border border-yellow-400 flex justify-between"
                >
                  <span>{p1} vs {p2}</span>
                  {winner && <span className="text-green-400 font-bold">Winner: {winner}</span>}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}