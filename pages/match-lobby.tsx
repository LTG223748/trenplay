import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { db, auth } from '../lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';

// --- Types for safety ---
interface Match {
  id: string;
  game: string;
  platform: string;
  entryFee: number;
  status: string;
  player1: string;
  player2?: string;
  division: string; // important!
}

interface User {
  uid: string;
  division: string;
  username?: string;
}

export default function MatchLobby() {
  const router = useRouter();
  const { matchId } = router.query as { matchId?: string };
  const [user, userLoading] = useAuthState(auth);
  const [match, setMatch] = useState<Match | null>(null);
  const [loading, setLoading] = useState(true);
  const [userDivision, setUserDivision] = useState<string>('Rookie');
  const [error, setError] = useState<string | null>(null);

  // Fetch match info and user's division
  useEffect(() => {
    if (!matchId || !user) return;
    setLoading(true);

    const fetchData = async () => {
      try {
        // Get match doc
        const matchRef = doc(db, 'matches', matchId);
        const matchSnap = await getDoc(matchRef);

        if (!matchSnap.exists()) {
          setError('Match not found');
          setLoading(false);
          return;
        }

        const matchData = { id: matchSnap.id, ...matchSnap.data() } as Match;
        setMatch(matchData);

        // Get user's division
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);
        const userData = userSnap.data() as User | undefined;

        const division = userData?.division || 'Rookie';
        setUserDivision(division);

        // --- Division Mismatch Check ---
        if (matchData.division && division !== matchData.division) {
          setError(
            `This match is for the "${matchData.division}" division. You are in "${division}". You cannot join.`
          );
        } else {
          setError(null); // clear any previous error
        }
      } catch (err) {
        setError('Failed to load match.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [matchId, user]);

  const handleJoin = async () => {
    if (!match || !user) return;
    if (error) return; // Don't allow join if division mismatch

    try {
      if (!match.player2 && match.player1 !== user.uid) {
        const matchRef = doc(db, 'matches', match.id);
        await updateDoc(matchRef, { player2: user.uid, status: 'in-progress' });
        router.push('/my-matches');
      }
    } catch (err) {
      setError('Failed to join match.');
      console.error(err);
    }
  };

  if (loading || userLoading) return <div className="text-white p-8">Loading...</div>;
  if (!match) return <div className="text-red-400 p-8">Match not found.</div>;

  return (
    <div className="min-h-screen bg-[#0d0d1f] flex flex-col items-center justify-center text-white">
      <div className="bg-[#1a1a2e] p-8 rounded-xl shadow-lg w-full max-w-lg">
        <h1 className="text-2xl font-bold mb-4">Match Lobby</h1>
        <p className="mb-2"><strong>Game:</strong> {match.game}</p>
        <p className="mb-2"><strong>Platform:</strong> {match.platform}</p>
        <p className="mb-2"><strong>Entry Fee:</strong> {match.entryFee} TC</p>
        <p className="mb-2"><strong>Division:</strong> {match.division}</p>
        <p className="mb-4"><strong>Status:</strong> {match.status}</p>

        <div className="mb-6">
          <p><strong>Player 1:</strong> {match.player1 || 'Waiting...'}</p>
          <p><strong>Player 2:</strong> {match.player2 || 'Open slot'}</p>
        </div>

        {error ? (
          <div className="bg-yellow-500 text-black font-semibold p-3 rounded mb-4">{error}</div>
        ) : (
          <>
            {!match.player2 && (
              <button
                onClick={handleJoin}
                className="w-full py-2 bg-yellow-400 hover:bg-yellow-500 text-black font-bold rounded transition"
              >
                Join Match
              </button>
            )}
            {match.player2 && (
              <div className="text-green-400 font-semibold">Match is full.</div>
            )}
          </>
        )}
      </div>
    </div>
  );
}


